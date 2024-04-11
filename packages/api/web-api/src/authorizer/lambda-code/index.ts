/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import fs from "fs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import {
  AuthorizationType,
  CognitoTokenTypes,
} from "@route-optimization-accelerator/infra-common/lib/types";
import { getAccessToken } from "@route-optimization-accelerator/infra-common/lib/utils";
import type { ExternalAPI } from "@route-optimization-accelerator/web-api-service-typescript-runtime/lib/models";
// eslint-disable-next-line import/no-extraneous-dependencies
import { APIGatewayProxyEvent } from "aws-lambda";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import { defaultDDBClientOptions } from "../../common/defaults";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client, defaultDDBClientOptions);

export type CustomAuthorizerEventType = APIGatewayProxyEvent & {
  type: string;
  methodArn: string;
};
const { AWS_REGION, USER_POOL_ID, APP_EXTERNAL_SCOPE } = process.env;

const getKeyFromKid = (keys: any[], kid: string) =>
  keys.find((q) => q.kid === kid);

export const getJwk = async (kid: string) => {
  const tmpFile = "/tmp/jwk.json";
  let jwkContent = null;

  if (fs.existsSync(tmpFile)) {
    jwkContent = fs.readFileSync(tmpFile, "utf-8");
  }

  if (!jwkContent) {
    const response = await fetch(
      `https://cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`,
    );
    const result = await response.text();

    // store it to avoid performing another http call, the content of the jwk file is public
    fs.writeFileSync(tmpFile, result, "utf-8");

    return getKeyFromKid(JSON.parse(result).keys, kid);
  }

  return getKeyFromKid(JSON.parse(jwkContent).keys, kid);
};

const parseJwtToken = async (token: string): Promise<jwt.JwtPayload> => {
  try {
    // https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) {
      throw new Error(`Cannot decode the token`);
    }

    const pem = jwkToPem(await getJwk(decoded.header.kid!));

    return jwt.verify(token, pem) as jwt.JwtPayload;
  } catch (err: any) {
    console.error(`Error parsing the token`, { err });

    throw new Error(`Error parsing the provided token`);
  }
};

const buildPolicyDocument = (
  userId: string,
  username: string,
  resource: string,
) => ({
  principalId: userId,
  policyDocument: {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: "Allow",
        // TODO: if need restrictions based on user profile, that's where can be applied
        // for now provide access to the resource regardlesss
        // additional scoping can be done here
        // with groups etc.
        Resource: resource,
      },
    ],
  },
  context: {
    ["x-user-id"]: userId,
    ["x-username"]: username,
  },
});

const validateExternalAPI = async (
  clientId: string,
): Promise<ExternalAPI | undefined> => {
  const results = await ddb.send(
    new QueryCommand({
      IndexName: process.env.EXTERNAL_API_CLIENT_ID_INDEX_NAME,
      TableName: process.env.EXTERNAL_API_TABLE_NAME,
      KeyConditionExpression: "#clientId = :clientId",
      ExpressionAttributeNames: { "#clientId": "clientId" },
      ExpressionAttributeValues: { ":clientId": clientId },
    }),
  );

  if (!results.Count) {
    return undefined;
  }

  return results.Items![0] as ExternalAPI;
};

const processAccessTokenFromApiKey = async (
  verifiedAccessToken: jwt.JwtPayload,
  resource: string,
) => {
  console.info("Process Access token from API Key");
  /// the access token in this case is coming from a cognitoUserPool Client
  const issuer = `https://cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}`;

  if (verifiedAccessToken.iss !== issuer) {
    throw new Error("Token issued with a non valid issuer");
  }

  if (verifiedAccessToken.token_use !== CognitoTokenTypes.ACCESS) {
    throw new Error(
      "The provided access token does not have the right token_use",
    );
  }

  // verify if token is expired
  const now = Date.now();
  const nowInSec = Math.floor(now / 1000);

  if (verifiedAccessToken.exp! <= nowInSec) {
    throw new Error("The access token is expired");
  }

  const storedToken = await validateExternalAPI(verifiedAccessToken.client_id);

  if (!storedToken) {
    throw new Error(
      "The provided External API belongs to an entity that does not exist anymore in the db",
    );
  }

  if (!storedToken.enabled) {
    throw new Error("The provided External API is disabled");
  }

  const expirationDate = dayjs(storedToken.createdAt)
    .add(storedToken.validFor, "days")
    .valueOf();

  if (expirationDate < Date.now()) {
    throw new Error("The provided External API has expired");
  }

  return buildPolicyDocument(
    storedToken.createdBy!,
    storedToken.createdBy!,
    resource,
  );
};

const processIdToken = async (
  verifiedAccessToken: jwt.JwtPayload,
  resource: string,
) => {
  console.debug("Processing access token");
  const issuer = `https://cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}`;

  if (verifiedAccessToken.iss !== issuer) {
    throw new Error("Token issued with a non valid issuer");
  }

  if (verifiedAccessToken.token_use !== CognitoTokenTypes.ID) {
    throw new Error(
      "The provided access token does not have the right token_use",
    );
  }
  // verify if token is expired
  const nowInSec = Math.floor(Date.now() / 1000);
  if (verifiedAccessToken.exp! <= nowInSec) {
    throw new Error("The token is expired");
  }

  // set the preferred username as principal, if available, otherwise uses the normal username
  const username = verifiedAccessToken["cognito:username"];
  const userId = verifiedAccessToken.email || username;

  return buildPolicyDocument(userId, username, resource);
};

export const handler = async (
  event: CustomAuthorizerEventType,
  context: any = {},
): Promise<any> => {
  try {
    const auth =
      event.headers.Authorization || event.headers.authorization || "";
    const [type, token] = auth.split(" ");

    if (!type || !token) {
      throw new Error("Missing type or token in the Authorization header");
    }

    let tokenToProcesss = token;
    let lowerType = type.toLocaleLowerCase();

    // exchange the API Key for a token
    if (lowerType === AuthorizationType.API_KEY) {
      console.debug("Retrieving access token from API KEY");
      // retrieve the access token
      tokenToProcesss = await getAccessToken(token);
      // set the auth as Bearer as the API was exchanged for a bearer token
      lowerType = AuthorizationType.BEARER;
    }

    // token coming from UI or
    // if the auth type is API_KEY the tokenToProcesss contains
    // the Cognito auth token retrieved by using the API key provided initially in the token value
    if (lowerType === AuthorizationType.BEARER) {
      const verifiedAccessToken = await parseJwtToken(tokenToProcesss);

      // the APP_EXTERNAL_SCOPE is only available for access tokens that are generated from API Keys
      if (verifiedAccessToken.scope === APP_EXTERNAL_SCOPE) {
        // this is the external API Key
        return await processAccessTokenFromApiKey(
          verifiedAccessToken,
          event.methodArn,
        );
      }

      // otherwise, this is the logged user from the UI
      return await processIdToken(verifiedAccessToken, event.methodArn);
    }

    throw new Error(`Unsupported token type ${lowerType}`);
  } catch (err) {
    console.warn("Error processing the request");
    console.warn(err);

    // this is required to avoid { message: null } in response
    return context.fail("Unauthorized");
  }
};
