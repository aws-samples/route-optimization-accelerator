/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { CommonDynamoDBTable } from "@route-optimization-accelerator/infra-common";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { ApiHandlers } from "./api-handlers";

export interface OrderServiceProps {}

export class OrderService extends Construct {
  public readonly handlers: ApiHandlers;

  public readonly orderTable: ddb.ITable;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const orderTable = new CommonDynamoDBTable(this, "OrderTable", {
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });

    const orderActiveSortedIndex = "OrderActiveSortedIndex";

    orderTable.addGlobalSecondaryIndex({
      indexName: orderActiveSortedIndex,
      partitionKey: {
        name: "isActive",
        type: ddb.AttributeType.STRING,
      },
      sortKey: {
        name: "createdAt",
        type: ddb.AttributeType.NUMBER,
      },
    });

    this.handlers = new ApiHandlers(this, "Handlers", {
      orderTable,
      orderActiveSortedIndex,
    });
    this.orderTable = orderTable;
  }
}
