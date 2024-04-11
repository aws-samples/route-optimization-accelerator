/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";

export interface EngineEcsClusterProps {
  readonly securityGroup: ec2.ISecurityGroup;
  readonly vpc: ec2.IVpc;
}

export class EngineEcsCluster extends Construct {
  readonly cluster: ecs.Cluster;

  constructor(scope: Construct, id: string, props: EngineEcsClusterProps) {
    super(scope, id);

    const { vpc } = props;

    this.cluster = new ecs.Cluster(this, "EngineEcsCluster", {
      vpc,
      containerInsights: true,
    });
  }
}
