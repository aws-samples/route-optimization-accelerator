/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { join } from "path";
import { CommonNodejsFunction } from "@route-optimization-accelerator/infra-common";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { actions } from "cdk-iam-actions";
import { Construct } from "constructs";

export interface ApiHandlersProps {
  externalAPITable: ddb.ITable;
  authorizerUserPool: cognito.IUserPool;
  externalAPIActiveSortedIndex: string;
  appExternalScope: string;
  cognitoDomain: string;
}

export class ApiHandlers extends Construct {
  public readonly getExternalAPI: lambda.IFunction;
  public readonly listExternalAPIs: lambda.IFunction;
  public readonly createExternalAPI: lambda.IFunction;
  public readonly deleteExternalAPI: lambda.IFunction;
  public readonly updateExternalAPI: lambda.IFunction;
  public readonly getExternalAPISecret: lambda.IFunction;

  constructor(scope: Construct, id: string, props: ApiHandlersProps) {
    super(scope, id);

    const {
      externalAPIActiveSortedIndex,
      authorizerUserPool,
      appExternalScope,
      externalAPITable,
      cognitoDomain,
    } = props;

    this.createExternalAPI = new CommonNodejsFunction(
      scope,
      "CreateExternalAPI",
      {
        entry: join(__dirname, "create", "index.js"),
        description: "Create an external api",
        environment: {
          MAXIMUM_API_DURATION_DAYS: "365",
          EXTERNAL_API_TABLE_NAME: externalAPITable.tableName,
          COGNITO_DOMAIN: cognitoDomain,
          DEFAULT_SCOPE: appExternalScope,
          USER_POOL_ID: authorizerUserPool.userPoolId,
        },
        initialPolicy: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [actions.DynamoDB.PUT_ITEM],
            resources: [externalAPITable.tableArn],
          }),
          new iam.PolicyStatement({
            actions: [actions.CognitoIDP.CREATE_USER_POOL_CLIENT],
            resources: [authorizerUserPool.userPoolArn],
            effect: iam.Effect.ALLOW,
          }),
        ],
      },
    );

    this.listExternalAPIs = new CommonNodejsFunction(
      scope,
      "ListExternalAPIs",
      {
        entry: join(__dirname, "list", "index.js"),
        description: "List external apis",
        environment: {
          COGNITO_DOMAIN: cognitoDomain,
          EXTERNAL_API_TABLE_NAME: externalAPITable.tableName,
          EXTERNAL_API_ACTIVE_SORTED_INDEX: externalAPIActiveSortedIndex,
        },
        initialPolicy: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [actions.DynamoDB.QUERY],
            resources: [externalAPITable.tableArn],
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [actions.DynamoDB.QUERY],
            resources: [
              `${externalAPITable.tableArn}/index/${externalAPIActiveSortedIndex}`,
            ],
          }),
        ],
      },
    );

    this.getExternalAPI = new CommonNodejsFunction(scope, "GetExternalAPI", {
      entry: join(__dirname, "get", "index.js"),
      description: "Get an external API",
      environment: {
        EXTERNAL_API_TABLE_NAME: externalAPITable.tableName,
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [actions.DynamoDB.GET_ITEM],
          resources: [externalAPITable.tableArn],
        }),
      ],
    });

    this.deleteExternalAPI = new CommonNodejsFunction(
      scope,
      "DeleteExternalAPI",
      {
        entry: join(__dirname, "delete", "index.js"),
        description: "Delete an external API",
        environment: {
          EXTERNAL_API_TABLE_NAME: externalAPITable.tableName,
          USER_POOL_ID: authorizerUserPool.userPoolId,
        },
        initialPolicy: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [actions.DynamoDB.GET_ITEM, actions.DynamoDB.DELETE_ITEM],
            resources: [externalAPITable.tableArn],
          }),
          new iam.PolicyStatement({
            actions: [
              actions.CognitoIDP.DELETE_USER_POOL_CLIENT,
              actions.CognitoIDP.DESCRIBE_USER_POOL_CLIENT,
            ],
            resources: [authorizerUserPool.userPoolArn],
            effect: iam.Effect.ALLOW,
          }),
        ],
      },
    );

    this.updateExternalAPI = new CommonNodejsFunction(
      scope,
      "UpdateExternalAPI",
      {
        entry: join(__dirname, "update", "index.js"),
        description: "Update an external API",
        environment: {
          EXTERNAL_API_TABLE_NAME: externalAPITable.tableName,
        },
        initialPolicy: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [actions.DynamoDB.GET_ITEM, actions.DynamoDB.UPDATE_ITEM],
            resources: [externalAPITable.tableArn],
          }),
        ],
      },
    );

    this.getExternalAPISecret = new CommonNodejsFunction(
      scope,
      "GetExternalAPISecret",
      {
        entry: join(__dirname, "get-secret", "index.js"),
        description: "Get an external API secret",
        environment: {
          EXTERNAL_API_TABLE_NAME: externalAPITable.tableName,
          USER_POOL_ID: authorizerUserPool.userPoolId,
        },
        initialPolicy: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [actions.DynamoDB.GET_ITEM],
            resources: [externalAPITable.tableArn],
          }),
          new iam.PolicyStatement({
            actions: [actions.CognitoIDP.DESCRIBE_USER_POOL_CLIENT],
            resources: [authorizerUserPool.userPoolArn],
            effect: iam.Effect.ALLOW,
          }),
        ],
      },
    );
  }
}
