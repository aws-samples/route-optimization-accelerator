/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import * as child_process from "child_process";
import * as path from "path";
import { SERVICE_NAME } from "@route-optimization-accelerator/infra-common";
import { Duration, Stack } from "aws-cdk-lib";
import * as autoscaling from "aws-cdk-lib/aws-autoscaling";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr_assets from "aws-cdk-lib/aws-ecr-assets";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as events from "aws-cdk-lib/aws-events";
import * as iam from "aws-cdk-lib/aws-iam";
import * as location from "aws-cdk-lib/aws-location";
import * as logs from "aws-cdk-lib/aws-logs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { actions } from "cdk-iam-actions";
import { Construct } from "constructs";

export interface ScalingOptions {
  cooldownDurationInSec?: number;
  metricEvaluationPeriodInSec?: number;
}

export interface EngineEcsTaskDefinitionConfig {
  desiredTaskCount?: number;
  maxTaskCapacity?: number;
  minTaskCapacity?: number;
  scaleIn: ScalingOptions;
  scaleOut: ScalingOptions;
  taskCpu?: number;
  taskMemoryMiB?: number;
}

export interface EngineEcsTaskDefinitionProps {
  optimizationTaskQueue: sqs.IQueue;
  routeCalculator: location.CfnRouteCalculator;
  securityGroup: ec2.ISecurityGroup;
  ecsCluster: ecs.Cluster;
  eventBus: events.EventBus;
  config: EngineEcsTaskDefinitionConfig;
}

export class EngineEcsTaskDefinition extends Construct {
  public readonly engineService: ecs.FargateService;

  constructor(
    scope: Construct,
    id: string,
    props: EngineEcsTaskDefinitionProps,
  ) {
    super(scope, id);

    const {
      optimizationTaskQueue,
      routeCalculator,
      securityGroup,
      ecsCluster,
      eventBus,
      config,
    } = props;

    const taskRole = new iam.Role(this, "EcsTaskRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      inlinePolicies: {
        SQSQueueAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                actions.SQS.RECEIVE_MESSAGE,
                actions.SQS.DELETE_MESSAGE,
              ],
              resources: [optimizationTaskQueue.queueArn],
            }),
          ],
        }),
        EventBridgeAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [actions.Events.PUT_EVENTS],
              resources: [eventBus.eventBusArn],
            }),
          ],
        }),
        AmazonLocationService: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["geo:CalculateRouteMatrix", "geo:CalculateRoute"],
              resources: [routeCalculator.attrArn],
            }),
          ],
        }),
      },
    });

    const engineTask = new ecs.FargateTaskDefinition(this, "TaskDefinition", {
      taskRole,
      cpu: config.taskCpu || 16384,
      memoryLimitMiB: config.taskMemoryMiB || 32768,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.ARM64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    });

    const engineImage = new ecr_assets.DockerImageAsset(this, "engineImage", {
      directory: path.join(__dirname, "../../optimization-engine-build"),
      buildArgs: {
        // hack to get the current version from the metadata file in the optimization-engine folder
        VER: child_process
          .execSync(
            `xmllint --xpath '/metadata/versioning/release/text()' ${path.join(
              __dirname,
              "../../optimization-engine-build/maven-metadata.xml",
            )}`,
          )
          .toString()
          .replace("\n", ""),
      },
      target: "prod",
    });

    // one container per task
    engineTask.addContainer("engine", {
      image: ecs.ContainerImage.fromDockerImageAsset(engineImage),
      memoryLimitMiB: config.taskMemoryMiB || 32768,
      memoryReservationMiB: config.taskMemoryMiB || 32768,
      cpu: config.taskCpu || 16384,
      stopTimeout: Duration.seconds(120),
      environment: {
        AWS_MAX_ATTEMPTS: "10",
        AWS_RETRY_MODE: "adaptive",
        REGION: Stack.of(this).region,
        SERVICE_NAME: SERVICE_NAME.OPTIMIZATION,
        EVENT_BUS_NAME: eventBus.eventBusName,
        OPTIMIZATION_QUEUE_URL: optimizationTaskQueue.queueUrl,
        ROUTE_CALCULATOR: routeCalculator.calculatorName,
      },
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: "ecs",
        logGroup: new logs.LogGroup(this, "OptimizationEngineLogGroup", {
          logGroupName: `optimization-engine-${Date.now()}`,
        }),
      }),
    });

    this.engineService = new ecs.FargateService(
      this,
      "OptimizationEngineService",
      {
        cluster: ecsCluster,
        desiredCount: config.desiredTaskCount,
        securityGroups: [securityGroup],
        taskDefinition: engineTask,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      },
    );
    const scaling = this.engineService.autoScaleTaskCount({
      minCapacity: config.minTaskCapacity || 0,
      maxCapacity: config.maxTaskCapacity || 100,
    });

    // scaling out based on the messages in the queue
    scaling.scaleOnMetric("QueueMessagesVisibleScalingOut", {
      metric: new cloudwatch.Metric({
        namespace: "AWS/SQS",
        metricName: "ApproximateNumberOfMessagesVisible",
        dimensionsMap: { QueueName: optimizationTaskQueue.queueName },
        period: Duration.seconds(
          config.scaleOut.metricEvaluationPeriodInSec || 60,
        ),
        statistic: cloudwatch.Stats.MAXIMUM,
      }),
      adjustmentType: autoscaling.AdjustmentType.CHANGE_IN_CAPACITY,
      cooldown: Duration.seconds(config.scaleOut.cooldownDurationInSec || 300),
      scalingSteps: [
        { lower: 1, upper: 2, change: +1 },
        { lower: 2, upper: 5, change: +3 },
        { lower: 5, upper: 10, change: +7 },
        { lower: 10, upper: 20, change: +10 },
        { lower: 20, change: +20 },
      ],
    });

    // scale in based on the messages that are not visibile
    // to avoid scaling in when there are messages in flight
    scaling.scaleOnMetric("QueueMessagesVisibleScalingIn", {
      metric: new cloudwatch.Metric({
        namespace: "AWS/SQS",
        metricName: "ApproximateNumberOfMessagesNotVisible",
        dimensionsMap: { QueueName: optimizationTaskQueue.queueName },
        period: Duration.seconds(
          config.scaleIn.metricEvaluationPeriodInSec || 60,
        ),
        statistic: cloudwatch.Stats.MAXIMUM,
      }),
      adjustmentType: autoscaling.AdjustmentType.CHANGE_IN_CAPACITY,
      cooldown: Duration.seconds(config.scaleIn.cooldownDurationInSec || 300),
      scalingSteps: [
        { upper: 0, change: -1 },
        { upper: 1, change: 0 },
      ],
    });
  }
}
