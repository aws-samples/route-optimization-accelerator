/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { CommonDynamoDBTable } from "@route-optimization-accelerator/infra-common";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import * as location from "aws-cdk-lib/aws-location";
import { Construct } from "constructs";
import { ApiHandlers } from "./api-handlers";

export interface PlaceServiceProps {
  placeTracker: location.CfnTracker;
}

export class PlaceService extends Construct {
  public readonly handlers: ApiHandlers;

  public readonly placeTable: ddb.ITable;

  constructor(scope: Construct, id: string, props: PlaceServiceProps) {
    super(scope, id);

    const { placeTracker } = props;

    const placeTable = new CommonDynamoDBTable(this, "PlaceTable", {
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });

    const placeActiveSortedIndex = "PlaceActiveSortedIndex";

    placeTable.addGlobalSecondaryIndex({
      indexName: placeActiveSortedIndex,
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
      placeTable,
      placeTracker,
      placeActiveSortedIndex,
    });
    this.placeTable = placeTable;
  }
}
