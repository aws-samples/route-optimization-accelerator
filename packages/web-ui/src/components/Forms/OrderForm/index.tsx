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
  Textarea,
} from "@cloudscape-design/components";
import { Order } from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import React, { useCallback, useEffect, useState } from "react";
import { PlaceFinder } from "../../PlaceFinder";
import DateRange from "../../DateRange";
import { TokenEditor } from "../../TokenEditor";
import "./custom.css";

export interface OrderFormProps {
  order?: Order;
  editMode?: boolean;
  onSave: (data: Order) => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ order, onSave }) => {
  const [state, setState] = useState<Order>({} as Order);

  useEffect(() => {
    setState(order || ({ isActive: "Y" } as Order));
  }, [order]);

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
            label="Number"
            description="The order number (e.g. ABC012345)"
          >
            <Input
              value={state!.number}
              onChange={({ detail }) =>
                setState((old) => ({ ...old, number: detail.value }))
              }
              placeholder="Number"
            />
          </FormField>

          <FormField
            label="Origin"
            description="Define where the order originate from (e.g. depot)"
          >
            <PlaceFinder
              selectedItemValue={state?.origin?.id}
              onSelect={(selection) =>
                setState((old) => ({
                  ...old,
                  origin: selection
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

          <FormField
            label="Destination"
            description="Define where the order has to be delivered to (e.g. destination)"
          >
            <PlaceFinder
              selectedItemValue={state?.destination?.id}
              onSelect={(selection) =>
                setState((old) => ({
                  ...old,
                  destination: selection
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
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 8 }]}>
          <FormField
            label="Service time"
            description="The duration, in seconds, needed to serve this order at destination"
          >
            <Input
              value={state!.serviceTime?.toString() || ""}
              type="number"
              onChange={({ detail }) =>
                setState((old) => ({
                  ...old,
                  serviceTime: detail.value ? Number(detail.value) : undefined,
                }))
              }
              placeholder="e.g. 300"
            />
          </FormField>
          <FormField
            label="Service window"
            description="The delivery time window"
            stretch
          >
            <DateRange
              placeholder="Select the from and to for the delivery window"
              className="long-txt"
              onChange={useCallback(
                (from: Date, to: Date) =>
                  setState((old) => ({
                    ...old,
                    serviceWindow: {
                      from: from.toISOString(),
                      to: to.toISOString(),
                    },
                  })),
                [],
              )}
              absoluteOnly
            />
          </FormField>
        </Grid>

        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          <FormField
            label="Requirements"
            description="Add order requirements (e.g. chill, frozen)"
          >
            <TokenEditor
              attributes={state.requirements}
              onChange={(attr?: string[]) =>
                setState((old) => ({ ...old, requirements: attr }))
              }
              tokenGroupLimit={4}
            />
          </FormField>

          <FormField label="Weight" description="Add the order weight">
            <Input
              value={state!.attributes?.weight?.toString() || ""}
              type="number"
              onChange={({ detail }) =>
                setState((old) => ({
                  ...old,
                  attributes: {
                    ...(old.attributes || {}),
                    weight: detail.value ? Number(detail.value) : undefined,
                  },
                }))
              }
              placeholder="e.g. 10.2"
            />
          </FormField>

          <FormField label="Volume" description="Add the order volume">
            <Input
              value={state!.attributes?.volume?.toString() || ""}
              type="number"
              onChange={({ detail }) =>
                setState((old) => ({
                  ...old,
                  attributes: {
                    ...(old.attributes || {}),
                    volume: detail.value ? Number(detail.value) : undefined,
                  },
                }))
              }
              placeholder="e.g. 0.56"
            />
          </FormField>
        </Grid>
        <Grid gridDefinition={[{ colspan: 12 }]}>
          <FormField
            label="Description"
            description="Add a description for this order"
            stretch
          >
            <Textarea
              className="long-txt"
              onChange={({ detail }) =>
                setState((old) => ({
                  ...old,
                  description: detail.value,
                }))
              }
              value={state.description || ""}
              placeholder="Order containing..."
            />
          </FormField>
        </Grid>
      </SpaceBetween>
    </Form>
  );
};

export default OrderForm;
