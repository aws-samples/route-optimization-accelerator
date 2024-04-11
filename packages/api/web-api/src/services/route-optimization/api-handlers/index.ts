/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { join } from "path";
import { CommonNodejsFunction } from "@route-optimization-accelerator/infra-common";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as location from "aws-cdk-lib/aws-location";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { actions } from "cdk-iam-actions";
import { Construct } from "constructs";

export interface ApiHandlersProps {
  optimizationTaskTable: ddb.ITable;
  optimizationResultTable: ddb.ITable;
  optimizationQueue: sqs.IQueue;
  routeCalculator: location.CfnRouteCalculator;
  optimizationTaskActiveSortedIndexName: string;
}

export class ApiHandlers extends Construct {
  public readonly createRouteOptimization: lambda.IFunction;
  public readonly getRouteOptimization: lambda.IFunction;
  public readonly getRouteOptimizationResult: lambda.IFunction;
  public readonly getRouteOptimizationAssignmentResult: lambda.IFunction;
  public readonly listRouteOptimizations: lambda.IFunction;

  constructor(scope: Construct, id: string, props: ApiHandlersProps) {
    super(scope, id);

    const {
      routeCalculator,
      optimizationQueue,
      optimizationTaskTable,
      optimizationResultTable,
      optimizationTaskActiveSortedIndexName,
    } = props;

    this.createRouteOptimization = new CommonNodejsFunction(
      scope,
      "CreateRouteOptimization",
      {
        entry: join(__dirname, "create", "index.js"),
        description: "Create a route optimization task",
        environment: {
          OPTIMIZATION_TASK_TABLE_NAME: optimizationTaskTable.tableName,
          OPTIMIZATION_QUEUE_URL: optimizationQueue.queueUrl,
        },
        initialPolicy: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [actions.DynamoDB.PUT_ITEM],
            resources: [optimizationTaskTable.tableArn],
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [actions.SQS.SEND_MESSAGE],
            resources: [optimizationQueue.queueArn],
          }),
        ],
      },
    );

    this.getRouteOptimization = new CommonNodejsFunction(
      scope,
      "GetRouteOptimization",
      {
        entry: join(__dirname, "get", "index.js"),
        description: "Get a route optimization task",
        environment: {
          OPTIMIZATION_TASK_TABLE_NAME: optimizationTaskTable.tableName,
        },
        initialPolicy: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [actions.DynamoDB.GET_ITEM],
            resources: [optimizationTaskTable.tableArn],
          }),
        ],
      },
    );

    this.getRouteOptimizationResult = new CommonNodejsFunction(
      scope,
      "GetRouteOptimizationResult",
      {
        entry: join(__dirname, "get-result", "index.js"),
        description: "Get the result of a route optimization task",
        environment: {
          OPTIMIZATION_TASK_TABLE_NAME: optimizationTaskTable.tableName,
          OPTIMIZATION_RESULT_TABLE_NAME: optimizationResultTable.tableName,
        },
        initialPolicy: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [actions.DynamoDB.GET_ITEM],
            resources: [
              optimizationTaskTable.tableArn,
              optimizationResultTable.tableArn,
            ],
          }),
        ],
      },
    );

    this.getRouteOptimizationAssignmentResult = new CommonNodejsFunction(
      scope,
      "GetAssignmentResult",
      {
        entry: join(__dirname, "get-assignment-result", "index.js"),
        description:
          "Get the result of a route optimization assignment with routing details",
        environment: {
          CALCULATOR_NAME: routeCalculator.calculatorName,
          OPTIMIZATION_TASK_TABLE_NAME: optimizationTaskTable.tableName,
          OPTIMIZATION_RESULT_TABLE_NAME: optimizationResultTable.tableName,
        },
        initialPolicy: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["geo:CalculateRouteMatrix", "geo:CalculateRoute"],
            resources: [routeCalculator.attrArn],
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [actions.DynamoDB.GET_ITEM],
            resources: [
              optimizationTaskTable.tableArn,
              optimizationResultTable.tableArn,
            ],
          }),
        ],
      },
    );

    this.listRouteOptimizations = new CommonNodejsFunction(
      scope,
      "ListRouteOptimizations",
      {
        entry: join(__dirname, "list", "index.js"),
        description: "List route optimization tasks",
        environment: {
          OPTIMIZATION_TASK_TABLE_NAME: optimizationTaskTable.tableName,
          OPTIMIZATION_TASK_ACTIVE_SORTED_INDEX:
            optimizationTaskActiveSortedIndexName,
        },
        initialPolicy: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [actions.DynamoDB.QUERY],
            resources: [optimizationTaskTable.tableArn],
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [actions.DynamoDB.QUERY],
            resources: [
              `${optimizationTaskTable.tableArn}/index/${optimizationTaskActiveSortedIndexName}`,
            ],
          }),
        ],
      },
    );
  }
}
