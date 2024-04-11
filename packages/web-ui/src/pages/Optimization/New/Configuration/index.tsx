/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  Alert,
  Box,
  Container,
  DatePicker,
  FormField,
  Grid,
  Header,
  Input,
  Select,
  SpaceBetween,
  TimeInput,
  Toggle,
} from "@cloudscape-design/components";
import React, { useCallback, useEffect, useState } from "react";
import {
  DistanceMatrixType,
  OptimizationConfiguration,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import { Optional } from "../../../../utils/common";
import { DEFAULT_CONFIG } from "../../../../components/OptimizationConfiguration";
import VirtualFleetReview from "../VirtualFleetReview";
import NewVirtualFleetModal from "../NewVirtualFleet";
import ConstraintEditor from "../../../../components/ConstraintEditor";

export interface TaskConfigurationProps {
  date?: string;
  config?: OptimizationConfiguration;
  onChange?: (date: string, config?: OptimizationConfiguration) => void;
}

const labels: { [key: string]: string } = {
  ROAD_DISTANCE: "Road Distance",
  AIR_DISTANCE: "Air Distance",
};

const TaskConfiguration: React.FC<TaskConfigurationProps> = ({
  date,
  config,
  onChange,
}) => {
  const [newVirtualFleetVisible, setNewVirtualFleetVisible] =
    useState<boolean>(false);
  const [value, setValue] = useState(date || "");
  const [optimizationConfig, setOptimizationConfig] =
    useState<Optional<OptimizationConfiguration>>(config);

  useEffect(() => {
    if (onChange) {
      onChange(value, optimizationConfig);
    }
  }, [onChange, value, optimizationConfig]);

  const cancelVirtualFleetItem = (groupId: string) => {
    const newVirtualFleet = optimizationConfig?.virtualFleet?.filter(
      (q) => q.groupId !== groupId,
    );

    setOptimizationConfig((old) => ({
      ...(old || {}),
      virtualFleet:
        newVirtualFleet && newVirtualFleet?.length > 0
          ? newVirtualFleet
          : undefined,
    }));
  };

  return (
    <Container header={<Header variant="h3">Configure Task</Header>}>
      <SpaceBetween size="l">
        <Box variant="h4">Basic options</Box>

        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          <FormField
            label="Optimization Date"
            description="Define when the optimization task is planned to start"
          >
            <DatePicker
              onChange={({ detail }) => setValue(detail.value)}
              value={value}
              openCalendarAriaLabel={(selectedDate) =>
                "Choose certificate expiry date" +
                (selectedDate ? `, selected date is ${selectedDate}` : "")
              }
              placeholder="YYYY/MM/DD"
            />
          </FormField>

          <FormField
            label="Distance Matrix Type"
            description="Select the distance matrix to use. Select Air Distance only for testing"
          >
            <Select
              selectedOption={{
                value:
                  config?.distanceMatrixType ||
                  DEFAULT_CONFIG.distanceMatrixType,
                label:
                  labels[
                    config?.distanceMatrixType ||
                      DEFAULT_CONFIG.distanceMatrixType!
                  ],
              }}
              options={[
                {
                  value: "AIR_DISTANCE",
                  label: "Air Distance",
                },
                {
                  value: "ROAD_DISTANCE",
                  label: "Road Distance",
                },
              ]}
              onChange={({ detail }) =>
                setOptimizationConfig((old) => ({
                  ...old,
                  distanceMatrixType: detail.selectedOption
                    .value! as DistanceMatrixType,
                }))
              }
            ></Select>
          </FormField>
          <FormField
            label="Explain"
            description="Define whether you'd like to get optimization explainability"
          >
            <Toggle
              checked={
                config?.explain !== undefined
                  ? config?.explain
                  : DEFAULT_CONFIG.explain!
              }
              onChange={({ detail }) =>
                setOptimizationConfig((old) => ({
                  ...old,
                  explain: detail.checked,
                }))
              }
            />
          </FormField>
        </Grid>
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          <FormField
            label="Max Solver Duration"
            description="Specified in seconds, define the maximum time the solver runs"
          >
            <Input
              value={
                config?.maxSolverDuration?.toString() ||
                DEFAULT_CONFIG.maxSolverDuration?.toString()!
              }
              type="number"
              onChange={({ detail }) =>
                setOptimizationConfig((old) => ({
                  ...old,
                  maxSolverDuration: Number(detail.value),
                }))
              }
            />
          </FormField>

          <FormField
            label="Max Unimproved Solver Duration"
            description="Specified in seconds, define the unimproved duration"
          >
            <Input
              value={
                config?.maxUnimprovedSolverDuration?.toString() ||
                DEFAULT_CONFIG.maxUnimprovedSolverDuration?.toString()!
              }
              type="number"
              onChange={({ detail }) =>
                setOptimizationConfig((old) => ({
                  ...old,
                  maxUnimprovedSolverDuration: Number(detail.value),
                }))
              }
            />
          </FormField>
        </Grid>
        <Box variant="h4">Vehicle options</Box>
        <Alert type="info">
          The options defined in the next section would be used as default for
          all vehicles in the optimization task. Only vehicles that have defined
          custom values for these option would follow their configured
          behaviour, all other vehicles that use empty configuration options
          would be using the global one defined in this section.
        </Alert>
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          <FormField
            label="Maximum distance"
            description="In meters, specify the maximum distance the vehicle can run"
          >
            <Input
              value={
                config?.maxDistance?.toString() ||
                DEFAULT_CONFIG.maxDistance?.toString()!
              }
              type="number"
              onChange={({ detail }) =>
                setOptimizationConfig((old) => ({
                  ...old,
                  maxDistance: detail.value ? Number(detail.value) : undefined,
                }))
              }
            />
          </FormField>

          <FormField
            label="Maximum time"
            description="In seconds, specify how much time a vehicle can spend on the road"
          >
            <Input
              value={
                config?.maxTime?.toString() ||
                DEFAULT_CONFIG.maxTime?.toString()!
              }
              type="number"
              onChange={({ detail }) =>
                setOptimizationConfig((old) => ({
                  ...old,
                  maxTime: detail.value ? Number(detail.value) : undefined,
                }))
              }
            />
          </FormField>

          <FormField
            label="Maximum orders"
            description="Max amout of orders that aa vehicle can handle in one assignment"
          >
            <Input
              value={
                config?.maxOrders?.toString() ||
                DEFAULT_CONFIG.maxOrders?.toString()!
              }
              type="number"
              onChange={({ detail }) =>
                setOptimizationConfig((old) => ({
                  ...old,
                  maxOrders: detail.value ? Number(detail.value) : undefined,
                }))
              }
            />
          </FormField>
        </Grid>
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          <FormField
            label="Vehicle Departure Time"
            description="Time of the day when the vehicle plans to leave the depot"
          >
            <TimeInput
              value={
                config?.vehicleDepartureTime?.toString() ||
                DEFAULT_CONFIG.vehicleDepartureTime?.toString()!
              }
              format="hh:mm"
              placeholder="hh:mm"
              onChange={({ detail }) =>
                setOptimizationConfig((old) => ({
                  ...old,
                  vehicleDepartureTime: detail.value,
                }))
              }
            />
          </FormField>

          <FormField
            label="Back to origin"
            description="Define whether the vehicle has to return to the depot"
          >
            <Toggle
              checked={
                config?.backToOrigin !== undefined
                  ? config?.backToOrigin
                  : DEFAULT_CONFIG.backToOrigin!
              }
              onChange={({ detail }) =>
                setOptimizationConfig((old) => ({
                  ...old,
                  backToOrigin: detail.checked,
                }))
              }
            />
          </FormField>
          <FormField
            label="Avoid tolls"
            description="Define whether tolls should be avoided"
          >
            <Toggle
              checked={
                config?.avoidTolls !== undefined
                  ? config?.avoidTolls
                  : DEFAULT_CONFIG.avoidTolls!
              }
              onChange={({ detail }) =>
                setOptimizationConfig((old) => ({
                  ...old,
                  avoidTolls: detail.checked,
                }))
              }
            />
          </FormField>
        </Grid>
        <Box variant="h4">Virtual Vehicles</Box>
        <Alert type="info">
          Should you feel you don't have enough physical vehicles to execute
          your orders, you can use a virtual fleet which gives you the option to
          flexibility add capacity. Virtual vehicles would be used only if
          required.
        </Alert>
        <VirtualFleetReview
          virtualFleet={config?.virtualFleet}
          allowCreation
          allowCancellation
          onCreateNew={() => setNewVirtualFleetVisible(true)}
          onCancel={cancelVirtualFleetItem}
        />
        <NewVirtualFleetModal
          visible={newVirtualFleetVisible}
          onClose={() => setNewVirtualFleetVisible(false)}
          onCreate={(item) => {
            const currentVirtualFleet = optimizationConfig?.virtualFleet || [];
            // if the item already exists in the current fleet then it should replace it, otherwise should add it
            const index = currentVirtualFleet.findIndex(
              (q) => q.groupId === item.groupId,
            );
            if (index >= 0) {
              currentVirtualFleet[index] = item;
            } else {
              currentVirtualFleet.push(item);
            }

            setOptimizationConfig((old) => ({
              ...old,
              virtualFleet: currentVirtualFleet,
            }));
            setNewVirtualFleetVisible(false);
          }}
        />
        <Box variant="h4">Weights</Box>
        <Alert type="info">
          Define the weights to use for the specific constraint used by the
          solver. <strong>You can disable constraints</strong> by putting the
          respective weight to 0
        </Alert>
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          <FormField
            label="Early Arrival"
            description="Define the early arrival constraint weight"
          >
            <ConstraintEditor
              constraint={config?.constraints?.earlyArrival}
              defaultConstraint={DEFAULT_CONFIG?.constraints?.earlyArrival!}
              onChange={useCallback(
                (constraint) =>
                  setOptimizationConfig((old) => ({
                    ...old,
                    constraints: {
                      ...(old?.constraints || {}),
                      earlyArrival: constraint,
                    },
                  })),
                [],
              )}
            />
          </FormField>
          <FormField
            label="Late Arrival"
            description="Define the late arrival constraint weight"
          >
            <ConstraintEditor
              constraint={config?.constraints?.lateArrival}
              defaultConstraint={DEFAULT_CONFIG?.constraints?.lateArrival!}
              onChange={useCallback(
                (constraint) =>
                  setOptimizationConfig((old) => ({
                    ...old,
                    constraints: {
                      ...(old?.constraints || {}),
                      lateArrival: constraint,
                    },
                  })),
                [],
              )}
            />
          </FormField>
          <FormField
            label="Late Departure"
            description="Define the late departure constraint weight"
          >
            <ConstraintEditor
              constraint={config?.constraints?.lateDeparture}
              defaultConstraint={DEFAULT_CONFIG?.constraints?.lateDeparture!}
              onChange={useCallback(
                (constraint) =>
                  setOptimizationConfig((old) => ({
                    ...old,
                    constraints: {
                      ...(old?.constraints || {}),
                      lateDeparture: constraint,
                    },
                  })),
                [],
              )}
            />
          </FormField>
        </Grid>
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          <FormField
            label="Virtual Vehicle"
            description="Define the virtual vehicle usage constraint weight"
          >
            <ConstraintEditor
              constraint={config?.constraints?.virtualVehicle}
              defaultConstraint={DEFAULT_CONFIG?.constraints?.virtualVehicle!}
              onChange={useCallback(
                (constraint) =>
                  setOptimizationConfig((old) => ({
                    ...old,
                    constraints: {
                      ...(old?.constraints || {}),
                      virtualVehicle: constraint,
                    },
                  })),
                [],
              )}
            />
          </FormField>
          <FormField
            label="Vehicle Volume"
            description="Define the vehicle volume constraint weight"
          >
            <ConstraintEditor
              constraint={config?.constraints?.vehicleVolume}
              defaultConstraint={DEFAULT_CONFIG?.constraints?.vehicleVolume!}
              onChange={useCallback(
                (constraint) =>
                  setOptimizationConfig((old) => ({
                    ...old,
                    constraints: {
                      ...(old?.constraints || {}),
                      vehicleVolume: constraint,
                    },
                  })),
                [],
              )}
            />
          </FormField>
          <FormField
            label="Vehicle Weight"
            description="Define the vehicle weight constraint weight"
          >
            <ConstraintEditor
              constraint={config?.constraints?.vehicleWeight}
              defaultConstraint={DEFAULT_CONFIG?.constraints?.vehicleWeight!}
              onChange={useCallback(
                (constraint) =>
                  setOptimizationConfig((old) => ({
                    ...old,
                    constraints: {
                      ...(old?.constraints || {}),
                      vehicleWeight: constraint,
                    },
                  })),
                [],
              )}
            />
          </FormField>
        </Grid>
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          <FormField
            label="Max Distance"
            description="Define the maximum distance constraint weight"
          >
            <ConstraintEditor
              constraint={config?.constraints?.maxDistance}
              defaultConstraint={DEFAULT_CONFIG?.constraints?.maxDistance!}
              onChange={useCallback(
                (constraint) =>
                  setOptimizationConfig((old) => ({
                    ...old,
                    constraints: {
                      ...(old?.constraints || {}),
                      maxDistance: constraint,
                    },
                  })),
                [],
              )}
            />
          </FormField>
          <FormField
            label="Max Time"
            description="Define the maximum time constraint weight"
          >
            <ConstraintEditor
              constraint={config?.constraints?.maxTime}
              defaultConstraint={DEFAULT_CONFIG?.constraints?.maxTime!}
              onChange={useCallback(
                (constraint) =>
                  setOptimizationConfig((old) => ({
                    ...old,
                    constraints: {
                      ...(old?.constraints || {}),
                      maxTime: constraint,
                    },
                  })),
                [],
              )}
            />
          </FormField>
          <FormField
            label="Travel Distance"
            description="Define the travel distance constraint weight"
          >
            <ConstraintEditor
              constraint={config?.constraints?.travelDistance}
              defaultConstraint={DEFAULT_CONFIG?.constraints?.travelDistance!}
              onChange={useCallback(
                (constraint) =>
                  setOptimizationConfig((old) => ({
                    ...old,
                    constraints: {
                      ...(old?.constraints || {}),
                      travelDistance: constraint,
                    },
                  })),
                [],
              )}
            />
          </FormField>
        </Grid>

        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          <FormField
            label="Travel Time"
            description="Define the travel time constraint weight"
          >
            <ConstraintEditor
              constraint={config?.constraints?.travelTime}
              defaultConstraint={DEFAULT_CONFIG?.constraints?.travelTime!}
              onChange={useCallback(
                (constraint) =>
                  setOptimizationConfig((old) => ({
                    ...old,
                    constraints: {
                      ...(old?.constraints || {}),
                      travelTime: constraint,
                    },
                  })),
                [],
              )}
            />
          </FormField>
          <FormField
            label="Order Count"
            description="Define the order count constraint weight"
          >
            <ConstraintEditor
              constraint={config?.constraints?.orderCount}
              defaultConstraint={DEFAULT_CONFIG?.constraints?.orderCount!}
              onChange={useCallback(
                (constraint) =>
                  setOptimizationConfig((old) => ({
                    ...old,
                    constraints: {
                      ...(old?.constraints || {}),
                      orderCount: constraint,
                    },
                  })),
                [],
              )}
            />
          </FormField>
          <FormField
            label="Order Requirements"
            description="Define the order requirements constraint weight"
          >
            <ConstraintEditor
              constraint={config?.constraints?.orderRequirements}
              defaultConstraint={
                DEFAULT_CONFIG?.constraints?.orderRequirements!
              }
              onChange={useCallback(
                (constraint) =>
                  setOptimizationConfig((old) => ({
                    ...old,
                    constraints: {
                      ...(old?.constraints || {}),
                      orderRequirements: constraint,
                    },
                  })),
                [],
              )}
            />
          </FormField>
        </Grid>
      </SpaceBetween>
    </Container>
  );
};

export default TaskConfiguration;
