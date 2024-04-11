/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  StatusIndicator,
  StatusIndicatorProps,
} from "@cloudscape-design/components";
import * as hooks from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import React from "react";
import { capitalizeFirstLetter } from "../../utils/common";

export interface OptimizationStatusProps extends React.PropsWithChildren {
  status: hooks.OptimizationStatus;
}

export const OptimizationStatus: React.FC<OptimizationStatusProps> = ({
  status,
}) => {
  const geTypeFromStatus = (): StatusIndicatorProps.Type => {
    switch (status) {
      case "IN_PROGRESS":
        return "in-progress";
      case "PENDING":
        return "pending";
      case "SUCCESS":
        return "success";
      case "WARNING":
        return "warning";
      case "ERROR":
      default:
        return "error";
    }
  };

  return (
    <StatusIndicator type={geTypeFromStatus()}>
      {capitalizeFirstLetter(status.replace("_", " ").toLowerCase())}
    </StatusIndicator>
  );
};
