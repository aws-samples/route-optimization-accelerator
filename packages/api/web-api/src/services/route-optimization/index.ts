/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { CommonDynamoDBTable } from "@route-optimization-accelerator/infra-common";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import * as events from "aws-cdk-lib/aws-events";
import * as location from "aws-cdk-lib/aws-location";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { ApiHandlers } from "./api-handlers";
import { EventHandlers } from "./event-handlers";

export interface RouteOptimizationServiceProps {
  optimizationQueue: sqs.IQueue;
  routeCalculator: location.CfnRouteCalculator;
  eventBus: events.IEventBus;
}

export class RouteOptimizationService extends Construct {
  public readonly handlers: ApiHandlers;

  constructor(
    scope: Construct,
    id: string,
    props: RouteOptimizationServiceProps,
  ) {
    super(scope, id);

    const { optimizationQueue, routeCalculator, eventBus } = props;

    const optimizationTaskTable = new CommonDynamoDBTable(this, "TaskTable", {
      partitionKey: {
        name: "problemId",
        type: ddb.AttributeType.STRING,
      },
    });

    const optimizationTaskActiveSortedIndexName =
      "OptimizationTaskActiveSortedIndex";
    optimizationTaskTable.addGlobalSecondaryIndex({
      indexName: optimizationTaskActiveSortedIndexName,
      partitionKey: {
        name: "isActive",
        type: ddb.AttributeType.STRING,
      },
      sortKey: {
        name: "createdAt",
        type: ddb.AttributeType.NUMBER,
      },
    });

    const optimizationResultTable = new CommonDynamoDBTable(
      this,
      "ResultTable",
      {
        partitionKey: {
          name: "problemId",
          type: ddb.AttributeType.STRING,
        },
      },
    );

    new EventHandlers(this, "Events", {
      eventBus,
      optimizationQueue,
      optimizationTaskTable,
      optimizationResultTable,
    });

    this.handlers = new ApiHandlers(this, "Handlers", {
      routeCalculator,
      optimizationQueue,
      optimizationTaskTable,
      optimizationResultTable,
      optimizationTaskActiveSortedIndexName,
    });
  }
}
