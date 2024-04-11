/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  CalculateRouteCommand,
  CalculateRouteResponse,
  LocationClient,
} from "@aws-sdk/client-location";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import polyline from "@mapbox/polyline";
import {
  Optimization,
  OptimizationAssignmentResult,
  OptimizationResult,
  getRouteOptimizationAssignmentResultHandler,
} from "@route-optimization-accelerator/web-api-service-typescript-runtime";
import * as uuid from "uuid";
import { chunksArray, getDynamoDBClient } from "../../../../common/defaults";
import {
  buildBadRequest,
  buildInternalServerError,
  buildNotFound,
  customHeadersInterceptor,
} from "../../../../common/lambda-commons";

const location = new LocationClient({});
const ddb = getDynamoDBClient();

export const getRoute = async (
  optimization: Optimization,
  assignment: OptimizationAssignmentResult,
) => {
  const { orders, fleet, config } = optimization;
  const getOrderById = (id: string) => orders.find((q) => q.id === id)!;
  const getVehicleById = (id: string) => fleet.find((q) => q.id === id)!;
  const findVirtualFleet = (id: string) =>
    optimization.config!.virtualFleet?.find((v) => v.groupId === id)!;

  const mappedOrders = assignment.orders.map((q) => getOrderById(q.id));
  const vehicle = assignment.isVirtual
    ? findVirtualFleet(assignment.virtualGroupId!)
    : getVehicleById(assignment.fleetId);
  const firstOrder = getOrderById(mappedOrders[0].id);
  const lastOrder = getOrderById(mappedOrders[assignment.orders.length - 1].id);
  const shouldRouteBack =
    vehicle.backToOrigin !== null && vehicle.backToOrigin !== undefined
      ? vehicle.backToOrigin
      : true;

  const firstPosition = firstOrder.origin;
  const lastPosition = shouldRouteBack
    ? firstOrder.origin
    : lastOrder.destination;
  const intermediatePoints = mappedOrders
    .slice(0, mappedOrders.length)
    .map((q) => q.destination)
    // @ts-ignore
    .concat([shouldRouteBack ? mappedOrders[0].origin : undefined])
    .filter((q) => !!q);

  const chunks = chunksArray(intermediatePoints, 23);
  let previousDestination;

  let fullResponse: Partial<CalculateRouteResponse> | undefined = undefined;
  let counter = 0;
  for (let i = 0; i < chunks.length; i++) {
    const batch: any[] = JSON.parse(JSON.stringify(chunks[i]));

    const isLast = ++counter === chunks.length - 1;
    const isFirst = counter === 1;
    let finalOrigin = firstPosition;
    let finalDestination = lastPosition;

    if (!isFirst) {
      finalOrigin = previousDestination!;
    }

    if (!isLast) {
      finalDestination = batch[batch.length - 1];
      batch.pop();
    }

    previousDestination = finalDestination;

    const response = await location.send(
      new CalculateRouteCommand({
        CalculatorName: process.env.CALCULATOR_NAME,
        DistanceUnit: "Kilometers",
        DeparturePosition: [finalOrigin.longitude, finalOrigin.latitude],
        DestinationPosition: [
          finalDestination.longitude,
          finalDestination.latitude,
        ],
        TravelMode: "Car",
        CarModeOptions: {
          AvoidTolls: config ? config.avoidTolls || false : false,
        },
        WaypointPositions: batch.map((q) => [q.longitude, q.latitude]),
        IncludeLegGeometry: true,
      }),
    );

    fullResponse =
      fullResponse === undefined
        ? response
        : {
            Legs: [...fullResponse!.Legs!, ...response.Legs!],
            Summary: {
              DistanceUnit: response.Summary!.DistanceUnit,
              RouteBBox: response.Summary!.RouteBBox,
              DataSource: response.Summary!.DataSource,
              Distance:
                response.Summary!.Distance! + fullResponse!.Summary!.Distance!,
              DurationSeconds:
                response.Summary!.DurationSeconds! +
                fullResponse!.Summary!.DurationSeconds!,
            },
          };
  }

  return fullResponse;
};

export const handler = getRouteOptimizationAssignmentResultHandler(
  customHeadersInterceptor,
  async ({ input }) => {
    const problemId = input.requestParameters.id;
    const fleetId = input.requestParameters.fleetId;

    try {
      if (!uuid.validate(problemId)) {
        return buildBadRequest("The provided id is not a valid UUID");
      }

      const task = await ddb.send(
        new GetCommand({
          Key: {
            problemId,
          },
          TableName: process.env.OPTIMIZATION_TASK_TABLE_NAME,
        }),
      );

      const result = await ddb.send(
        new GetCommand({
          Key: {
            problemId,
          },
          TableName: process.env.OPTIMIZATION_RESULT_TABLE_NAME,
        }),
      );

      const optimization = task.Item as Optimization;
      const optimizationResult = result.Item as OptimizationResult;

      if (!optimization || !optimizationResult) {
        return buildNotFound(
          `The item with id '${problemId}' could not be found`,
        );
      }
      const fleetItemIndex = optimizationResult.assignments?.findIndex(
        (q) => q.fleetId === fleetId,
      );
      const fleetItem =
        fleetItemIndex !== undefined && fleetItemIndex !== -1
          ? optimizationResult.assignments![fleetItemIndex]
          : undefined;

      if (!fleetItem) {
        return buildNotFound(
          `The fleet item with id ${fleetId} cannot be found in the optimization task ${problemId}`,
        );
      }

      const suggestedRoute = await getRoute(optimization, fleetItem);

      return {
        statusCode: 200,
        body: {
          data: fleetItem,
          suggestedRoute: {
            legs: suggestedRoute!.Legs!.map((l: any) => ({
              geometry: {
                pathPolyline: polyline.encode(l.Geometry.LineString, 6),
              },
              steps: l.Steps,
              durationSeconds: l.DurationSeconds,
              distance: l.Distance,
              endPosition: l.EndPosition,
              startPosition: l.StartPosition,
            })),
            summary: {
              dataSource: suggestedRoute!.Summary!.DataSource,
              distance: suggestedRoute!.Summary!.Distance,
              distanceUnit: suggestedRoute!.Summary!.DistanceUnit,
              durationSeconds: suggestedRoute!.Summary!.DurationSeconds,
              routeBBox: suggestedRoute!.Summary!.RouteBBox,
            },
          },
        },
      };
    } catch (ex) {
      console.error("Error retrieving the item results from the database");
      console.error(ex);
    }

    return buildInternalServerError(
      "Unable to retrieve the optimization results",
    );
  },
);
