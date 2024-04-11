/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  Alert,
  ColumnLayout,
  Header,
  SpaceBetween,
  Table,
  Toggle,
} from "@cloudscape-design/components";
import { OptimizationConfiguration as OptimizationConfigurationType } from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import React from "react";
import { ValueWithLabel } from "../ValueWithLabel";
import {
  capitalizeFirstLetter,
  getDefaultIfUndefined,
} from "../../utils/common";
import { Duration, DurationFormats } from "../Duration";
import MapPopover from "../MapPopover";
import {
  DateFormats,
  DateTimeLabel,
  DateTimeLabelMode,
} from "../DateTimeLabel";
import { Tags } from "../Tags";
import dayjs from "../../utils/dayjs";
import FleetLimitsPopover from "../FleetLimitPopover";

export interface OptimizationConfigurationProps {
  config?: OptimizationConfigurationType;
}

export const DEFAULT_CONFIG: OptimizationConfigurationType = {
  distanceMatrixType: "ROAD_DISTANCE",
  avoidTolls: false,
  explain: false,
  backToOrigin: true,
  maxSolverDuration: 60 * 5,
  maxUnimprovedSolverDuration: 10,
  maxDistance: undefined,
  maxOrders: undefined,
  maxTime: undefined,
  virtualFleet: undefined,
  constraints: {
    earlyArrival: { weight: 1 },
    virtualVehicle: { weight: 1 },
    vehicleVolume: { weight: 1 },
    vehicleWeight: { weight: 1 },
    lateArrival: { weight: 1 },
    lateDeparture: { weight: 1 },
    maxDistance: { weight: 1 },
    maxTime: { weight: 1 },
    orderCount: { weight: 1 },
    orderRequirements: { weight: 1 },
    travelDistance: { weight: 1 },
    travelTime: { weight: 1 },
  },
};

export const OptimizationConfiguration: React.FC<
  OptimizationConfigurationProps
> = ({ config }) => {
  return (
    <SpaceBetween size="l">
      <ColumnLayout columns={3} variant="text-grid">
        <SpaceBetween size="l">
          <ValueWithLabel label="Distance Matrix Type">
            {capitalizeFirstLetter(
              (config?.distanceMatrixType || DEFAULT_CONFIG.distanceMatrixType)
                ?.replace("_", " ")
                .toLocaleLowerCase()!,
            )}
          </ValueWithLabel>

          <ValueWithLabel label="Maximum Distance">
            {getDefaultIfUndefined(
              config?.maxDistance,
              DEFAULT_CONFIG.maxDistance || "-",
            )}
          </ValueWithLabel>

          <ValueWithLabel label="Vehicle Departure Time">
            {config?.vehicleDepartureTime || "-"}
          </ValueWithLabel>

          <ValueWithLabel label="Explain">
            <Toggle
              disabled
              checked={getDefaultIfUndefined(
                config?.explain,
                DEFAULT_CONFIG.explain!,
              )}
            />
          </ValueWithLabel>
        </SpaceBetween>

        <SpaceBetween size="l">
          <ValueWithLabel label="Max Solver Duration">
            <Duration
              value={
                config?.maxSolverDuration || DEFAULT_CONFIG.maxSolverDuration
              }
              unit="seconds"
            />
          </ValueWithLabel>
          <ValueWithLabel label="Maximum Time">
            {config?.maxTime
              ? dayjs
                  .duration(config?.maxTime, "seconds")
                  .format(DurationFormats.default)
              : "-"}
          </ValueWithLabel>

          <ValueWithLabel label="Back to Origin">
            <Toggle
              disabled
              checked={getDefaultIfUndefined(
                config?.backToOrigin,
                DEFAULT_CONFIG.backToOrigin!,
              )}
            />
          </ValueWithLabel>
        </SpaceBetween>

        <SpaceBetween size="l">
          <ValueWithLabel label="Max Unimproved Solver Duration">
            <Duration
              value={
                config?.maxUnimprovedSolverDuration ||
                DEFAULT_CONFIG.maxUnimprovedSolverDuration
              }
              unit="seconds"
            />
          </ValueWithLabel>

          <ValueWithLabel label="Maximum Orders">
            {config?.maxOrders || DEFAULT_CONFIG.maxOrders || "-"}
          </ValueWithLabel>

          <ValueWithLabel label="Avoid Tolls">
            <Toggle
              disabled
              checked={getDefaultIfUndefined(
                config?.avoidTolls,
                DEFAULT_CONFIG.avoidTolls!,
              )}
            />
          </ValueWithLabel>
        </SpaceBetween>
      </ColumnLayout>
      <Header variant="h3">Virtual Vehicles</Header>
      {config?.virtualFleet ? (
        <Table
          columnDefinitions={[
            {
              id: "groupId",
              header: "Group ID",
              cell: (e) => e.groupId,
            },
            {
              id: "size",
              header: "Size",
              cell: (e) => e.size,
            },
            {
              id: "backToOrigin",
              header: "Back to Origin",
              cell: (e) => (
                <Toggle
                  disabled
                  checked={
                    e.backToOrigin !== undefined
                      ? e.backToOrigin
                      : DEFAULT_CONFIG.backToOrigin!
                  }
                />
              ),
            },
            {
              id: "startingLocation",
              header: "Starting Location",
              cell: (e) => (
                <MapPopover
                  lat={e.startingLocation.latitude}
                  lon={e.startingLocation.longitude}
                  markers={[
                    [
                      e.startingLocation.longitude,
                      e.startingLocation.latitude,
                      { color: "red", popupContent: <>Starting Location</> },
                    ],
                  ]}
                >
                  location
                </MapPopover>
              ),
            },
            {
              id: "limits",
              header: "Limits",
              cell: (e) => <FleetLimitsPopover limits={e.limits} />,
            },
            {
              id: "preferredDepartureTime",
              header: "Preferred Departure",
              cell: (e) =>
                e.preferredDepartureTime ? (
                  <DateTimeLabel
                    timestamp={new Date(e.preferredDepartureTime!).getTime()}
                    mode={DateTimeLabelMode.Custom}
                    customFormat={DateFormats.default}
                  />
                ) : (
                  "-"
                ),
            },
            {
              id: "attributes",
              header: "Attributes",
              cell: (e) => <Tags tags={e.attributes} />,
            },
          ]}
          items={config.virtualFleet}
        ></Table>
      ) : (
        <Alert type="info">Virtual fleet not defined, will not be used</Alert>
      )}

      <Header variant="h3">Weights</Header>
      <ColumnLayout columns={3} variant="text-grid">
        <SpaceBetween size="l">
          <ValueWithLabel label="Early Arrival">
            {getDefaultIfUndefined(
              config?.constraints?.earlyArrival?.weight,
              DEFAULT_CONFIG.constraints?.earlyArrival?.weight!,
            )}
          </ValueWithLabel>

          <ValueWithLabel label="Virtual Vehicle">
            {getDefaultIfUndefined(
              config?.constraints?.virtualVehicle?.weight,
              DEFAULT_CONFIG.constraints?.virtualVehicle?.weight!,
            )}
          </ValueWithLabel>

          <ValueWithLabel label="Max Distance">
            {getDefaultIfUndefined(
              config?.constraints?.maxDistance?.weight,
              DEFAULT_CONFIG.constraints?.maxDistance?.weight!,
            )}
          </ValueWithLabel>

          <ValueWithLabel label="Travel Time">
            {getDefaultIfUndefined(
              config?.constraints?.travelTime?.weight,
              DEFAULT_CONFIG.constraints?.travelTime?.weight!,
            )}
          </ValueWithLabel>
        </SpaceBetween>

        <SpaceBetween size="l">
          <ValueWithLabel label="Late Arrival">
            {getDefaultIfUndefined(
              config?.constraints?.lateArrival?.weight,
              DEFAULT_CONFIG.constraints?.lateArrival?.weight!,
            )}
          </ValueWithLabel>

          <ValueWithLabel label="Vehicle Volume">
            {getDefaultIfUndefined(
              config?.constraints?.vehicleVolume?.weight,
              DEFAULT_CONFIG.constraints?.vehicleVolume?.weight!,
            )}
          </ValueWithLabel>

          <ValueWithLabel label="Max Time">
            {getDefaultIfUndefined(
              config?.constraints?.maxTime?.weight,
              DEFAULT_CONFIG.constraints?.maxTime?.weight!,
            )}
          </ValueWithLabel>

          <ValueWithLabel label="Order Count">
            {getDefaultIfUndefined(
              config?.constraints?.orderCount?.weight,
              DEFAULT_CONFIG.constraints?.orderCount?.weight!,
            )}
          </ValueWithLabel>
        </SpaceBetween>

        <SpaceBetween size="l">
          <ValueWithLabel label="Late Departure">
            {getDefaultIfUndefined(
              config?.constraints?.lateDeparture?.weight,
              DEFAULT_CONFIG.constraints?.lateDeparture?.weight!,
            )}
          </ValueWithLabel>

          <ValueWithLabel label="Vehicle Weight">
            {getDefaultIfUndefined(
              config?.constraints?.vehicleWeight?.weight,
              DEFAULT_CONFIG.constraints?.vehicleWeight?.weight!,
            )}
          </ValueWithLabel>

          <ValueWithLabel label="Travel Distance">
            {getDefaultIfUndefined(
              config?.constraints?.travelDistance?.weight,
              DEFAULT_CONFIG.constraints?.travelDistance?.weight!,
            )}
          </ValueWithLabel>

          <ValueWithLabel label="Order Requirements">
            {getDefaultIfUndefined(
              config?.constraints?.orderRequirements?.weight,
              DEFAULT_CONFIG.constraints?.orderRequirements?.weight!,
            )}
          </ValueWithLabel>
        </SpaceBetween>
      </ColumnLayout>
    </SpaceBetween>
  );
};
export default OptimizationConfiguration;
