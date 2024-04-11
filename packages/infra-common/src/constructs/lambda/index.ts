/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { Duration } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class CommonNodejsFunction extends lambdaNodejs.NodejsFunction {
  constructor(
    scope: Construct,
    id: string,
    props: lambdaNodejs.NodejsFunctionProps,
  ) {
    let externalModules = ["@aws-sdk/*"];

    if (props.bundling && props.bundling.externalModules) {
      externalModules = props.bundling.externalModules;
    }

    super(scope, id, {
      architecture: lambda.Architecture.ARM_64,
      timeout: Duration.seconds(30),
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 512,
      ...props,
      layers: props.layers || [],
      insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_229_0,
      bundling: {
        ...(props.bundling || {}),
        externalModules: externalModules,
      },
    });
  }
}
