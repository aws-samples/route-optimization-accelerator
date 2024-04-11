/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { Box } from "@cloudscape-design/components";
import { FleetLimit } from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import React from "react";
import { NumberFormatter } from "../NumberFormatter";

export interface VehicleLimitsProps extends React.PropsWithChildren {
  limits?: FleetLimit;
}

export const VehicleLimits: React.FC<VehicleLimitsProps> = ({ limits }) => (
  <Box>
    {limits?.maxCapacity && (
      <p>
        <strong>Maximum Capacity</strong>:{" "}
        <NumberFormatter value={limits?.maxCapacity} decimalDigits={2} />
      </p>
    )}
    {limits?.maxVolume && (
      <p>
        <strong>Maximum Volume</strong>:{" "}
        <NumberFormatter value={limits?.maxVolume} decimalDigits={2} />
      </p>
    )}
    {limits?.maxDistance && (
      <p>
        <strong>Maximum Distance</strong>:{" "}
        <NumberFormatter value={limits?.maxDistance} decimalDigits={2} />
      </p>
    )}
    {limits?.maxTime && (
      <p>
        <strong>Maximum Time</strong>:{" "}
        <NumberFormatter value={limits?.maxTime} />
      </p>
    )}
    {limits?.maxOrders && (
      <p>
        <strong>Maximum Orders</strong>:{" "}
        <NumberFormatter value={limits?.maxOrders} />
      </p>
    )}
  </Box>
);
