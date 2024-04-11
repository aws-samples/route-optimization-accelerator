/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  BatchUpdateDevicePositionCommand,
  LocationClient,
} from "@aws-sdk/client-location";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import {
  Place,
  createPlaceHandler,
} from "@route-optimization-accelerator/web-api-service-typescript-runtime";
import * as uuid from "uuid";
import { getDynamoDBClient } from "../../../../common/defaults";
import {
  buildBadRequest,
  buildInternalServerError,
  customHeadersInterceptor,
} from "../../../../common/lambda-commons";

const ddb = getDynamoDBClient();
const location = new LocationClient({});

export const handler = createPlaceHandler(
  customHeadersInterceptor,
  async ({ input }) => {
    console.debug("Input: ", JSON.stringify(input, null, 2));
    const createRequest = input.body.data;

    try {
      if (!uuid.validate(createRequest.id)) {
        return buildBadRequest("The provided id is not a valid UUID");
      }
      const time = Date.now();
      const obj: Place = {
        ...createRequest,
        isActive: "Y",
        createdAt: time,
        updatedAt: time,
      };

      await location.send(
        new BatchUpdateDevicePositionCommand({
          TrackerName: process.env.PLACE_TRACKER,
          Updates: [
            {
              DeviceId: obj.id,
              Position: [obj.position.longitude, obj.position.latitude],
              SampleTime: new Date(),
              PositionProperties: {
                name: obj.name,
              },
            },
          ],
        }),
      );

      await ddb.send(
        new PutCommand({
          Item: obj,
          TableName: process.env.PLACE_TABLE_NAME,
        }),
      );

      return {
        statusCode: 200,
        body: {
          data: obj,
        },
      };
    } catch (ex) {
      console.error("Error writing the item in the database");
      console.error(ex);
    }

    return buildInternalServerError("Unable to persist the place");
  },
);
