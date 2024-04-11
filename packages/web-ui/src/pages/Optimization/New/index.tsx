/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Container,
  Header,
  SpaceBetween,
  Wizard,
  WizardProps,
} from "@cloudscape-design/components";
import {
  Optimization,
  OptimizationConfiguration,
  OptimizationFleetDetail,
  OptimizationOrderDetail,
  useCreateRouteOptimization,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import FleetSelection from "./FleetSelection";
import OrderSelection from "./OrderSelection";
import FleetReview from "./FleetReview";
import OrdersReview from "./OrdersReview";
import TaskConfiguration from "./Configuration";
import OptimizationConfigurationComponent from "../../../components/OptimizationConfiguration";
import { ValueWithLabel } from "../../../components/ValueWithLabel";
import dayjs from "../../../utils/dayjs";

export const MODE_CONFIGURATION = {
  assisted: "assisted",
  code: "code",
  options: [
    { id: "assisted", text: "Assisted Mode" },
    { id: "code", text: "Code Mode" },
  ],
};

const buildUpActualDate = (taskDate: string, datetimeOrTime?: string) => {
  if (!datetimeOrTime) {
    return undefined;
  }

  if (datetimeOrTime.includes("T")) {
    return datetimeOrTime;
  }

  return `${taskDate}T${datetimeOrTime}`;
};

const NewOptimization: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [fleetErrorText, setFleetErrorText] = useState("");
  const [orderErrorText, setOrderErrorText] = useState("");
  const [configurationErrorText, setConfigurationErrorText] = useState("");
  const [taskDate, setTaskDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [reviewAndLaunchErrorText, setReviewAndLaunchErrorText] = useState("");
  const [optimizationTask, setOptimizationTask] =
    useState<Partial<Optimization>>();
  const create = useCreateRouteOptimization();
  const navigate = useNavigate();

  const createNewOptimizationTask = async () => {
    try {
      setReviewAndLaunchErrorText("");
      setIsLoading(true);

      const data: Optimization = {
        problemId: uuidv4(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        fleet: optimizationTask!.fleet?.map((q) => ({
          ...q,
          preferredDepartureTime: buildUpActualDate(
            taskDate,
            q.preferredDepartureTime,
          ),
        }))!,
        orders: optimizationTask!.orders?.map((q) => ({
          ...q,
          serviceWindow: q.serviceWindow
            ? {
                from: buildUpActualDate(taskDate, q.serviceWindow.from)!,
                to: buildUpActualDate(taskDate, q.serviceWindow.to)!,
              }
            : undefined,
        }))!,
        config: optimizationTask?.config
          ? {
              ...optimizationTask.config,
              vehicleDepartureTime: buildUpActualDate(
                taskDate,
                optimizationTask.config.vehicleDepartureTime,
              ),
              virtualFleet: optimizationTask.config.virtualFleet
                ? optimizationTask.config.virtualFleet.map((q) => ({
                    ...q,
                    preferredDepartureTime: buildUpActualDate(
                      taskDate,
                      q.preferredDepartureTime,
                    ),
                  }))
                : undefined,
            }
          : undefined,
      };

      await create.mutateAsync({
        createRouteOptimizationRequestContent: {
          data,
        },
      });
    } catch (err) {
      setReviewAndLaunchErrorText(
        "Error creating optimization task. Please try again later.",
      );
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (create.isSuccess) {
      navigate("/optimization/" + create.data.data.problemId);
    }
  }, [navigate, create]);

  const onNavigate = (step: WizardProps.NavigateDetail) => {
    if (step.requestedStepIndex >= 1) {
      if (!optimizationTask?.fleet || !optimizationTask.fleet.length) {
        setFleetErrorText(
          "Select at least a fleet member to proceed to the next step",
        );
        return;
      }
      setFleetErrorText("");
    }
    if (step.requestedStepIndex >= 2) {
      if (!optimizationTask?.orders || !optimizationTask.orders.length) {
        setOrderErrorText(
          "Select at least one order to proceed to the next step",
        );
        return;
      }
      setOrderErrorText("");
    }

    if (step.requestedStepIndex >= 3) {
      if (!taskDate) {
        setConfigurationErrorText(
          "Select a task date to proceed to the next step",
        );
        return;
      }

      setConfigurationErrorText("");
    }

    setActiveStepIndex(step.requestedStepIndex);
  };

  return (
    <Wizard
      i18nStrings={{
        stepNumberLabel: (stepNumber) => `Step ${stepNumber}`,
        collapsedStepsLabel: (stepNumber, stepsCount) =>
          `Step ${stepNumber} of ${stepsCount}`,
        skipToButtonLabel: (step) => `Skip to ${step.title}`,
        navigationAriaLabel: "Steps",
        previousButton: "Previous",
        nextButton: "Next",
        submitButton: "Create Optimization Task",
        optional: "optional",
      }}
      onNavigate={({ detail }) => onNavigate(detail)}
      activeStepIndex={activeStepIndex}
      onSubmit={createNewOptimizationTask}
      isLoadingNextStep={isLoading}
      allowSkipTo
      steps={[
        {
          title: "Select Fleet",
          description:
            "Define the fleet member to be used for this optimization tasks. You can also define virtual vehicle in the configuration section",
          content: (
            <FleetSelection
              fleet={optimizationTask?.fleet}
              onChange={useCallback(
                (fleet: OptimizationFleetDetail[]) =>
                  setOptimizationTask((old) => ({ ...old, fleet })),
                [],
              )}
              onConfigChange={useCallback(
                (config?: OptimizationConfiguration) =>
                  setOptimizationTask((old) => ({ ...old, config })),
                [],
              )}
            />
          ),
          errorText: fleetErrorText,
        },
        {
          title: "Select Orders",
          description:
            "Define the orders to optimized using the fleet members defined earlier.",
          content: (
            <OrderSelection
              orders={optimizationTask?.orders}
              onChange={useCallback(
                (orders: OptimizationOrderDetail[]) =>
                  setOptimizationTask((old) => ({ ...old, orders })),
                [],
              )}
            />
          ),
          errorText: orderErrorText,
        },
        {
          title: "Configure",
          description:
            "Configure the behaviour of the solver by providing options",
          content: (
            <TaskConfiguration
              date={taskDate}
              config={optimizationTask?.config}
              onChange={useCallback(
                (date: string, config?: OptimizationConfiguration) => {
                  setTaskDate(date);
                  setOptimizationTask((old) => ({ ...old, config }));
                },
                [],
              )}
            />
          ),
          isOptional: true,
          errorText: configurationErrorText,
        },
        {
          title: "Review and Launch",
          description: "Review and launch the optimization task",
          errorText: reviewAndLaunchErrorText,
          content: (
            <SpaceBetween size="xs">
              <Header
                variant="h3"
                actions={
                  <Button onClick={() => setActiveStepIndex(0)}>Edit</Button>
                }
              >
                Step 1: Fleet ({optimizationTask?.fleet?.length})
              </Header>
              <FleetReview optimizationFleet={optimizationTask?.fleet} />
              <Header
                variant="h3"
                actions={
                  <Button onClick={() => setActiveStepIndex(1)}>Edit</Button>
                }
              >
                Step 2: Orders ({optimizationTask?.orders?.length})
              </Header>
              <OrdersReview optimizationOrders={optimizationTask?.orders} />

              <Header
                variant="h3"
                actions={
                  <Button onClick={() => setActiveStepIndex(2)}>Edit</Button>
                }
              >
                Step 3: Configure
              </Header>
              <Container>
                <SpaceBetween size="m">
                  <ValueWithLabel label="Task Start Date">
                    {taskDate}
                  </ValueWithLabel>
                  <hr />
                  <OptimizationConfigurationComponent
                    config={optimizationTask?.config}
                  />
                </SpaceBetween>
              </Container>
            </SpaceBetween>
          ),
        },
      ]}
    />
  );
};

export default NewOptimization;
