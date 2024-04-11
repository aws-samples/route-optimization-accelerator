/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { updateExternalAPIHandler } from "@route-optimization-accelerator/web-api-service-typescript-runtime";
import * as uuid from "uuid";
import { getDynamoDBClient } from "../../../../common/defaults";
import {
  buildBadRequest,
  buildInternalServerError,
  buildNotFound,
  customHeadersInterceptor,
} from "../../../../common/lambda-commons";

const ddb = getDynamoDBClient();

export const handler = updateExternalAPIHandler(
  customHeadersInterceptor,
  async ({ input, event }) => {
    try {
      const id = input.requestParameters.id;
      const externalAPIData = input.body.data;
      const username = event.requestContext.authorizer!["x-username"];
      const time = Date.now();

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

      await ddb.send(
        new UpdateCommand({
          TableName: process.env.EXTERNAL_API_TABLE_NAME,
          Key: {
            id,
          },
          UpdateExpression:
            "SET #updatedBy = :updatedBy, #updatedAt = :updatedAt, #enabled = :enabled",
          ExpressionAttributeValues: {
            ":updatedBy": username,
            ":updatedAt": time,
            ":enabled": externalAPIData.enabled,
          },
          ExpressionAttributeNames: {
            "#updatedBy": "updatedBy",
            "#updatedAt": "updatedAt",
            "#enabled": "enabled",
          },
        }),
      );

      return {
        statusCode: 200,
        body: {
          data: {
            ...externalAPIData,
            updatedBy: username,
            updatedAt: time,
          },
        },
      };
    } catch (err) {
      console.error("Error updating the external api");
      console.error(err);
    }

    return buildInternalServerError("Unable to update the External API");
  },
);
