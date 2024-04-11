/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { CommonDynamoDBTable } from "@route-optimization-accelerator/infra-common";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import * as location from "aws-cdk-lib/aws-location";
import { Construct } from "constructs";
import { ApiHandlers } from "./api-handlers";

export interface FleetServiceProps {
  fleetTracker: location.CfnTracker;
}

export class FleetService extends Construct {
  public readonly handlers: ApiHandlers;

  public readonly fleetTable: ddb.ITable;

  constructor(scope: Construct, id: string, props: FleetServiceProps) {
    super(scope, id);

    const { fleetTracker } = props;

    const fleetTable = new CommonDynamoDBTable(this, "FleetTable", {
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });

    const fleetActiveSortedIndex = "FleetActiveSortedIndex";

    fleetTable.addGlobalSecondaryIndex({
      indexName: fleetActiveSortedIndex,
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
      fleetTracker,
      fleetTable,
      fleetActiveSortedIndex,
    });
    this.fleetTable = fleetTable;
  }
}
