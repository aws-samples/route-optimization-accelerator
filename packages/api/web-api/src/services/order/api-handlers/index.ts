/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { join } from "path";
import { CommonNodejsFunction } from "@route-optimization-accelerator/infra-common";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { actions } from "cdk-iam-actions";
import { Construct } from "constructs";

export interface ApiHandlersProps {
  orderTable: ddb.ITable;
  orderActiveSortedIndex: string;
}

export class ApiHandlers extends Construct {
  public readonly getOrder: lambda.IFunction;
  public readonly listOrders: lambda.IFunction;
  public readonly createOrder: lambda.IFunction;
  public readonly deleteOrder: lambda.IFunction;
  public readonly updateOrder: lambda.IFunction;

  constructor(scope: Construct, id: string, props: ApiHandlersProps) {
    super(scope, id);

    const { orderActiveSortedIndex, orderTable } = props;

    this.createOrder = new CommonNodejsFunction(scope, "CreateOrder", {
      entry: join(__dirname, "create", "index.js"),
      description: "Create an order",
      environment: {
        ORDER_TABLE_NAME: orderTable.tableName,
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [actions.DynamoDB.PUT_ITEM],
          resources: [orderTable.tableArn],
        }),
      ],
    });

    this.listOrders = new CommonNodejsFunction(scope, "ListOrders", {
      entry: join(__dirname, "list", "index.js"),
      description: "List all orders",
      environment: {
        ORDER_TABLE_NAME: orderTable.tableName,
        ORDER_ACTIVE_SORTED_INDEX: orderActiveSortedIndex,
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [actions.DynamoDB.QUERY],
          resources: [orderTable.tableArn],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [actions.DynamoDB.QUERY],
          resources: [`${orderTable.tableArn}/index/${orderActiveSortedIndex}`],
        }),
      ],
    });

    this.getOrder = new CommonNodejsFunction(scope, "GetOrder", {
      entry: join(__dirname, "get", "index.js"),
      description: "Get an existing order",
      environment: {
        ORDER_TABLE_NAME: orderTable.tableName,
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [actions.DynamoDB.GET_ITEM],
          resources: [orderTable.tableArn],
        }),
      ],
    });

    this.deleteOrder = new CommonNodejsFunction(scope, "DeleteOrder", {
      entry: join(__dirname, "delete", "index.js"),
      description: "Delete an existing order",
      environment: {
        ORDER_TABLE_NAME: orderTable.tableName,
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [actions.DynamoDB.GET_ITEM, actions.DynamoDB.DELETE_ITEM],
          resources: [orderTable.tableArn],
        }),
      ],
    });

    this.updateOrder = new CommonNodejsFunction(scope, "UpdateOrder", {
      entry: join(__dirname, "update", "index.js"),
      description: "Update an existing order",
      environment: {
        ORDER_TABLE_NAME: orderTable.tableName,
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [actions.DynamoDB.GET_ITEM, actions.DynamoDB.PUT_ITEM],
          resources: [orderTable.tableArn],
        }),
      ],
    });
  }
}
