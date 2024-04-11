/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { Popover } from "@cloudscape-design/components";
import { FleetLimit } from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import React from "react";
import { VehicleLimits } from "../VehicleLimits";

export interface FleetLimitsPopoverProps {
  limits?: FleetLimit;
  label?: string;
}

const FleetLimitsPopover: React.FC<FleetLimitsPopoverProps> = ({
  limits,
  label,
}) => {
  return (
    <>
      {limits ? (
        <Popover
          position="top"
          size="large"
          triggerType="text"
          content={<VehicleLimits limits={limits} />}
        >
          {label || "limits"}
        </Popover>
      ) : (
        "-"
      )}
    </>
  );
};

export default FleetLimitsPopover;
