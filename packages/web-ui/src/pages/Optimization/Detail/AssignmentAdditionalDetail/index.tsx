/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  Button,
  ColumnLayout,
  ExpandableSection,
  Modal,
  ProgressBar,
  SpaceBetween,
  Toggle,
} from "@cloudscape-design/components";
import {
  OptimizationAssignmentOrderResult,
  OptimizationAssignmentResult,
  OptimizationConfiguration,
  OptimizationFleetDetail,
  OptimizationOrderDetail,
  OrderAttributes,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import React, { useEffect, useState } from "react";
import { ValueWithLabel } from "../../../../components/ValueWithLabel";
import {
  DateFormats,
  DateTimeLabel,
  DateTimeLabelMode,
} from "../../../../components/DateTimeLabel";
import { Duration } from "../../../../components/Duration";
import { NumberFormatter } from "../../../../components/NumberFormatter";
import { Optional, getById } from "../../../../utils/common";
import MapPopover from "../../../../components/MapPopover";
import { Tags } from "../../../../components/Tags";
import OptimizationConfigurationComponent, {
  DEFAULT_CONFIG,
} from "../../../../components/OptimizationConfiguration";
import FleetLimitsPopover from "../../../../components/FleetLimitPopover";

export interface AssignmentDetailProps {
  config?: OptimizationConfiguration;
  assignmentResult?: OptimizationAssignmentResult;
  optimizationFleet?: OptimizationFleetDetail[];
  optimizationOrders?: OptimizationOrderDetail[];
}
export interface AssignedOrderDetails
  extends OptimizationOrderDetail,
    OptimizationAssignmentOrderResult {}

const AssignmentAdditionalDetail: React.FC<AssignmentDetailProps> = ({
  config,
  assignmentResult,
  optimizationFleet,
  optimizationOrders,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [modelVisibility, setModalVisibility] = useState<boolean>(false);
  const [assignmentOrders, setAssignedOrders] = useState<
    AssignedOrderDetails[]
  >([]);
  const [aggregatedAttributes, setAggregatedAttributes] =
    useState<Optional<OrderAttributes>>();
  const [currentVehicle, setCurrentVehicle] =
    useState<Optional<OptimizationFleetDetail>>();

  useEffect(() => {
    if (optimizationOrders && optimizationFleet && assignmentResult) {
      setExpanded(true);
      setAssignedOrders(
        assignmentResult.orders.map((q) => ({
          ...getById(optimizationOrders, q.id)!,
          arrivalTime: q.arrivalTime,
        })),
      );

      if (assignmentResult.isVirtual) {
        const vVehicleConfig = getById(
          config!.virtualFleet!,
          assignmentResult.virtualGroupId!,
          "groupId",
        )!;

        setCurrentVehicle({
          id: assignmentResult.fleetId,
          ...vVehicleConfig,
        });
      } else {
        setCurrentVehicle(
          getById(optimizationFleet, assignmentResult.fleetId)!,
        );
      }
    }
  }, [optimizationOrders, config, optimizationFleet, assignmentResult]);

  useEffect(() => {
    setAggregatedAttributes({
      volume: assignmentOrders.reduce(
        (acc, item) => acc + (item.attributes?.volume || 0),
        0,
      ),
      weight: assignmentOrders.reduce(
        (acc, item) => acc + (item.attributes?.weight || 0),
        0,
      ),
    });
  }, [assignmentOrders]);

  return (
    <ExpandableSection
      variant="footer"
      headerText="Additional Details"
      expanded={expanded}
      onChange={() => setExpanded((old) => !old)}
    >
      <ColumnLayout columns={3} variant="text-grid">
        <SpaceBetween size="l">
          <ValueWithLabel label="Vehicle Id">
            {assignmentResult?.fleetId}
          </ValueWithLabel>
          <ValueWithLabel label="Vehicle location">
            {currentVehicle && (
              <MapPopover
                lat={currentVehicle!.startingLocation.latitude}
                lon={currentVehicle!.startingLocation.longitude}
                markers={[
                  [
                    currentVehicle!.startingLocation.longitude,
                    currentVehicle!.startingLocation.latitude,
                    { color: "red", popupContent: <>Fleet Location</> },
                  ],
                ]}
              >
                Location
              </MapPopover>
            )}
          </ValueWithLabel>
          <ValueWithLabel label="Limits">
            {currentVehicle?.limits ? (
              <FleetLimitsPopover limits={currentVehicle.limits} />
            ) : (
              "-"
            )}
          </ValueWithLabel>

          <ValueWithLabel label="Orders">
            {assignmentResult?.orders.length || 0}
          </ValueWithLabel>

          <ValueWithLabel label="Required volume">
            {aggregatedAttributes?.volume || 0}
          </ValueWithLabel>

          <ValueWithLabel label="Required capacity">
            {aggregatedAttributes?.weight || 0}
          </ValueWithLabel>

          <ValueWithLabel label="Virtual Vehicle group">
            {assignmentResult?.virtualGroupId || "-"}
          </ValueWithLabel>
        </SpaceBetween>

        <SpaceBetween size="l">
          <ValueWithLabel label="Preferred departure time">
            {currentVehicle?.preferredDepartureTime ? (
              <DateTimeLabel
                timestamp={new Date(
                  currentVehicle!.preferredDepartureTime || "",
                ).getTime()}
                mode={DateTimeLabelMode.Custom}
                customFormat={DateFormats.default}
              />
            ) : (
              "-"
            )}
          </ValueWithLabel>

          <ValueWithLabel label="Back to Origin">
            <Toggle
              checked={
                currentVehicle?.backToOrigin !== undefined
                  ? currentVehicle?.backToOrigin
                  : DEFAULT_CONFIG.backToOrigin!
              }
              disabled
            />
          </ValueWithLabel>

          <ValueWithLabel label="Attributes">
            <Tags tags={currentVehicle?.attributes} />
          </ValueWithLabel>

          <ValueWithLabel label="Total distance (Km)">
            <NumberFormatter
              value={(assignmentResult?.totalTravelDistance || 0) / 1000}
              decimalDigits={2}
            />
          </ValueWithLabel>

          <ValueWithLabel label="Available volume">
            {currentVehicle?.limits?.maxVolume || 0}
          </ValueWithLabel>

          <ValueWithLabel label="Available capacity">
            {currentVehicle?.limits?.maxCapacity || 0}
          </ValueWithLabel>
        </SpaceBetween>

        <SpaceBetween size="l">
          <ValueWithLabel label="Suggested departure time">
            <DateTimeLabel
              timestamp={new Date(
                assignmentResult?.departureTime || "",
              ).getTime()}
              mode={DateTimeLabelMode.Custom}
              customFormat={DateFormats.default}
            />
          </ValueWithLabel>

          <ValueWithLabel label="Is Virtual">
            <Toggle checked={assignmentResult?.isVirtual || false} disabled />
          </ValueWithLabel>

          <ValueWithLabel label="Configuration">
            <Modal
              size="max"
              onDismiss={() => setModalVisibility(false)}
              visible={modelVisibility}
            >
              <OptimizationConfigurationComponent config={config} />
            </Modal>
            <Button
              variant="inline-link"
              onClick={() => setModalVisibility(true)}
            >
              Show
            </Button>
          </ValueWithLabel>

          <ValueWithLabel label="Total Duration">
            <Duration
              value={assignmentResult?.totalTimeDuration || 0}
              unit="seconds"
            />
          </ValueWithLabel>

          <ValueWithLabel label="Used Volume (%)">
            <ProgressBar
              value={
                ((aggregatedAttributes?.volume || 0) /
                  (currentVehicle?.limits?.maxVolume || 1)) *
                100
              }
            />
          </ValueWithLabel>

          <ValueWithLabel label="Used Capacity (%)">
            <ProgressBar
              value={
                ((aggregatedAttributes?.weight || 0) /
                  (currentVehicle?.limits?.maxCapacity || 1)) *
                100
              }
            />
          </ValueWithLabel>
        </SpaceBetween>
      </ColumnLayout>
    </ExpandableSection>
  );
};

export default AssignmentAdditionalDetail;
