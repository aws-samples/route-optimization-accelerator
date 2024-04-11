/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as events from "aws-cdk-lib/aws-events";
import * as location from "aws-cdk-lib/aws-location";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { ExternalAPIService } from "./external-api";
import { FleetService } from "./fleet";
import { OrderService } from "./order";
import { PlaceService } from "./place";
import { RouteOptimizationService } from "./route-optimization";

export interface ServicesProps {
  authorizerUserPool: cognito.IUserPool;
  optimizationQueue: sqs.IQueue;
  appExternalScope: string;
  routeCalculator: location.CfnRouteCalculator;
  cognitoDomain: string;
  fleetTracker: location.CfnTracker;
  placeTracker: location.CfnTracker;
  eventBus: events.IEventBus;
}

export class Services extends Construct {
  public readonly routeOptimizationService: RouteOptimizationService;
  public readonly externalAPIService: ExternalAPIService;
  public readonly placeService: PlaceService;
  public readonly fleetService: FleetService;
  public readonly orderService: OrderService;

  constructor(scope: Construct, id: string, props: ServicesProps) {
    super(scope, id);

    const {
      eventBus,
      cognitoDomain,
      routeCalculator,
      appExternalScope,
      optimizationQueue,
      authorizerUserPool,
      fleetTracker,
      placeTracker,
    } = props;

    this.routeOptimizationService = new RouteOptimizationService(
      this,
      "RouteOptimization",
      {
        optimizationQueue,
        routeCalculator,
        eventBus,
      },
    );

    this.externalAPIService = new ExternalAPIService(this, "ExternalAPI", {
      cognitoDomain,
      appExternalScope,
      authorizerUserPool,
    });

    this.placeService = new PlaceService(this, "Place", {
      placeTracker,
    });
    this.fleetService = new FleetService(this, "Fleet", {
      fleetTracker,
    });
    this.orderService = new OrderService(this, "Order");
  }
}
