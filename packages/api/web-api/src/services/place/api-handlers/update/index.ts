/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  BatchUpdateDevicePositionCommand,
  LocationClient,
} from "@aws-sdk/client-location";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { updatePlaceHandler } from "@route-optimization-accelerator/web-api-service-typescript-runtime";
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

export const handler = updatePlaceHandler(
  customHeadersInterceptor,
  async ({ input }) => {
    try {
      const id = input.requestParameters.id;
      const placeData = input.body.data;
      const time = Date.now();

      if (!uuid.validate(id)) {
        return buildBadRequest("The provided id is not a valid UUID");
      }

      const result = await ddb.send(
        new GetCommand({
          Key: {
            id,
          },
          TableName: process.env.PLACE_TABLE_NAME,
        }),
      );

      if (!result.Item) {
        return buildNotFound(`The item with id '${id}' could not be found`);
      }

      await location.send(
        new BatchUpdateDevicePositionCommand({
          TrackerName: process.env.PLACE_TRACKER,
          Updates: [
            {
              DeviceId: placeData.id,
              Position: [
                placeData.position.longitude,
                placeData.position.latitude,
              ],
              SampleTime: new Date(),
              PositionProperties: {
                name: placeData.name,
              },
            },
          ],
        }),
      );

      await ddb.send(
        new UpdateCommand({
          TableName: process.env.PLACE_TABLE_NAME,
          Key: {
            id,
          },
          UpdateExpression:
            "SET #updatedAt = :updatedAt, #address = :address, #name = :name, #type = :type, #position = :position",
          ExpressionAttributeValues: {
            ":updatedAt": time,
            ":address": placeData.address,
            ":name": placeData.name,
            ":type": placeData.type,
            ":position": {
              latitude: placeData.position.latitude,
              longitude: placeData.position.longitude,
            },
          },
          ExpressionAttributeNames: {
            "#updatedAt": "updatedAt",
            "#address": "address",
            "#name": "name",
            "#type": "type",
            "#position": "position",
          },
        }),
      );

      return {
        statusCode: 200,
        body: {
          data: {
            ...placeData,
            updatedAt: time,
          },
        },
      };
    } catch (err) {
      console.error("Error updating the place");
      console.error(err);
    }

    return buildInternalServerError("Unable to update the place");
  },
);
