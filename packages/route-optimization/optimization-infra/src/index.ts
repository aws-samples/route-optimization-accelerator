/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { Duration } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as events from "aws-cdk-lib/aws-events";
import * as location from "aws-cdk-lib/aws-location";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { EngineEcsCluster } from "./ecs-cluster";
import {
  EngineEcsTaskDefinition,
  EngineEcsTaskDefinitionConfig,
} from "./ecs-task-definition";

export interface QueueConfiguration {
  maxReceiveCount?: number;
  visibilityTimeoutSeconds?: number;
}

export interface RouteOptimizationEngineInfraProps {
  vpc: ec2.IVpc;
  config: {
    taskDefinition: EngineEcsTaskDefinitionConfig;
    queue: QueueConfiguration;
  };
  eventBus: events.EventBus;
  securityGroup: ec2.ISecurityGroup;
  routeCalculator: location.CfnRouteCalculator;
}

export class RouteOptimizationEngineInfra extends Construct {
  public readonly optimizationTaskQueue: sqs.IQueue;

  constructor(
    scope: Construct,
    id: string,
    props: RouteOptimizationEngineInfraProps,
  ) {
    super(scope, id);

    const { routeCalculator, securityGroup, eventBus, config, vpc } = props;

    const optimizationTaskQueueDadLetter = new sqs.Queue(
      this,
      "OptimizationTaskDeadLetter",
      {
        enforceSSL: true,
      },
    );

    this.optimizationTaskQueue = new sqs.Queue(this, "OptimizationTaskQueue", {
      enforceSSL: true,
      deadLetterQueue: {
        queue: optimizationTaskQueueDadLetter,
        maxReceiveCount: config.queue.maxReceiveCount || 3,
      },
      visibilityTimeout: Duration.seconds(
        config.queue.visibilityTimeoutSeconds || 3600,
      ),
    });

    const ecsCluster = new EngineEcsCluster(this, "Cluster", {
      securityGroup,
      vpc,
    });

    new EngineEcsTaskDefinition(this, "TaskDef", {
      optimizationTaskQueue: this.optimizationTaskQueue,
      ecsCluster: ecsCluster.cluster,
      config: config.taskDefinition,
      routeCalculator,
      securityGroup,
      eventBus,
    });
  }
}
