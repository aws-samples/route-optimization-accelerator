/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import {
  Optimization,
  createRouteOptimizationHandler,
} from "@route-optimization-accelerator/web-api-service-typescript-runtime";
import * as uuid from "uuid";
import { getDynamoDBClient } from "../../../../common/defaults";
import {
  buildBadRequest,
  buildInternalServerError,
  customHeadersInterceptor,
} from "../../../../common/lambda-commons";

const sqs = new SQSClient({});
const ddb = getDynamoDBClient();

export const handler = createRouteOptimizationHandler(
  customHeadersInterceptor,
  async ({ input }) => {
    console.debug("Input: ", JSON.stringify(input, null, 2));
    const createRequest = input.body.data;

    try {
      if (!uuid.validate(createRequest.problemId)) {
        return buildBadRequest("The provided problemId is not a valid UUID");
      }
      const time = Date.now();
      const obj: Optimization = {
        ...createRequest,
        isActive: "Y",
        status: "PENDING",
        createdAt: time,
        updatedAt: time,
      };

      await ddb.send(
        new PutCommand({
          Item: obj,
          TableName: process.env.OPTIMIZATION_TASK_TABLE_NAME,
        }),
      );

      await sqs.send(
        new SendMessageCommand({
          MessageBody: JSON.stringify(obj),
          QueueUrl: process.env.OPTIMIZATION_QUEUE_URL,
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

    return buildInternalServerError("Unable to write the optimization request");
  },
);
