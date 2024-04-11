/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  GetDevicePositionHistoryCommand,
  GetDevicePositionHistoryCommandOutput,
  LocationClient,
} from "@aws-sdk/client-location";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import {
  FleetPositionHistoryData,
  getFleetPositionHistoryHandler,
} from "@route-optimization-accelerator/web-api-service-typescript-runtime";
import * as uuid from "uuid";
import {
  MAX_PAGINATION_LOOP,
  getDynamoDBClient,
} from "../../../../common/defaults";
import {
  buildBadRequest,
  buildInternalServerError,
  buildNotFound,
  customHeadersInterceptor,
} from "../../../../common/lambda-commons";

const ddb = getDynamoDBClient();
const location = new LocationClient({});

const getDeviceLocationHistory = async (
  deviceId: string,
  from: Date,
  to: Date,
): Promise<[number, number][]> => {
  try {
    let cnt = 0;
    let nextToken: string | undefined = undefined;
    let positions: [number, number][] = [];

    do {
      const result: GetDevicePositionHistoryCommandOutput = await location.send(
        new GetDevicePositionHistoryCommand({
          DeviceId: deviceId,
          TrackerName: process.env.FLEET_TRACKER,
          StartTimeInclusive: from,
          EndTimeExclusive: to,
          ...(nextToken ? { NextToken: nextToken! } : {}),
        }),
      );
      positions = positions.concat(
        result.DevicePositions!.map((d) => [d.Position![0], d.Position![1]]),
      );

      nextToken = result.NextToken;
      cnt = cnt + 1;
    } while (nextToken !== undefined && cnt <= MAX_PAGINATION_LOOP);

    return positions;
  } catch (err: any) {
    console.error(err);
    console.error("Error retrieving the location");
  }

  return [];
};

export const handler = getFleetPositionHistoryHandler(
  customHeadersInterceptor,
  async ({ input }) => {
    try {
      const id = input.requestParameters.id;
      const from = input.requestParameters.from;
      const to = input.requestParameters.to;

      if (!uuid.validate(id)) {
        return buildBadRequest("The provided id is not a valid UUID");
      }

      const result = await ddb.send(
        new GetCommand({
          Key: {
            id,
          },
          TableName: process.env.FLEET_TABLE_NAME,
        }),
      );

      if (!result.Item) {
        return buildNotFound(`The item with id '${id}' could not be found`);
      }

      const positions = await getDeviceLocationHistory(
        id,
        new Date(from),
        new Date(to),
      );
      const data: FleetPositionHistoryData = {
        id: result.Item.id,
        name: result.Item.name,
        positionHistory: positions,
      };

      return {
        statusCode: 200,
        body: {
          data,
        },
      };
    } catch (err) {
      console.error("Unable to retrieve the fleet position history");
      console.error(err);
    }

    return buildInternalServerError(
      "Unable to retrieve the fleet position history",
    );
  },
);
