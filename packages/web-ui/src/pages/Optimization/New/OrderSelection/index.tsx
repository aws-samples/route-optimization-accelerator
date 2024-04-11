/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  Button,
  Container,
  FormField,
  Grid,
  Header,
  SegmentedControl,
  Select,
  SpaceBetween,
} from "@cloudscape-design/components";
import React, { useCallback, useEffect, useState } from "react";
import { Optional } from "../../../../utils/common";
import {
  OptimizationOrderDetail,
  Order,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import AlertWrapper from "../../../../components/AlertWrapper";
import { MODE_CONFIGURATION } from "..";
import CodeEditorWrapper from "../../../../components/CodeEditorWrapper";
import { OrderFinder } from "../../../../components/OrderFinder";
import OrdersReview from "../OrdersReview";
import { EXAMPLES } from "../request-examples";

export interface OrderSelectionProps {
  orders?: OptimizationOrderDetail[];
  onChange?: (orders: OptimizationOrderDetail[]) => void;
}

const OrderSelection: React.FC<OrderSelectionProps> = ({
  orders,
  onChange,
}) => {
  const [selectedOption, setSelectedOption] = useState<any>();
  const [selectedView, setSelectedView] = useState(MODE_CONFIGURATION.assisted);
  const [currentOrder, setCurrentOrder] = useState<Optional<Order>>();
  const [optimizationOrders, setOptimizationOrders] =
    useState<Optional<OptimizationOrderDetail[]>>(orders);

  const mapOrderToOptimizationOrder = (
    order: Order,
  ): OptimizationOrderDetail => ({
    id: order.id,
    origin: order.origin,
    destination: order.destination,
    attributes: order.attributes,
    requirements: order.requirements,
    serviceTime: order.serviceTime,
    serviceWindow: order.serviceWindow,
  });

  const addTooptimizationOrder = () => {
    if (currentOrder) {
      if (optimizationOrders?.find((q) => currentOrder.id === q.id)) {
        return;
      }

      const mappedOrder = mapOrderToOptimizationOrder(currentOrder);
      setOptimizationOrders((old) =>
        old ? [...old, mappedOrder] : [mappedOrder],
      );
    }
  };

  const removeoptimizationOrder = (id: string) => {
    if (optimizationOrders) {
      const oOrder = [...optimizationOrders];
      oOrder.splice(
        optimizationOrders.findIndex((q) => q.id === id),
        1,
      );

      setOptimizationOrders(oOrder);
    }
  };

  useEffect(() => {
    if (onChange) {
      onChange(optimizationOrders ?? []);
    }
  }, [onChange, optimizationOrders]);

  const importOrdersFromCode = useCallback((code: string) => {
    try {
      const parsedOrders = JSON.parse(code);
      setOptimizationOrders(parsedOrders);
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (selectedOption && selectedOption.value) {
      const orders = EXAMPLES[selectedOption.value].value.orders;

      setOptimizationOrders(orders!);
    }
  }, [selectedOption]);

  return (
    <Container header={<Header variant="h3">Add Orders</Header>}>
      <SpaceBetween size="l">
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 3 }]}>
          <OrderFinder onSelect={setCurrentOrder} />
          <Button onClick={addTooptimizationOrder}>Add</Button>
        </Grid>
        <Header
          actions={
            <SegmentedControl
              selectedId={selectedView}
              onChange={({ detail }) => setSelectedView(detail.selectedId)}
              label="Select the mode"
              options={MODE_CONFIGURATION.options}
            />
          }
        >
          Selected Orders
        </Header>
        {(!optimizationOrders || optimizationOrders.length === 0) && (
          <AlertWrapper
            alert={{
              type: "info",
              message:
                "Select an order from the dropdown to add it to the list",
            }}
          />
        )}
        {selectedView === MODE_CONFIGURATION.assisted && (
          <OrdersReview
            optimizationOrders={optimizationOrders}
            allowCancellation
            onCancel={(idx) => removeoptimizationOrder(idx)}
          />
        )}
        {selectedView === MODE_CONFIGURATION.code && (
          <SpaceBetween size="m">
            <FormField
              label="Select a sample payload to replace the existing one"
              stretch
              constraintText="Please ensure to use the same sample as the previous step for the best results"
            >
              <Select
                selectedOption={selectedOption}
                onChange={({ detail }) =>
                  setSelectedOption(detail.selectedOption)
                }
                options={Object.keys(EXAMPLES).map((v) => ({
                  label: EXAMPLES[v].description,
                  value: v,
                }))}
                filteringType="auto"
              />
            </FormField>
            <CodeEditorWrapper
              code={JSON.stringify(optimizationOrders, null, 2)}
              onCodeChange={importOrdersFromCode}
            />
          </SpaceBetween>
        )}
      </SpaceBetween>
    </Container>
  );
};

export default OrderSelection;
