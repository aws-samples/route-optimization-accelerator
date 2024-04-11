/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { updateOrderHandler } from "@route-optimization-accelerator/web-api-service-typescript-runtime";
import * as uuid from "uuid";
import { getDynamoDBClient } from "../../../../common/defaults";
import {
  buildBadRequest,
  buildInternalServerError,
  buildNotFound,
  customHeadersInterceptor,
} from "../../../../common/lambda-commons";

const ddb = getDynamoDBClient();

export const handler = updateOrderHandler(
  customHeadersInterceptor,
  async ({ input }) => {
    try {
      const id = input.requestParameters.id;
      const orderData = input.body.data;
      const time = Date.now();

      if (!uuid.validate(id)) {
        return buildBadRequest("The provided id is not a valid UUID");
      }

      const result = await ddb.send(
        new GetCommand({
          Key: {
            id,
          },
          TableName: process.env.ORDER_TABLE_NAME,
        }),
      );

      if (!result.Item) {
        return buildNotFound(`The item with id '${id}' could not be found`);
      }

      const updatedData = {
        ...orderData,
        updatedAt: time,
      };

      await ddb.send(
        new PutCommand({
          Item: updatedData,
          TableName: process.env.ORDER_TABLE_NAME,
        }),
      );

      return {
        statusCode: 200,
        body: {
          data: updatedData,
        },
      };
    } catch (err) {
      console.error("Error updating the order");
      console.error(err);
    }

    return buildInternalServerError("Unable to update the order");
  },
);
