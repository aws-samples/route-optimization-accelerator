/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  Authorizers,
  CustomAuthorizerType,
  Integrations,
  TypeSafeApiIntegration,
} from "@aws/pdk/type-safe-api";
import { Api } from "@route-optimization-accelerator/web-api-service-typescript-infra";
import { Size } from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as events from "aws-cdk-lib/aws-events";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as location from "aws-cdk-lib/aws-location";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { CustomAuthorizer } from "./authorizer";
import { Services } from "./services";

const lambdaIntegration = (fn: lambda.IFunction): TypeSafeApiIntegration => {
  return {
    integration: Integrations.lambda(fn),
  };
};

export interface WebApiProps {
  readonly authorizerUserPool: cognito.IUserPool;
  readonly optimizationQueue: sqs.IQueue;
  readonly appExternalScope: string;
  readonly routeCalculator: location.CfnRouteCalculator;
  readonly cognitoDomain: string;
  readonly fleetTracker: location.CfnTracker;
  readonly placeTracker: location.CfnTracker;
  readonly eventBus: events.IEventBus;
}

export class WebApi extends Api {
  constructor(scope: Construct, id: string, props: WebApiProps) {
    const {
      optimizationQueue,
      authorizerUserPool,
      appExternalScope,
      routeCalculator,
      cognitoDomain,
      placeTracker,
      fleetTracker,
      eventBus,
    } = props;

    const services = new Services(scope, "Services", {
      authorizerUserPool,
      optimizationQueue,
      appExternalScope,
      routeCalculator,
      cognitoDomain,
      fleetTracker,
      placeTracker,
      eventBus,
    });

    const authorizer = new CustomAuthorizer(scope, "CustomAuth", {
      externalAPIClientIdIndexName:
        services.externalAPIService.externalAPIClientIdIndexName,
      externalAPITable: services.externalAPIService.externalAPITable,
      cognitoDomain,
      appExternalScope,
      authorizerUserPool,
    });
    const defaultAuthorizer = Authorizers.custom({
      authorizerId: "WebApiCustomAuthorizer",
      function: authorizer.authFunction,
      identitySource: apigateway.IdentitySource.header("Authorization"),
      authorizerResultTtlInSeconds: 0,
      // TODO: disabled for now since the custom resource is
      // providing access only to a specific requsted resource
      // caching would result in error
      // authorizerResultTtlInSeconds: Duration.minutes(10).toSeconds(),
      type: CustomAuthorizerType.REQUEST,
    });

    super(scope, id, {
      defaultAuthorizer,
      cloudWatchRole: true,
      minCompressionSize: Size.bytes(0),
      corsOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
      webAclOptions: {
        disable: false,
        managedRules: [
          {
            vendorName: "AWS",
            name: "AWSManagedRulesCommonRuleSet",
            ruleActionOverrides: [
              // as optimization tasks can have a big payload
              // this override will remove the role that restrict
              // the body size to be maximum 8KB
              // details: https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-baseline.html
              {
                name: "SizeRestrictions_BODY",
                actionToUse: { allow: {} },
              },
            ],
          },
        ],
      },
      integrations: {
        // route optimization service
        createRouteOptimization: lambdaIntegration(
          services.routeOptimizationService.handlers.createRouteOptimization,
        ),
        getRouteOptimization: lambdaIntegration(
          services.routeOptimizationService.handlers.getRouteOptimization,
        ),
        getRouteOptimizationResult: lambdaIntegration(
          services.routeOptimizationService.handlers.getRouteOptimizationResult,
        ),
        getRouteOptimizationAssignmentResult: lambdaIntegration(
          services.routeOptimizationService.handlers
            .getRouteOptimizationAssignmentResult,
        ),
        listRouteOptimization: lambdaIntegration(
          services.routeOptimizationService.handlers.listRouteOptimizations,
        ),

        // external api service
        createExternalAPI: lambdaIntegration(
          services.externalAPIService.handlers.createExternalAPI,
        ),
        deleteExternalAPI: lambdaIntegration(
          services.externalAPIService.handlers.deleteExternalAPI,
        ),
        getExternalAPI: lambdaIntegration(
          services.externalAPIService.handlers.getExternalAPI,
        ),
        getExternalAPISecret: lambdaIntegration(
          services.externalAPIService.handlers.getExternalAPISecret,
        ),
        listExternalAPIs: lambdaIntegration(
          services.externalAPIService.handlers.listExternalAPIs,
        ),
        updateExternalAPI: lambdaIntegration(
          services.externalAPIService.handlers.updateExternalAPI,
        ),

        //place service
        createPlace: lambdaIntegration(
          services.placeService.handlers.createPlace,
        ),
        listPlaces: lambdaIntegration(
          services.placeService.handlers.listPlaces,
        ),
        deletePlace: lambdaIntegration(
          services.placeService.handlers.deletePlace,
        ),
        getPlace: lambdaIntegration(services.placeService.handlers.getPlace),
        updatePlace: lambdaIntegration(
          services.placeService.handlers.updatePlace,
        ),
        listPlacePositions: lambdaIntegration(
          services.placeService.handlers.listPlacePositions,
        ),

        // fleet
        createFleet: lambdaIntegration(
          services.fleetService.handlers.createFleet,
        ),
        listFleet: lambdaIntegration(services.fleetService.handlers.listFleet),
        deleteFleet: lambdaIntegration(
          services.fleetService.handlers.deleteFleet,
        ),
        getFleet: lambdaIntegration(services.fleetService.handlers.getFleet),
        updateFleet: lambdaIntegration(
          services.fleetService.handlers.updateFleet,
        ),
        getFleetPositionHistory: lambdaIntegration(
          services.fleetService.handlers.getFleetPositionHistory,
        ),
        getFleetCurrentPosition: lambdaIntegration(
          services.fleetService.handlers.getFleetCurrentPosition,
        ),
        updateFleetCurrentPosition: lambdaIntegration(
          services.fleetService.handlers.updateFleetCurrentPosition,
        ),
        listFleetPositions: lambdaIntegration(
          services.fleetService.handlers.listFleetPositions,
        ),

        // order
        getOrder: lambdaIntegration(services.orderService.handlers.getOrder),
        createOrder: lambdaIntegration(
          services.orderService.handlers.createOrder,
        ),
        updateOrder: lambdaIntegration(
          services.orderService.handlers.updateOrder,
        ),
        listOrders: lambdaIntegration(
          services.orderService.handlers.listOrders,
        ),
        deleteOrder: lambdaIntegration(
          services.orderService.handlers.deleteOrder,
        ),
      },
    });
  }
}
