/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  BatchDeleteDevicePositionHistoryCommand,
  LocationClient,
} from "@aws-sdk/client-location";
import { DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { deleteFleetHandler } from "@route-optimization-accelerator/web-api-service-typescript-runtime";
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

export const handler = deleteFleetHandler(
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

      await location.send(
        new BatchDeleteDevicePositionHistoryCommand({
          DeviceIds: [id],
          TrackerName: process.env.FLEET_TRACKER,
        }),
      );

      await ddb.send(
        new DeleteCommand({
          TableName: process.env.FLEET_TABLE_NAME,
          Key: { id },
        }),
      );

      return {
        statusCode: 200,
        body: {
          deleted: true,
        },
      };
    } catch (err) {
      console.error("Error deleting the fleet member");
      console.error(err);
    }

    return buildInternalServerError("Unable to delete the fleet member");
  },
);
