/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { join } from "path";
import {
  CommonNodejsFunction,
  EVENT_NAME,
  SERVICE_NAME,
} from "@route-optimization-accelerator/infra-common";
import { Duration } from "aws-cdk-lib";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { actions } from "cdk-iam-actions";
import { Construct } from "constructs";

export interface EventHandlersProps {
  optimizationQueue: sqs.IQueue;
  optimizationTaskTable: ddb.ITable;
  optimizationResultTable: ddb.ITable;
  eventBus: events.IEventBus;
}

export class EventHandlers extends Construct {
  constructor(scope: Construct, id: string, props: EventHandlersProps) {
    super(scope, id);

    const { optimizationTaskTable, optimizationResultTable, eventBus } = props;

    const fn = new CommonNodejsFunction(scope, "UpdateResultStatus", {
      entry: join(__dirname, "update-status", "index.js"),
      description:
        "Update route optimization item status after the engine processes the queue message",
      environment: {
        OPTIMIZATION_TASK_TABLE_NAME: optimizationTaskTable.tableName,
        OPTIMIZATION_RESULT_TABLE_NAME: optimizationResultTable.tableName,
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            actions.DynamoDB.UPDATE_ITEM,
            actions.DynamoDB.PUT_ITEM,
            actions.DynamoDB.GET_ITEM,
          ],
          resources: [
            optimizationTaskTable.tableArn,
            optimizationResultTable.tableArn,
          ],
        }),
      ],
    });

    const rule = new events.Rule(this, "OptimizationRule", {
      eventBus,
      eventPattern: {
        source: [SERVICE_NAME.OPTIMIZATION],
        detailType: [
          EVENT_NAME[SERVICE_NAME.OPTIMIZATION].OPTIMIZATION_METADATA_UPDATE,
          EVENT_NAME[SERVICE_NAME.OPTIMIZATION].OPTIMIZATION_IN_PROGRESS,
          EVENT_NAME[SERVICE_NAME.OPTIMIZATION].OPTIMIZATION_COMPLETED,
          EVENT_NAME[SERVICE_NAME.OPTIMIZATION].OPTIMIZATION_ERROR,
        ],
      },
    });

    const queue = new sqs.Queue(this, "DeadLetterQueue", {
      enforceSSL: true,
    });

    rule.addTarget(
      new targets.LambdaFunction(fn, {
        deadLetterQueue: queue,
        maxEventAge: Duration.hours(1),
        retryAttempts: 5,
      }),
    );
  }
}
