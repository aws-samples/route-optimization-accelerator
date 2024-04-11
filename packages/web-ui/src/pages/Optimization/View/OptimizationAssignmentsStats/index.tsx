/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React, { useEffect, useState } from "react";
import {
  Optimization,
  OptimizationAssignmentResult,
  OptimizationFleetDetail,
  OptimizationOrderDetail,
  OptimizationResult,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import {
  Badge,
  ColumnLayout,
  ExpandableSection,
  Popover,
  ProgressBar,
  SpaceBetween,
} from "@cloudscape-design/components";
import { ValueWithLabel } from "../../../../components/ValueWithLabel";
import { NumberFormatter } from "../../../../components/NumberFormatter";
import { Duration } from "../../../../components/Duration";
import { getById } from "../../../../utils/common";

export interface AssignementStats {
  totalOrders: number;
  totalVehicles: number;
  totalVirtualVehicles: number;
  usedVehicles: number;
  usedVirtualVehicles: number;
  assignedOrders: number;
  totalDistance: number;
  totalDuration: number;
  availableVolume: number;
  requiredVolume: number;
  usedVolume: number;
  plannedVolume: number;
  virtualVehiclesVolume: number;
  availableCapacity: number;
  requiredCapacity: number;
  usedCapacity: number;
  plannedCapacity: number;
  virtualVehiclesCapacity: number;
}

const totalOrdersReducer = (acc: number, val: OptimizationAssignmentResult) =>
  acc + val.orders.length;
const totalDistance = (acc: number, val: OptimizationAssignmentResult) =>
  acc + val.totalTravelDistance / 1000;
const totalDuration = (acc: number, val: OptimizationAssignmentResult) =>
  acc + val.totalTimeDuration;
const usedVirtualVehicles = (acc: number, val: OptimizationAssignmentResult) =>
  acc + (val.isVirtual ? 1 : 0);
const usedVolume = (acc: number, val: OptimizationAssignmentResult) =>
  acc + val.totalVolume;
const requiredVolume = (acc: number, val: OptimizationOrderDetail) =>
  acc + (val.attributes ? val.attributes.volume || 0 : 0);
const availableVolume = (acc: number, val: OptimizationFleetDetail) =>
  acc + (val.limits ? val.limits.maxVolume || 0 : 0);
const usedCapacity = (acc: number, val: OptimizationAssignmentResult) =>
  acc + val.totalWeight;
const requiredCapacity = (acc: number, val: OptimizationOrderDetail) =>
  acc + (val.attributes ? val.attributes.weight || 0 : 0);
const availableCapacity = (acc: number, val: OptimizationFleetDetail) =>
  acc + (val.limits ? val.limits.maxCapacity || 0 : 0);

export interface OptmizationAssignmentsStatsProps {
  optimization?: Optimization;
  optimizationResult?: OptimizationResult;
}

const OptmizationAssignmentsStats: React.FC<
  OptmizationAssignmentsStatsProps
> = ({ optimizationResult, optimization }) => {
  const [optimizationResultAssignements, setOptimizationResultAssignements] =
    useState<OptimizationAssignmentResult[]>([]);
  const [stats, setStats] = useState<AssignementStats>();
  const [expanded, setExpanded] = useState<boolean>(false);

  useEffect(() => {
    setExpanded(!!optimizationResult);
    if (optimizationResult) {
      setOptimizationResultAssignements(
        (optimizationResult.assignments || []).filter(
          (t) => t && t.orders && t.orders.length > 0,
        ),
      );
    }
  }, [optimizationResult]);

  useEffect(() => {
    if (optimization) {
      let virtualVehiclesCount = 0;
      let virtualVehiclesVolume = 0;
      let virtualVehiclesCapacity = 0;

      if (optimization.config && optimization.config.virtualFleet) {
        virtualVehiclesCount = optimization.config.virtualFleet.reduce(
          (acc, q) => q.size + acc,
          0,
        );
        virtualVehiclesVolume = optimization.config.virtualFleet.reduce(
          (acc, q) => {
            const additionalVolume =
              (q.limits ? q.limits?.maxVolume || 0 : 0) * q.size;

            return additionalVolume + acc;
          },
          0,
        );
        virtualVehiclesCapacity = optimization.config.virtualFleet.reduce(
          (acc, q) => {
            const additionalCapacity =
              (q.limits ? q.limits?.maxCapacity || 0 : 0) * q.size;

            return additionalCapacity + acc;
          },
          0,
        );
      }

      const usedVehicleIds = optimizationResultAssignements.map((q) => ({
        id: q.fleetId,
        isVirtual: q.isVirtual,
        virtualGroupId: q.virtualGroupId,
      }));
      const plannedValues = usedVehicleIds.reduce(
        (acc, item) => {
          let capacity = 0;
          let volume = 0;

          if (!item.isVirtual) {
            const vehicle = getById(optimization.fleet, item.id)!;
            capacity = vehicle.limits?.maxCapacity || 0;
            volume = vehicle.limits?.maxVolume || 0;
          } else {
            const vehicleGroup = getById(
              optimization.config?.virtualFleet!,
              item.virtualGroupId!,
              "groupId",
            )!;

            capacity = vehicleGroup.limits?.maxCapacity || 0;
            volume = vehicleGroup.limits?.maxVolume || 0;
          }

          return {
            capacity: acc.capacity + capacity,
            volume: acc.volume + volume,
          };
        },
        { capacity: 0, volume: 0 },
      );

      setStats({
        totalOrders: optimization.orders.length,
        assignedOrders: optimizationResultAssignements.reduce(
          totalOrdersReducer,
          0,
        ),
        totalVehicles: optimization.fleet.length + virtualVehiclesCount,
        totalVirtualVehicles: virtualVehiclesCount,
        usedVehicles: optimizationResultAssignements.length,
        usedVirtualVehicles: optimizationResultAssignements.reduce(
          usedVirtualVehicles,
          0,
        ),
        totalDistance: optimizationResultAssignements.reduce(totalDistance, 0),
        totalDuration: optimizationResultAssignements.reduce(totalDuration, 0),
        availableVolume:
          optimization.fleet.reduce(availableVolume, 0) + virtualVehiclesVolume,
        requiredVolume: optimization.orders.reduce(requiredVolume, 0),
        usedVolume: optimizationResultAssignements.reduce(usedVolume, 0),
        plannedVolume: plannedValues.volume || 1,
        virtualVehiclesVolume,
        availableCapacity:
          optimization.fleet.reduce(availableCapacity, 0) +
          virtualVehiclesCapacity,
        plannedCapacity: plannedValues.capacity || 1,
        requiredCapacity: optimization.orders.reduce(requiredCapacity, 0),
        usedCapacity: optimizationResultAssignements.reduce(usedCapacity, 0),
        virtualVehiclesCapacity,
      });
    }
  }, [optimization, optimizationResultAssignements]);

  return (
    <>
      {optimization &&
        optimizationResultAssignements &&
        stats &&
        !optimizationResult?.error && (
          <ExpandableSection
            variant="footer"
            headerText="Assignments Details"
            expanded={expanded}
            onChange={() => setExpanded((old) => !old)}
          >
            <ColumnLayout columns={3} variant="text-grid">
              <SpaceBetween size="l">
                <ValueWithLabel label="Score">
                  <SpaceBetween size="xxs" direction="horizontal">
                    <Badge color="red">
                      {optimizationResult?.score?.hard} Hard
                    </Badge>

                    <Badge color="grey">
                      {optimizationResult?.score?.medium} Medium
                    </Badge>

                    <Badge color="blue">
                      {optimizationResult?.score?.soft} Soft
                    </Badge>
                  </SpaceBetween>
                </ValueWithLabel>

                <ValueWithLabel label="Total orders">
                  <NumberFormatter value={stats.totalOrders} />
                </ValueWithLabel>

                <ValueWithLabel
                  label="Total Vehicles"
                  actions={
                    stats.totalVirtualVehicles > 0 && (
                      <Popover
                        content={`Includes ${stats.totalVirtualVehicles} virtual vehicles`}
                      >
                        Info
                      </Popover>
                    )
                  }
                >
                  <NumberFormatter value={stats.totalVehicles} />
                </ValueWithLabel>

                <ValueWithLabel
                  label="Available Volume"
                  actions={
                    stats.virtualVehiclesVolume > 0 && (
                      <Popover
                        content={`Includes additional ${stats.virtualVehiclesVolume} provided by virtual vehicles`}
                      >
                        Info
                      </Popover>
                    )
                  }
                >
                  <NumberFormatter
                    value={stats.availableVolume}
                    decimalDigits={2}
                  />
                </ValueWithLabel>

                <ValueWithLabel
                  label="Available Capacity"
                  actions={
                    stats.virtualVehiclesCapacity > 0 && (
                      <Popover
                        content={`Includes additional ${stats.virtualVehiclesCapacity} provided by virtual vehicles`}
                      >
                        Info
                      </Popover>
                    )
                  }
                >
                  <NumberFormatter
                    value={stats.availableCapacity}
                    decimalDigits={2}
                  />
                </ValueWithLabel>
              </SpaceBetween>

              <SpaceBetween size="l">
                <ValueWithLabel label="Total Distance (Km)">
                  <NumberFormatter
                    value={stats.totalDistance}
                    decimalDigits={2}
                  />
                </ValueWithLabel>

                <ValueWithLabel label="Assigned orders">
                  <NumberFormatter value={stats.assignedOrders} />
                </ValueWithLabel>

                <ValueWithLabel
                  label="Assigned Vehicles"
                  actions={
                    stats.usedVirtualVehicles > 0 && (
                      <Popover
                        content={`Includes ${stats.usedVirtualVehicles} virtual vehicles`}
                      >
                        Info
                      </Popover>
                    )
                  }
                >
                  <NumberFormatter value={stats.usedVehicles} />
                </ValueWithLabel>

                <ValueWithLabel label="Required volume">
                  <NumberFormatter
                    value={stats.requiredVolume}
                    decimalDigits={2}
                  />
                </ValueWithLabel>

                <ValueWithLabel label="Required capacity">
                  <NumberFormatter
                    value={stats.requiredCapacity}
                    decimalDigits={2}
                  />
                </ValueWithLabel>
              </SpaceBetween>

              <SpaceBetween size="l">
                <ValueWithLabel label="Total Duration">
                  <Duration
                    value={stats.totalDuration}
                    unit="seconds"
                    format="D [Days] HH:mm:ss"
                  />
                </ValueWithLabel>

                <ValueWithLabel label="Assigned Orders (%)">
                  <ProgressBar
                    value={(stats.assignedOrders / stats.totalOrders) * 100}
                  />
                </ValueWithLabel>
                <ValueWithLabel label="Used Vehicles (%)">
                  <ProgressBar
                    value={(stats.usedVehicles / stats.totalVehicles) * 100}
                  />
                </ValueWithLabel>
                <ValueWithLabel
                  label="Used volume (%)"
                  actions={
                    <Popover
                      content={
                        <>
                          Based on planned volume of{" "}
                          <NumberFormatter
                            value={stats.plannedVolume}
                            decimalDigits={2}
                          />
                        </>
                      }
                    >
                      Info
                    </Popover>
                  }
                >
                  <ProgressBar
                    value={(stats.usedVolume / stats.plannedVolume) * 100}
                  />
                </ValueWithLabel>
                <ValueWithLabel
                  label="Used capacity (%)"
                  actions={
                    <Popover
                      content={
                        <>
                          Based on planned capacity of{" "}
                          <NumberFormatter
                            value={stats.plannedCapacity}
                            decimalDigits={2}
                          />
                        </>
                      }
                    >
                      Info
                    </Popover>
                  }
                >
                  <ProgressBar
                    value={(stats.usedCapacity / stats.plannedCapacity) * 100}
                  />
                </ValueWithLabel>
              </SpaceBetween>
            </ColumnLayout>
          </ExpandableSection>
        )}
    </>
  );
};

export default OptmizationAssignmentsStats;
