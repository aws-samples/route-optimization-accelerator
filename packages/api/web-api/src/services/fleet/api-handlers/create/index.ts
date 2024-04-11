/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import {
  Fleet,
  createFleetHandler,
} from "@route-optimization-accelerator/web-api-service-typescript-runtime";
import * as uuid from "uuid";
import { getDynamoDBClient } from "../../../../common/defaults";
import {
  buildBadRequest,
  buildInternalServerError,
  customHeadersInterceptor,
} from "../../../../common/lambda-commons";

const ddb = getDynamoDBClient();

export const handler = createFleetHandler(
  customHeadersInterceptor,
  async ({ input }) => {
    console.debug("Input: ", JSON.stringify(input, null, 2));
    const createRequest = input.body.data;

    try {
      if (!uuid.validate(createRequest.id)) {
        return buildBadRequest("The provided id is not a valid UUID");
      }

      const time = Date.now();
      const obj: Fleet = {
        ...createRequest,
        isActive: "Y",
        createdAt: time,
        updatedAt: time,
      };

      await ddb.send(
        new PutCommand({
          Item: obj,
          TableName: process.env.FLEET_TABLE_NAME,
        }),
      );

      return {
        statusCode: 200,
        body: {
          data: obj,
        },
      };
    } catch (ex) {
      console.error("Error writing the item in the database");
      console.error(ex);
    }

    return buildInternalServerError("Unable to persist the fleet member");
  },
);
