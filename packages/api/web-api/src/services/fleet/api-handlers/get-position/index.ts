/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  GetDevicePositionCommand,
  LocationClient,
} from "@aws-sdk/client-location";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import {
  FleetCurrentPositionData,
  getFleetCurrentPositionHandler,
} from "@route-optimization-accelerator/web-api-service-typescript-runtime";
import * as uuid from "uuid";
import { getDynamoDBClient } from "../../../../common/defaults";
import {
  buildBadRequest,
  buildInternalServerError,
  buildNotFound,
  customHeadersInterceptor,
} from "../../../../common/lambda-commons";

const ddb = getDynamoDBClient();
const location = new LocationClient({});

export const handler = getFleetCurrentPositionHandler(
  customHeadersInterceptor,
  async ({ input }) => {
    try {
      const id = input.requestParameters.id;

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

      const locationData = await location.send(
        new GetDevicePositionCommand({
          DeviceId: id,
          TrackerName: process.env.FLEET_TRACKER,
        }),
      );

      if (!locationData.Position) {
        return buildBadRequest("Emable to retrieve current position");
      }

      const data: FleetCurrentPositionData = {
        id: result.Item.id,
        name: result.Item.name,
        position: {
          latitude: locationData.Position[1],
          longitude: locationData.Position[0],
        },
      };

      return {
        statusCode: 200,
        body: {
          data,
        },
      };
    } catch (err) {
      console.error("Unable to retrieve the fleet current position");
      console.error(err);
    }

    return buildInternalServerError(
      "Unable to retrieve the fleet current position",
    );
  },
);
