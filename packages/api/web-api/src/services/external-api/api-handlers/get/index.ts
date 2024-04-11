/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import {
  ExternalAPI,
  getExternalAPIHandler,
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

export const handler = getExternalAPIHandler(
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

      return {
        statusCode: 200,
        body: {
          data: result.Item as ExternalAPI,
        },
      };
    } catch (err) {
      console.error("Error retrieving the external API");
      console.error(err);
    }

    return buildInternalServerError("Unable to retrieve the External API");
  },
);
