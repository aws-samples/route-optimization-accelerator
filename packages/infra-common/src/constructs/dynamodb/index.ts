/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class CommonDynamoDBTable extends ddb.Table {
  constructor(scope: Construct, id: string, props: ddb.TableOptions) {
    super(scope, id, {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      encryption: ddb.TableEncryption.AWS_MANAGED,
      ...props,
    });
  }
}
