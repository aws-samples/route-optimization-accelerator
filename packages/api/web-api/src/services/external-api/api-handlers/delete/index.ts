/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  CognitoIdentityProviderClient,
  DeleteUserPoolClientCommand,
  DescribeUserPoolClientCommand,
  ResourceNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";
import { GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import {
  ExternalAPI,
  deleteExternalAPIHandler,
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

export const handler = deleteExternalAPIHandler(
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

      const externalApiItem = result.Item! as ExternalAPI;
      let userPoolClient = undefined;

      try {
        userPoolClient = await cognitoClient.send(
          new DescribeUserPoolClientCommand({
            ClientId: externalApiItem.clientId,
            UserPoolId: process.env.USER_POOL_ID!,
          }),
        );
      } catch (err) {
        console.error("Error retrieving the clinet information from Cognito: ");
        console.error(err);

        // if is ResourceNotFoundException do nothing, the client doesn't not exists
        // if is not ResourceNotFoundException then rollback and return an error
        if (!(err instanceof ResourceNotFoundException)) {
          return buildInternalServerError("Error deleting the exteral API");
        }
      }

      if (userPoolClient?.UserPoolClient?.ClientId) {
        await cognitoClient.send(
          new DeleteUserPoolClientCommand({
            ClientId: externalApiItem.clientId,
            UserPoolId: process.env.USER_POOL_ID!,
          }),
        );
      }

      await ddb.send(
        new DeleteCommand({
          TableName: process.env.EXTERNAL_API_TABLE_NAME,
          Key: { id },
        }),
      );

      return {
        statusCode: 200,
        body: {
          deleted: true,
        },
      };
    } catch (err) {
      console.error("Error deleting the external api");
      console.error(err);
    }

    return buildInternalServerError("Unable to delete the External API");
  },
);
