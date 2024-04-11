/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  BatchUpdateDevicePositionCommand,
  LocationClient,
} from "@aws-sdk/client-location";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import {
  FleetCurrentPositionData,
  updateFleetCurrentPositionHandler,
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

export const handler = updateFleetCurrentPositionHandler(
  customHeadersInterceptor,
  async ({ input }) => {
    try {
      const id = input.requestParameters.id;
      const data = input.body.data;

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

      await location.send(
        new BatchUpdateDevicePositionCommand({
          TrackerName: process.env.FLEET_TRACKER!,
          Updates: [
            {
              DeviceId: id,
              Position: [data.position.longitude, data.position.latitude],
              SampleTime: new Date(),
              PositionProperties: {
                name: result.Item.name,
              },
            },
          ],
        }),
      );

      const outputData: FleetCurrentPositionData = {
        id: result.Item.id,
        name: result.Item.name,
        position: data.position,
      };

      return {
        statusCode: 200,
        body: {
          data: outputData,
        },
      };
    } catch (err) {
      console.error("Unable to update the fleet current position");
      console.error(err);
    }

    return buildInternalServerError(
      "Unable to update the fleet current position",
    );
  },
);
