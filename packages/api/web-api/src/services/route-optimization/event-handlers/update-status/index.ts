/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  EVENT_NAME,
  SERVICE_NAME,
} from "@route-optimization-accelerator/infra-common/lib/constants";
import type { OptimizationStatus } from "@route-optimization-accelerator/web-api-service-typescript-runtime";
// eslint-disable-next-line import/no-extraneous-dependencies
import type { EventBridgeEvent } from "aws-lambda/trigger/eventbridge";
import { getDynamoDBClient } from "../../../../common/defaults";

const ddb = getDynamoDBClient();

export interface OptimizationDetailType {
  problemId: string;
  solverDuration: number;
  score: {
    hard: number;
    medium: number;
    soft: number;
  };
  error?: {
    errorMessage: string;
    errorDetails: string;
  };
  metadata?: {
    // full structure in https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-metadata-endpoint-v4-fargate.html
    ecsStatsMetadata: any;
    ecsTaskMetadata: any;
    ecsContainerMetadata: {
      [key: string]: any;
      LogOptions: {
        "awslogs-group": string;
        "awslogs-region": string;
        "awslogs-stream": string;
      };
    };
  };
}

const updateOptimizationTaskTableStatus = async (
  problemId: string,
  newStatus: OptimizationStatus,
) =>
  ddb.send(
    new UpdateCommand({
      TableName: process.env.OPTIMIZATION_TASK_TABLE_NAME,
      Key: {
        problemId: problemId,
      },
      UpdateExpression: "SET #status = :status, #updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":status": newStatus,
        ":updatedAt": Date.now(),
      },
      ExpressionAttributeNames: {
        "#status": "status",
        "#updatedAt": "updatedAt",
      },
    }),
  );

const writeResultItem = async (data: OptimizationDetailType) =>
  ddb.send(
    new PutCommand({
      TableName: process.env.OPTIMIZATION_RESULT_TABLE_NAME,
      Item: data,
    }),
  );

const handleMetadataUpdate = async (detail: OptimizationDetailType) => {
  try {
    await ddb.send(
      new UpdateCommand({
        TableName: process.env.OPTIMIZATION_TASK_TABLE_NAME,
        Key: {
          problemId: detail.problemId,
        },
        UpdateExpression:
          "SET #executionDetails = if_not_exists(#executionDetails, :log_data), #updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":updatedAt": Date.now(),
          ":log_data": {
            log: {
              region:
                detail.metadata?.ecsContainerMetadata.LogOptions[
                  "awslogs-region"
                ],
              group:
                detail.metadata?.ecsContainerMetadata.LogOptions[
                  "awslogs-group"
                ],
              stream:
                detail.metadata?.ecsContainerMetadata.LogOptions[
                  "awslogs-stream"
                ],
            },
          },
        },
        ExpressionAttributeNames: {
          "#executionDetails": "executionDetails",
          "#updatedAt": "updatedAt",
        },
      }),
    );
  } catch (err) {
    console.error("Error handling 'metadata' event");
    console.error(err);
  }

  return { error: true };
};

const handleInProgressEvent = async (detail: OptimizationDetailType) => {
  try {
    await updateOptimizationTaskTableStatus(detail.problemId, "IN_PROGRESS");

    return { error: false };
  } catch (err) {
    console.error("Error handling 'in progress' event");
    console.error(err);
  }

  return { error: true };
};
const handleCompleteEvent = async (detail: OptimizationDetailType) => {
  try {
    await updateOptimizationTaskTableStatus(
      detail.problemId,
      // if hard constraint is violated then
      detail.score.hard === 0 ? "SUCCESS" : "WARNING",
    );
    await writeResultItem(detail);

    return { error: false };
  } catch (err) {
    console.error("Error handling 'complete' event");
    console.error(err);
  }

  return { error: true };
};
const handleErrorEvent = async (detail: OptimizationDetailType) => {
  try {
    await updateOptimizationTaskTableStatus(detail.problemId, "ERROR");
    await writeResultItem(detail);

    return { error: false };
  } catch (err) {
    console.error("Error handling 'error' event");
    console.error(err);
  }

  return { error: true };
};

const commandHandler = {
  [EVENT_NAME[SERVICE_NAME.OPTIMIZATION].OPTIMIZATION_METADATA_UPDATE]:
    handleMetadataUpdate,
  [EVENT_NAME[SERVICE_NAME.OPTIMIZATION].OPTIMIZATION_IN_PROGRESS]:
    handleInProgressEvent,
  [EVENT_NAME[SERVICE_NAME.OPTIMIZATION].OPTIMIZATION_COMPLETED]:
    handleCompleteEvent,
  [EVENT_NAME[SERVICE_NAME.OPTIMIZATION].OPTIMIZATION_ERROR]: handleErrorEvent,
};

export const handler = async (
  input: EventBridgeEvent<string, OptimizationDetailType>,
) => {
  console.debug(`Event: ${JSON.stringify(input, null, 2)}`);

  if (input.source != SERVICE_NAME.OPTIMIZATION) {
    console.error(`Source ${input.source} is not supported`);
    return;
  }

  if (!input.detail.problemId) {
    console.error(`Empty problemId, cannot sync the status in the db`);
    return;
  }

  const exists = await ddb.send(
    new GetCommand({
      TableName: process.env.OPTIMIZATION_TASK_TABLE_NAME,
      Key: { problemId: input.detail.problemId },
    }),
  );

  if (!exists.Item) {
    console.error(
      `Optimization task with id ${input.detail.problemId} does not exists`,
    );

    return;
  }

  if (commandHandler[input["detail-type"]] == null) {
    console.error(`Detail type ${input["detail-type"]} is not supported!`);
    return;
  }

  const result = await commandHandler[input["detail-type"]](input.detail);

  console.debug(`Detail type ${input["detail-type"]} executed`);
  console.debug("Result: ", result);

  return result;
};
