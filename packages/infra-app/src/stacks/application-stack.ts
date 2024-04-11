/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { CommonResources } from "@route-optimization-accelerator/infra-common";
import { RouteOptimizationEngineInfra } from "@route-optimization-accelerator/optimization-infra";
import { RoutingEngine } from "@route-optimization-accelerator/routing-engine";
import { WebApi } from "@route-optimization-accelerator/web-api";
import { CfnParameter, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApplicationIdentity } from "./identity";
import { Networking } from "./networking";
import { WebApp } from "./web";
import {
  DEFAULT_MAP_SETTINGS,
  DEFAULT_PLACE_INDEX,
  DEFAULT_ROUTING,
  DEFAULT_TRACKERS,
  EVENT_BRIDGE,
  NETWORKING,
  OPTIMIZATION_ENGINE,
  OPTIMIZATION_QUEUE,
  WEB,
} from "../utils/default-settings";

export class ApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const adminUserEmailParam = new CfnParameter(this, "AdminUserEmail", {
      type: "String",
      description: "Admin user email address",
      allowedPattern:
        "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$",
      constraintDescription: "Admin user email must be a valid email address",
    });

    const adminUserName = new CfnParameter(this, "AdminUserName", {
      type: "String",
      description: "Admin user name",
      constraintDescription: "The admin user name to be used as login id",
    });

    const common = new CommonResources(this, "CommonResources", {
      eventBusName: EVENT_BRIDGE.busName,
    });

    const net = new Networking(this, "Networking", {
      config: NETWORKING,
      loggingBucket: common.accessLogsBucket,
    });

    const mapsAndRoutes = new RoutingEngine(this, "MapsAndRoutes", {
      map: {
        mapName: DEFAULT_MAP_SETTINGS.name,
        mapStyle: DEFAULT_MAP_SETTINGS.style,
      },
      route: {
        calculatorName: DEFAULT_ROUTING.name,
      },
      tracker: {
        fleetTracker: {
          trackerName: DEFAULT_TRACKERS.fleet.name,
          positionFiltering: DEFAULT_TRACKERS.fleet.filtering,
        },
        placeTracker: {
          trackerName: DEFAULT_TRACKERS.place.name,
          positionFiltering: DEFAULT_TRACKERS.place.filtering,
        },
      },
      placeIndex: {
        placeIndexName: DEFAULT_PLACE_INDEX.name,
      },
    });

    const identity = new ApplicationIdentity(this, "AppIdentity", {
      alsResources: [
        mapsAndRoutes.maps.defaultMap.attrArn,
        mapsAndRoutes.routeCalculators.defaultRouteCalculator.attrArn,
        mapsAndRoutes.trackers.fleetTracker.attrArn,
        mapsAndRoutes.trackers.placeTracker.attrArn,
        mapsAndRoutes.placeIndexes.defaultPlaceIndex.attrArn,
      ],
      adminUserEmail: adminUserEmailParam.valueAsString,
      adminUsername: adminUserName.valueAsString,
    });

    const engineInfra = new RouteOptimizationEngineInfra(this, "EngineInfra", {
      vpc: net.vpc,
      config: {
        queue: OPTIMIZATION_QUEUE,
        taskDefinition: OPTIMIZATION_ENGINE,
      },
      eventBus: common.bus,
      securityGroup: net.optimizationEngineSecuriryGroup,
      routeCalculator: mapsAndRoutes.routeCalculators.defaultRouteCalculator,
    });

    const webApi = new WebApi(this, "WebApi", {
      authorizerUserPool: identity.userPool,
      optimizationQueue: engineInfra.optimizationTaskQueue,
      appExternalScope: identity.appExternalScope,
      routeCalculator: mapsAndRoutes.routeCalculators.defaultRouteCalculator,
      placeTracker: mapsAndRoutes.trackers.placeTracker,
      fleetTracker: mapsAndRoutes.trackers.fleetTracker,
      cognitoDomain: identity.cognitoDomain,
      eventBus: common.bus,
    });

    new WebApp(this, "WebApp", {
      userPool: identity.userPool,
      userPoolClient: identity.userPoolClient,
      identityPool: identity.identityPool,
      logBucket: common.accessLogsBucket,
      map: mapsAndRoutes.maps.defaultMap.mapName,
      calculator:
        mapsAndRoutes.routeCalculators.defaultRouteCalculator.calculatorName,
      placeTracker: mapsAndRoutes.trackers.placeTracker.trackerName,
      fleetTracker: mapsAndRoutes.trackers.fleetTracker.trackerName,
      placeIndex: mapsAndRoutes.placeIndexes.defaultPlaceIndex.indexName,
      placeIndexLanguage: WEB.placeIndexLanguage,
      defaultMapCenter: WEB.defaultMapCenter,
      webApiUrl: webApi.api.url,
    });
  }
}
