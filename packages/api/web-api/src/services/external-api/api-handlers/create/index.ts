/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  CognitoIdentityProviderClient,
  CreateUserPoolClientCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import {
  ExternalAPI,
  createExternalAPIHandler,
} from "@route-optimization-accelerator/web-api-service-typescript-runtime";
import { getDynamoDBClient } from "../../../../common/defaults";
import {
  buildBadRequest,
  buildInternalServerError,
  customHeadersInterceptor,
} from "../../../../common/lambda-commons";

const ddb = getDynamoDBClient();
const cognitoClient = new CognitoIdentityProviderClient({});
const createCognitoUserPoolClient = (clientName: string) =>
  cognitoClient.send(
    new CreateUserPoolClientCommand({
      ClientName: clientName,
      UserPoolId: process.env.USER_POOL_ID!,
      AllowedOAuthFlows: ["client_credentials"],
      IdTokenValidity: 1,
      AccessTokenValidity: 1,
      RefreshTokenValidity: 1,
      TokenValidityUnits: {
        IdToken: "hours",
        AccessToken: "hours",
        RefreshToken: "days",
      },
      GenerateSecret: true,
      SupportedIdentityProviders: ["COGNITO"],
      AllowedOAuthScopes: [process.env.DEFAULT_SCOPE!],
      AllowedOAuthFlowsUserPoolClient: true,
    }),
  );

export const handler = createExternalAPIHandler(
  customHeadersInterceptor,
  async ({ input, event }) => {
    try {
      const time = Date.now();
      const apiData = input.body.data;
      const userClient = await createCognitoUserPoolClient(apiData.name);
      const clientId = userClient.UserPoolClient!.ClientId;
      const clientSecret = userClient.UserPoolClient!.ClientSecret;
      const apiKey = clientSecret
        ? Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
        : undefined;
      const username = event.requestContext.authorizer!["x-username"];
      const obj: ExternalAPI = {
        ...apiData,
        isActive: "Y",
        clientId,
        createdBy: username,
        updatedBy: username,
        createdAt: time,
        updatedAt: time,
      };

      const maxDuration = Number(process.env.MAXIMUM_API_DURATION_DAYS);
      if (obj.validFor >= maxDuration) {
        return buildBadRequest(
          `The provided validity of the token is beyond the allowed limit of ${maxDuration} days.`,
        );
      }

      await ddb.send(
        new PutCommand({
          Item: obj,
          TableName: process.env.EXTERNAL_API_TABLE_NAME,
        }),
      );

      return {
        statusCode: 200,
        body: {
          data: {
            ...obj,
            authUrl: `https://${process.env.COGNITO_DOMAIN}/oauth2/token`,
            apiKey,
          },
        },
      };
    } catch (err) {
      console.error("Error creating external API");
      console.error(err);
    }

    return buildInternalServerError("Unable to create the External API");
  },
);
