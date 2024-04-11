/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as s3 from "aws-cdk-lib/aws-s3";
import { NagSuppressions } from "cdk-nag";
import { Construct } from "constructs";

export interface NetworkingConfig {
  cidr: string;
  vpcId?: string;
  vpcAZs?: string[];
}

export interface NetworkingProps {
  loggingBucket: s3.IBucket;
  config: NetworkingConfig;
}

export class Networking extends Construct {
  public readonly vpc: ec2.IVpc;
  public readonly optimizationEngineSecuriryGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: NetworkingProps) {
    super(scope, id);

    const { loggingBucket, config } = props;

    if (config.vpcId) {
      this.vpc = ec2.Vpc.fromVpcAttributes(this, "ImportedVpc", {
        availabilityZones: config.vpcAZs!,
        vpcId: config.vpcId,
      });
    } else {
      this.vpc = new ec2.Vpc(this, "NewVpc", {
        maxAzs: 3,
        cidr: config.cidr,
        subnetConfiguration: [
          {
            name: "PublicSubnet",
            subnetType: ec2.SubnetType.PUBLIC,
          },
          {
            name: "PrivateWithEgress",
            subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          },
          {
            name: "PrivateIsolatedSubnet",
            subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          },
        ],
        natGateways: 3,
        natGatewayProvider: ec2.NatProvider.gateway(),
      });

      this.vpc.addFlowLog("DefaultFlowLogs", {
        destination: ec2.FlowLogDestination.toS3(
          loggingBucket,
          "vpc-flow-logs/",
        ),
        trafficType: ec2.FlowLogTrafficType.ALL,
      });
    }

    this.optimizationEngineSecuriryGroup = new ec2.SecurityGroup(
      this,
      "optimizationEngineSecuriryGroup",
      {
        vpc: this.vpc,
        allowAllOutbound: true,
        description: "Security group for Dispach Engine in VPC",
      },
    );

    this.addSuppressions();
  }

  private addSuppressions() {
    NagSuppressions.addResourceSuppressions(
      this.vpc,
      [
        {
          id: "AwsPrototyping-VPCSubnetAutoAssignPublicIpDisabled",
          reason:
            "Used by CDK to put the NAT Gateway to provide egress access to PRIVATE_WITH_EGRESS subnets",
        },
      ],
      true,
    );
  }
}
