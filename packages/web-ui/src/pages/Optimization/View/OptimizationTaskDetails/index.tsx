/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React from "react";
import {
  Optimization,
  OptimizationResult,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import {
  ColumnLayout,
  Link,
  Popover,
  SpaceBetween,
  Toggle,
} from "@cloudscape-design/components";
import { ValueWithLabel } from "../../../../components/ValueWithLabel";
import { OptimizationStatus } from "../../../../components/OptimizationStatus";
import { Duration } from "../../../../components/Duration";
import {
  DateTimeLabel,
  DateTimeLabelMode,
  InitialRelativeMode,
} from "../../../../components/DateTimeLabel";
import CopyComponent from "../../../../components/CopyComponent";

export interface OptimizationTaskDetailsProps {
  optimization?: Optimization;
  optimizationResult?: OptimizationResult;
}

const OptimizationTaskDetails: React.FC<OptimizationTaskDetailsProps> = ({
  optimization,
  optimizationResult,
}) => {
  const isTaskActive = () => {
    return optimization != null && optimization.isActive === "Y";
  };

  const virtualFleetLength = () => {
    return optimization &&
      optimization.config &&
      optimization.config.virtualFleet
      ? optimization.config.virtualFleet.reduce((acc, q) => q.size + acc, 0)
      : 0;
  };

  const computeTotalFleetSize = () => {
    if (optimization) {
      return optimization.fleet.length + virtualFleetLength();
    }

    return null;
  };

  return (
    <ColumnLayout columns={3} variant="text-grid">
      <SpaceBetween size="l">
        <ValueWithLabel label="Id">
          <CopyComponent
            text={optimization?.problemId!}
            textToCopy={optimization?.problemId!}
            name="Id"
          />
        </ValueWithLabel>

        <ValueWithLabel label="Fleet Size">
          {virtualFleetLength() > 0 ? (
            <Popover
              position="top"
              size="medium"
              triggerType="text"
              content={`Of which ${virtualFleetLength()} composed by virtual vehicles`}
            >
              {computeTotalFleetSize()}
            </Popover>
          ) : (
            computeTotalFleetSize()
          )}
        </ValueWithLabel>

        <ValueWithLabel label="Created At">
          <DateTimeLabel
            timestamp={optimization?.createdAt}
            mode={DateTimeLabelMode.Relative}
            initialRelativeMode={InitialRelativeMode.Absolute}
          />
        </ValueWithLabel>
      </SpaceBetween>

      <SpaceBetween size="l">
        <ValueWithLabel label="Status">
          {optimization?.status !== "ERROR" ? (
            <OptimizationStatus status={optimization?.status || "PENDING"} />
          ) : (
            <Popover content={optimizationResult?.error?.errorMessage}>
              <OptimizationStatus status={"ERROR"} />
            </Popover>
          )}
        </ValueWithLabel>

        <ValueWithLabel label="Orders">
          {optimization?.orders.length}
        </ValueWithLabel>

        <ValueWithLabel label="Updated At">
          <DateTimeLabel
            timestamp={optimization?.updatedAt}
            mode={DateTimeLabelMode.Relative}
            initialRelativeMode={InitialRelativeMode.Absolute}
          />
        </ValueWithLabel>
      </SpaceBetween>

      <SpaceBetween size="l">
        <ValueWithLabel label="Is Active">
          <Toggle checked={isTaskActive()} disabled>
            This optimization task is {isTaskActive() ? "active" : "inactive"}
          </Toggle>
        </ValueWithLabel>

        <ValueWithLabel label="Total Duration">
          <Duration
            from={optimization?.createdAt}
            to={optimization?.updatedAt}
          />
        </ValueWithLabel>

        <ValueWithLabel label="CloudWatch Logs">
          {optimization?.executionDetails ? (
            <Link
              external
              href={`https://${
                optimization?.executionDetails.log.region
              }.console.aws.amazon.com/cloudwatch/home?region=${
                optimization?.executionDetails.log.region
              }#logsV2:log-groups/log-group/${
                optimization?.executionDetails.log.group
              }/log-events/${encodeURIComponent(
                optimization?.executionDetails.log.stream,
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              AWS Logs in CloudWatch
            </Link>
          ) : (
            "-"
          )}
        </ValueWithLabel>
      </SpaceBetween>
    </ColumnLayout>
  );
};

export default OptimizationTaskDetails;
