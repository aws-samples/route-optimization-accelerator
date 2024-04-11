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

export interface CustomAuthorizerProps {
  externalAPIClientIdIndexName: string;
  authorizerUserPool: cognito.IUserPool;
  externalAPITable: ddb.ITable;
  appExternalScope: string;
  cognitoDomain: string;
}

export class CustomAuthorizer extends Construct {
  public readonly authFunction: lambda.IFunction;

  constructor(scope: Construct, id: string, props: CustomAuthorizerProps) {
    super(scope, id);

    const {
      externalAPIClientIdIndexName,
      authorizerUserPool,
      appExternalScope,
      externalAPITable,
      cognitoDomain,
    } = props;

    this.authFunction = new CommonNodejsFunction(scope, "CustomAuthFunction", {
      entry: join(__dirname, "lambda-code", "index.js"),
      description: "Custom Authorizer",
      environment: {
        EXTERNAL_API_CLIENT_ID_INDEX_NAME: externalAPIClientIdIndexName,
        EXTERNAL_API_TABLE_NAME: externalAPITable.tableName,
        APP_EXTERNAL_SCOPE: appExternalScope,
        COGNITO_DOMAIN: cognitoDomain,
        USER_POOL_ID: authorizerUserPool.userPoolId,
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [actions.DynamoDB.QUERY],
          resources: [
            externalAPITable.tableArn,
            `${externalAPITable.tableArn}/index/${externalAPIClientIdIndexName}`,
          ],
        }),
      ],
    });
  }
}
