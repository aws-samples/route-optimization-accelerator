/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/

// default map provider to use for routing decisions and UI visualization
export const DEFAULT_MAP_PROVIDER = "Here";

// list of service names that are supported for event bridge filtering
export const SERVICE_NAME = {
  // roa stands for - routing optimization accelerator
  OPTIMIZATION: "roa.services.optimization",
};

// list of event types that the application will emit
export const EVENT_NAME = {
  [SERVICE_NAME.OPTIMIZATION]: {
    OPTIMIZATION_METADATA_UPDATE: "OPTIMIZATION_METADATA_UPDATE",
    OPTIMIZATION_IN_PROGRESS: "OPTIMIZATION_IN_PROGRESS",
    OPTIMIZATION_COMPLETED: "OPTIMIZATION_COMPLETED",
    OPTIMIZATION_ERROR: "OPTIMIZATION_ERROR",
  },
};

export const OPTIMIZATION_STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  ERROR: "ERROR",
  WARNING: "WARNING",
  SUCCESS: "SUCCESS",
};
