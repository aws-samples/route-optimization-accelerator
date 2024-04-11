/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { DEFAULT_MAP_PROVIDER } from "@route-optimization-accelerator/infra-common";
import * as als from "aws-cdk-lib/aws-location";
import { Construct } from "constructs";

export interface RouteCalculatorsProps {
  calculatorName: string;
}

export class RouteCalculators extends Construct {
  public readonly defaultRouteCalculator: als.CfnRouteCalculator;

  constructor(scope: Construct, id: string, props: RouteCalculatorsProps) {
    super(scope, id);

    this.defaultRouteCalculator = new als.CfnRouteCalculator(
      this,
      "DefaultRouteCalculator",
      {
        calculatorName: props.calculatorName,
        dataSource: DEFAULT_MAP_PROVIDER,
      },
    );
  }
}
