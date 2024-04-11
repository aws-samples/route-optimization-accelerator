/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import {
  OptimizationResult,
  getRouteOptimizationResultHandler,
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

export const handler = getRouteOptimizationResultHandler(
  customHeadersInterceptor,
  async ({ input }) => {
    const problemId = input.requestParameters.id;

    try {
      if (!uuid.validate(problemId)) {
        return buildBadRequest("The provided id is not a valid UUID");
      }

      const task = await ddb.send(
        new GetCommand({
          Key: {
            problemId,
          },
          TableName: process.env.OPTIMIZATION_TASK_TABLE_NAME,
        }),
      );

      const result = await ddb.send(
        new GetCommand({
          Key: {
            problemId,
          },
          TableName: process.env.OPTIMIZATION_RESULT_TABLE_NAME,
        }),
      );

      if (!task.Item || !result.Item) {
        return buildNotFound(
          `The item with id '${problemId}' could not be found`,
        );
      }

      return {
        statusCode: 200,
        body: {
          data: result.Item as OptimizationResult,
        },
      };
    } catch (ex) {
      console.error("Error retrieving the item results from the database");
      console.error(ex);
    }

    return buildInternalServerError(
      "Unable to retrieve the optimization results",
    );
  },
);
