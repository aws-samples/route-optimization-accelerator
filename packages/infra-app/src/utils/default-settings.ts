/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { PositionFiltering } from "@route-optimization-accelerator/routing-engine/lib/common";
import { HereMapStyles } from "@route-optimization-accelerator/routing-engine/lib/maps";
import { Duration } from "aws-cdk-lib";
import "dotenv/config";

/// define your map system
export const DEFAULT_MAP_SETTINGS = {
  name: "roa-map",
  style: HereMapStyles.VectorHereExplore,
};

// define routing
export const DEFAULT_ROUTING = {
  name: "roa-routing",
};

export const DEFAULT_TRACKERS = {
  place: {
    name: "roa-place-tracker",
    filtering: PositionFiltering.AccuracyBased,
  },
  fleet: {
    name: "roa-fleet-tracker",
    filtering: PositionFiltering.AccuracyBased,
  },
};

// define place-index
export const DEFAULT_PLACE_INDEX = {
  name: "roa-place-index",
};

export const NETWORKING = {
  cidr: "192.168.0.0/16",
  // TODO: specify the vpc Id and AZs in case you'd want to use an existing VPC
  vpcId: "",
  AZs: [],
};

export const OPTIMIZATION_QUEUE = {
  // max retries
  maxReceiveCount: 3,
  // time for the dispatch to process the messages
  visibilityTimeoutSeconds: Duration.hours(1).toSeconds(),
};

export const EVENT_BRIDGE = {
  // define a name in case you'd like to create one with custom name
  busName: undefined,
};

export const OPTIMIZATION_ENGINE = {
  // ECS task configuration
  // highest CPU amount to account for heavy solver
  // https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-tasks-services.html#fargate-tasks-size
  taskCpu: 4096,
  // minimum memory for the cpu amount above
  taskMemoryMiB: 8192,
  scaleIn: {
    cooldownDurationInSec: Duration.minutes(5).toSeconds(),
    metricEvaluationPeriodInSec: Duration.minutes(5).toSeconds(),
  },
  scaleOut: {
    metricEvaluationPeriodInSec: Duration.minutes(1).toSeconds(),
    cooldownDurationInSec: Duration.minutes(2).toSeconds(),
  },
  maxTaskCapacity: 100,
  desiredTaskCount: 0,
  minTaskCapacity: 0,
};

export const WEB = {
  allowedCountries: ["SG", "TH", "US", "AU", "CA"],
  placeIndexLanguage: "EN",
  defaultMapCenter: [-123.115898, 49.295868],
};
