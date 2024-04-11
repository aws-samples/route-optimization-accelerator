/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  Button,
  SpaceBetween,
  Form,
  Grid,
  FormField,
  Input,
  TimeInput,
  Toggle,
  Header,
  Box,
} from "@cloudscape-design/components";
import { Fleet } from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import React, { useEffect, useState } from "react";
import { DEFAULT_CONFIG } from "../../OptimizationConfiguration";
import { TokenEditor } from "../../TokenEditor";
import { PlaceFinder } from "../../PlaceFinder";

export interface FleetFormProps {
  fleet?: Fleet;
  editMode?: boolean;
  onSave: (data: Fleet) => void;
}

export const FleetForm: React.FC<FleetFormProps> = ({ fleet, onSave }) => {
  const [state, setState] = useState<Fleet>({} as Fleet);

  useEffect(() => {
    setState(fleet || ({ isActive: "Y" } as Fleet));
  }, [fleet]);

  const saveAction = () => {
    onSave(state!);
  };

  return (
    <Form
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button variant="primary" onClick={saveAction}>
            Save
          </Button>
        </SpaceBetween>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          <FormField
            label="Name"
            description="The name of the fleet member (e.g. Vehicle 123 or Operator name)"
          >
            <Input
              value={state!.name}
              onChange={({ detail }) =>
                setState((old) => ({ ...old, name: detail.value }))
              }
              placeholder="Name"
            />
          </FormField>

          <FormField
            label="Departure Time"
            description="Define the preferred departure time for this vehicle"
          >
            <TimeInput
              value={state!.preferredDepartureTime || ""}
              format="hh:mm"
              onChange={({ detail }) =>
                setState((old) => ({
                  ...old,
                  preferredDepartureTime: detail.value,
                }))
              }
              placeholder="departure time (hh:mm)"
            />
          </FormField>

          <FormField
            label="Back to origin"
            description="Define if the fleet member should route back to the origin point"
          >
            <Toggle
              checked={
                state!.backToOrigin !== undefined
                  ? state!.backToOrigin
                  : DEFAULT_CONFIG.backToOrigin!
              }
              onChange={({ detail }) =>
                setState((old) => ({ ...old, backToOrigin: detail.checked }))
              }
            />
          </FormField>
        </Grid>

        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          <FormField
            label="Attributes"
            description="Add attributes (e.g. cold, frozen, ambient)"
          >
            <TokenEditor
              attributes={state.attributes}
              onChange={(attr?: string[]) =>
                setState((old) => ({ ...old, attributes: attr }))
              }
              tokenGroupLimit={4}
            />
          </FormField>

          <FormField
            label="Location"
            description="Define the starting location of the fleet member"
          >
            <PlaceFinder
              selectedItemValue={state.startingLocation?.id}
              onSelect={(selection) =>
                setState((old) => ({
                  ...old,
                  startingLocation: selection
                    ? {
                        id: selection?.id,
                        latitude: selection.position.latitude,
                        longitude: selection.position.longitude,
                      }
                    : undefined!,
                }))
              }
            />
          </FormField>
        </Grid>

        <SpaceBetween size="xs">
          <Header variant="h3">Limits</Header>
          <Box variant="p">
            The limits specified below will override any configured limit passed
            in the optimization task
          </Box>
        </SpaceBetween>

        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          <FormField
            label="Max Orders"
            description="The maximum amount of orders this fleet member can handle"
          >
            <Input
              value={state!.limits?.maxOrders?.toString() || ""}
              type="number"
              onChange={({ detail }) =>
                setState((old) => ({
                  ...old,
                  limits: {
                    ...(old.limits || {}),
                    maxOrders: detail.value ? Number(detail.value) : undefined,
                  },
                }))
              }
              placeholder="e.g. 10"
            />
          </FormField>

          <FormField
            label="Max Capacity"
            description="The maximum capacity (e.g. KGs) of the vehicle"
          >
            <Input
              value={state!.limits?.maxCapacity?.toString() || ""}
              type="number"
              onChange={({ detail }) =>
                setState((old) => ({
                  ...old,
                  limits: {
                    ...(old.limits || {}),
                    maxCapacity: detail.value
                      ? Number(detail.value)
                      : undefined,
                  },
                }))
              }
              placeholder="e.g. 20000"
            />
          </FormField>

          <FormField
            label="Max Volume"
            description="The maximum volume (e.g. m3) of the vehicle"
          >
            <Input
              value={state!.limits?.maxVolume?.toString() || ""}
              type="number"
              onChange={({ detail }) =>
                setState((old) => ({
                  ...old,
                  limits: {
                    ...(old.limits || {}),
                    maxVolume: detail.value ? Number(detail.value) : undefined,
                  },
                }))
              }
              placeholder="e.g. 15"
            />
          </FormField>
        </Grid>

        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          <FormField
            label="Max Distance"
            description="The maximum distance (meters) that the fleet member can run"
          >
            <Input
              value={state!.limits?.maxDistance?.toString() || ""}
              type="number"
              onChange={({ detail }) =>
                setState((old) => ({
                  ...old,
                  limits: {
                    ...(old.limits || {}),
                    maxDistance: detail.value
                      ? Number(detail.value)
                      : undefined,
                  },
                }))
              }
              placeholder="e.g. 15000"
            />
          </FormField>

          <FormField
            label="Max Time"
            description="The maximum time (seconds) that the fleet member can spend"
          >
            <Input
              value={state!.limits?.maxTime?.toString() || ""}
              type="number"
              onChange={({ detail }) =>
                setState((old) => ({
                  ...old,
                  limits: {
                    ...(old.limits || {}),
                    maxTime: detail.value ? Number(detail.value) : undefined,
                  },
                }))
              }
              placeholder="e.g. 3600"
            />
          </FormField>
        </Grid>
      </SpaceBetween>
    </Form>
  );
};

export default FleetForm;
