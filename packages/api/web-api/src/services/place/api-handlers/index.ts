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
  placeTable: ddb.ITable;
  placeActiveSortedIndex: string;
  placeTracker: location.CfnTracker;
}

export class ApiHandlers extends Construct {
  public readonly getPlace: lambda.IFunction;
  public readonly listPlaces: lambda.IFunction;
  public readonly createPlace: lambda.IFunction;
  public readonly deletePlace: lambda.IFunction;
  public readonly updatePlace: lambda.IFunction;
  public readonly listPlacePositions: lambda.IFunction;

  constructor(scope: Construct, id: string, props: ApiHandlersProps) {
    super(scope, id);

    const { placeActiveSortedIndex, placeTable, placeTracker } = props;

    this.createPlace = new CommonNodejsFunction(scope, "CreatePlace", {
      entry: join(__dirname, "create", "index.js"),
      description: "Create a place",
      environment: {
        PLACE_TABLE_NAME: placeTable.tableName,
        PLACE_TRACKER: placeTracker.trackerName,
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [actions.DynamoDB.PUT_ITEM],
          resources: [placeTable.tableArn],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: [placeTracker.attrArn],
          actions: ["geo:BatchUpdateDevicePosition"],
        }),
      ],
    });

    this.listPlaces = new CommonNodejsFunction(scope, "ListPlaces", {
      entry: join(__dirname, "list", "index.js"),
      description: "List all places",
      environment: {
        PLACE_TABLE_NAME: placeTable.tableName,
        PLACE_ACTIVE_SORTED_INDEX: placeActiveSortedIndex,
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [actions.DynamoDB.QUERY],
          resources: [placeTable.tableArn],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [actions.DynamoDB.QUERY],
          resources: [`${placeTable.tableArn}/index/${placeActiveSortedIndex}`],
        }),
      ],
    });

    this.getPlace = new CommonNodejsFunction(scope, "GetPlace", {
      entry: join(__dirname, "get", "index.js"),
      description: "Get an existing Place",
      environment: {
        PLACE_TABLE_NAME: placeTable.tableName,
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [actions.DynamoDB.GET_ITEM],
          resources: [placeTable.tableArn],
        }),
      ],
    });

    this.deletePlace = new CommonNodejsFunction(scope, "DeletePlace", {
      entry: join(__dirname, "delete", "index.js"),
      description: "Delete an existing place",
      environment: {
        PLACE_TABLE_NAME: placeTable.tableName,
        PLACE_TRACKER: placeTracker.trackerName,
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [actions.DynamoDB.GET_ITEM, actions.DynamoDB.DELETE_ITEM],
          resources: [placeTable.tableArn],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: [placeTracker.attrArn],
          actions: ["geo:BatchDeleteDevicePositionHistory"],
        }),
      ],
    });

    this.updatePlace = new CommonNodejsFunction(scope, "UpdatePlace", {
      entry: join(__dirname, "update", "index.js"),
      description: "Update an existing place",
      environment: {
        PLACE_TABLE_NAME: placeTable.tableName,
        PLACE_TRACKER: placeTracker.trackerName,
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [actions.DynamoDB.GET_ITEM, actions.DynamoDB.UPDATE_ITEM],
          resources: [placeTable.tableArn],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: [placeTracker.attrArn],
          actions: ["geo:BatchUpdateDevicePosition"],
        }),
      ],
    });

    this.listPlacePositions = new CommonNodejsFunction(
      scope,
      "ListFleetPositions",
      {
        entry: join(__dirname, "list-positions", "index.js"),
        description: "List the places based on the input position",
        environment: {
          PLACE_TRACKER: placeTracker.trackerName,
        },
        initialPolicy: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: [placeTracker.attrArn],
            actions: ["geo:ListDevicePositions"],
          }),
        ],
      },
    );
  }
}
