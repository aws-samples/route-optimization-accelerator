/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  CognitoIdentityProviderClient,
  DescribeUserPoolClientCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import {
  ExternalAPI,
  getExternalAPISecretHandler,
} from "@route-optimization-accelerator/web-api-service-typescript-runtime";
import * as uuid from "uuid";
import { getDynamoDBClient } from "../../../../common/defaults";
import {
  buildBadRequest,
  buildInternalServerError,
  buildNotFound,
  customHeadersInterceptor,
} from "../../../../common/lambda-commons";

const ddb = getDynamoDBClient();
const cognitoClient = new CognitoIdentityProviderClient({});

export const handler = getExternalAPISecretHandler(
  customHeadersInterceptor,
  async ({ input }) => {
    try {
      const id = input.requestParameters.id;
      if (!uuid.validate(id)) {
        return buildBadRequest("The provided id is not a valid UUID");
      }

      const result = await ddb.send(
        new GetCommand({
          Key: {
            id,
          },
          TableName: process.env.EXTERNAL_API_TABLE_NAME,
        }),
      );

      if (!result.Item) {
        return buildNotFound(`The item with id '${id}' could not be found`);
      }

      const externalApiResult = result.Item as ExternalAPI;
      const userPoolClient = await cognitoClient.send(
        new DescribeUserPoolClientCommand({
          ClientId: externalApiResult.clientId,
          UserPoolId: process.env.USER_POOL_ID!,
        }),
      );
      const clientId = userPoolClient.UserPoolClient!.ClientId;
      const clientSecret = userPoolClient.UserPoolClient!.ClientSecret;
      const apiKey = clientSecret
        ? Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
        : undefined;

      return {
        statusCode: 200,
        body: {
          data: {
            ...externalApiResult,
            apiKey,
          },
        },
      };
    } catch (err) {
      console.error("Error retrieving the external API");
      console.error(err);
    }

    return buildInternalServerError("Unable to retrieve the External API");
  },
);
