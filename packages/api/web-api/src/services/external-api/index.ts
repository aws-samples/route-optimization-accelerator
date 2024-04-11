/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { CommonDynamoDBTable } from "@route-optimization-accelerator/infra-common";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { ApiHandlers } from "./api-handlers";

export interface ExternalAPIServiceProps {
  authorizerUserPool: cognito.IUserPool;
  appExternalScope: string;
  cognitoDomain: string;
}

export class ExternalAPIService extends Construct {
  public readonly handlers: ApiHandlers;

  public readonly externalAPITable: ddb.ITable;

  public readonly externalAPIClientIdIndexName: string;

  constructor(scope: Construct, id: string, props: ExternalAPIServiceProps) {
    super(scope, id);

    const { cognitoDomain, appExternalScope, authorizerUserPool } = props;

    const externalAPITable = new CommonDynamoDBTable(this, "ExternalAPITable", {
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });

    const externalAPIActiveSortedIndex = "ExternalAPIActiveSortedIndex";
    const externalAPIClientIdIndex = "ExternalAPIClientIdIndex";

    externalAPITable.addGlobalSecondaryIndex({
      indexName: externalAPIActiveSortedIndex,
      partitionKey: {
        name: "isActive",
        type: ddb.AttributeType.STRING,
      },
      sortKey: {
        name: "createdAt",
        type: ddb.AttributeType.NUMBER,
      },
    });
    externalAPITable.addGlobalSecondaryIndex({
      indexName: externalAPIClientIdIndex,
      partitionKey: {
        name: "clientId",
        type: ddb.AttributeType.STRING,
      },
    });

    this.handlers = new ApiHandlers(this, "Handlers", {
      cognitoDomain,
      appExternalScope,
      externalAPITable,
      authorizerUserPool,
      externalAPIActiveSortedIndex,
    });
    this.externalAPITable = externalAPITable;
    this.externalAPIClientIdIndexName = externalAPIClientIdIndex;
  }
}
