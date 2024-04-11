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
import { actions } from "cdk-iam-actions";
import { Construct } from "constructs";

export interface ApiHandlersProps {
  fleetTracker: location.CfnTracker;
  fleetTable: ddb.ITable;
  fleetActiveSortedIndex: string;
}

export class ApiHandlers extends Construct {
  public readonly getFleet: lambda.IFunction;
  public readonly listFleet: lambda.IFunction;
  public readonly createFleet: lambda.IFunction;
  public readonly deleteFleet: lambda.IFunction;
  public readonly updateFleet: lambda.IFunction;
  public readonly getFleetPositionHistory: lambda.IFunction;
  public readonly getFleetCurrentPosition: lambda.IFunction;
  public readonly updateFleetCurrentPosition: lambda.IFunction;
  public readonly listFleetPositions: lambda.IFunction;

  constructor(scope: Construct, id: string, props: ApiHandlersProps) {
    super(scope, id);

    const { fleetActiveSortedIndex, fleetTable, fleetTracker } = props;

    this.createFleet = new CommonNodejsFunction(scope, "CreateFleet", {
      entry: join(__dirname, "create", "index.js"),
      description: "Create a fleet member",
      environment: {
        FLEET_TABLE_NAME: fleetTable.tableName,
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [actions.DynamoDB.PUT_ITEM],
          resources: [fleetTable.tableArn],
        }),
      ],
    });

    this.listFleet = new CommonNodejsFunction(scope, "ListFleet", {
      entry: join(__dirname, "list", "index.js"),
      description: "List all fleet members",
      environment: {
        FLEET_TABLE_NAME: fleetTable.tableName,
        FLEET_ACTIVE_SORTED_INDEX: fleetActiveSortedIndex,
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [actions.DynamoDB.QUERY],
          resources: [fleetTable.tableArn],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [actions.DynamoDB.QUERY],
          resources: [`${fleetTable.tableArn}/index/${fleetActiveSortedIndex}`],
        }),
      ],
    });

    this.getFleet = new CommonNodejsFunction(scope, "GetFleet", {
      entry: join(__dirname, "get", "index.js"),
      description: "Get an existing fleet member",
      environment: {
        FLEET_TABLE_NAME: fleetTable.tableName,
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [actions.DynamoDB.GET_ITEM],
          resources: [fleetTable.tableArn],
        }),
      ],
    });

    this.deleteFleet = new CommonNodejsFunction(scope, "DeleteFleet", {
      entry: join(__dirname, "delete", "index.js"),
      description: "Delete an existing fleet member",
      environment: {
        FLEET_TABLE_NAME: fleetTable.tableName,
        FLEET_TRACKER: fleetTracker.trackerName,
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [actions.DynamoDB.GET_ITEM, actions.DynamoDB.DELETE_ITEM],
          resources: [fleetTable.tableArn],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: [fleetTracker.attrArn],
          actions: ["geo:BatchDeleteDevicePositionHistory"],
        }),
      ],
    });

    this.updateFleet = new CommonNodejsFunction(scope, "UpdateFleet", {
      entry: join(__dirname, "update", "index.js"),
      description: "Update an existing fleet member",
      environment: {
        FLEET_TABLE_NAME: fleetTable.tableName,
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [actions.DynamoDB.GET_ITEM, actions.DynamoDB.PUT_ITEM],
          resources: [fleetTable.tableArn],
        }),
      ],
    });

    this.getFleetPositionHistory = new CommonNodejsFunction(
      scope,
      "GetFleetPositionHistory",
      {
        entry: join(__dirname, "get-position-history", "index.js"),
        description: "Get an existing fleet position history",
        environment: {
          FLEET_TABLE_NAME: fleetTable.tableName,
          FLEET_TRACKER: fleetTracker.trackerName,
        },
        initialPolicy: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [actions.DynamoDB.GET_ITEM],
            resources: [fleetTable.tableArn],
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: [fleetTracker.attrArn],
            actions: ["geo:GetDevicePositionHistory"],
          }),
        ],
      },
    );

    this.getFleetCurrentPosition = new CommonNodejsFunction(
      scope,
      "GetFleetCurrentPosition",
      {
        entry: join(__dirname, "get-position", "index.js"),
        description: "Get an existing fleet current position",
        environment: {
          FLEET_TABLE_NAME: fleetTable.tableName,
          FLEET_TRACKER: fleetTracker.trackerName,
        },
        initialPolicy: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [actions.DynamoDB.GET_ITEM],
            resources: [fleetTable.tableArn],
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: [fleetTracker.attrArn],
            actions: ["geo:GetDevicePosition"],
          }),
        ],
      },
    );

    this.updateFleetCurrentPosition = new CommonNodejsFunction(
      scope,
      "UpdateFleetCurrentPosition",
      {
        entry: join(__dirname, "update-position", "index.js"),
        description: "Update an existing fleet current position",
        environment: {
          FLEET_TABLE_NAME: fleetTable.tableName,
          FLEET_TRACKER: fleetTracker.trackerName,
        },
        initialPolicy: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [actions.DynamoDB.GET_ITEM],
            resources: [fleetTable.tableArn],
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: [fleetTracker.attrArn],
            actions: ["geo:BatchUpdateDevicePosition"],
          }),
        ],
      },
    );

    this.listFleetPositions = new CommonNodejsFunction(
      scope,
      "ListFleetPositions",
      {
        entry: join(__dirname, "list-positions", "index.js"),
        description: "List the fleet based on the input position",
        environment: {
          FLEET_TRACKER: fleetTracker.trackerName,
        },
        initialPolicy: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: [fleetTracker.attrArn],
            actions: ["geo:ListDevicePositions"],
          }),
        ],
      },
    );
  }
}
