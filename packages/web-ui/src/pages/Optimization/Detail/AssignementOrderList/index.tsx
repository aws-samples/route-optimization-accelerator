/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  OptimizationAssignmentOrderResult,
  OptimizationOrderDetail,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import React, { useEffect, useState } from "react";
import { Box, SpaceBetween, Tiles } from "@cloudscape-design/components";
import { ValueWithLabel } from "../../../../components/ValueWithLabel";
import {
  DateFormats,
  DateTimeLabel,
  DateTimeLabelMode,
} from "../../../../components/DateTimeLabel";

export interface OptimizationOrderDetailProps {
  optimizationOrders?: OptimizationOrderDetail[];
  assignedOrders?: OptimizationAssignmentOrderResult[];
  routeBack: boolean;
  selectedOrderIndex: number;
  onSelectionChange?: (index: number, orderSize: number) => void;
  onOrderResultChange?: (selectionCount: number) => void;
  onOrderSelectionChange?: (orderId: string) => void;
}

export interface AssignementOrderListProps
  extends OptimizationOrderDetail,
    OptimizationAssignmentOrderResult {}

const AssignementOrderList: React.FC<OptimizationOrderDetailProps> = ({
  optimizationOrders,
  assignedOrders,
  selectedOrderIndex,
  routeBack,
  onSelectionChange,
  onOrderResultChange,
  onOrderSelectionChange,
}) => {
  const [orderList, setOrderList] = useState<AssignementOrderListProps[]>([]);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [routeBackId, setRouteBackId] = useState<number>(0);

  useEffect(() => {
    if (routeBack && orderList.length > 0) {
      setRouteBackId(orderList.length);
    }
  }, [routeBack, orderList]);

  useEffect(() => {
    if (optimizationOrders && assignedOrders) {
      setOrderList(
        assignedOrders.map((q) => {
          const order = optimizationOrders.find((o) => o.id === q.id);

          return { ...order!, arrivalTime: q.arrivalTime };
        }),
      );
    }
  }, [optimizationOrders, assignedOrders]);

  useEffect(() => {
    if (selectedOrderIndex === -1) {
      setSelectedOrder("");
    }
    const selectionCount = orderList.length + (routeBack ? 1 : 0);
    if (
      selectedOrderIndex !== undefined &&
      selectedOrderIndex < selectionCount
    ) {
      setSelectedOrder(selectedOrderIndex.toString());
    }
  }, [orderList, routeBack, selectedOrderIndex]);

  useEffect(() => {
    if (!onOrderSelectionChange) return;

    if (
      !!selectedOrder &&
      selectedOrder !== "-1" &&
      selectedOrder !== routeBackId.toString()
    ) {
      onOrderSelectionChange(orderList[Number(selectedOrder)].id);
    } else {
      onOrderSelectionChange("");
    }
  }, [selectedOrder, routeBackId, orderList, onOrderSelectionChange]);

  useEffect(() => {
    if (orderList && onOrderResultChange) {
      onOrderResultChange(orderList.length + (routeBack ? 1 : 0));
    }
  }, [orderList, routeBack, onOrderResultChange]);

  const onTileSelect = (selectedId: string) => {
    setSelectedOrder(selectedId);

    if (onSelectionChange) {
      onSelectionChange(Number(selectedId), orderList.length);
    }
  };

  return (
    <Tiles
      onChange={({ detail }) => onTileSelect(detail.value)}
      value={selectedOrder}
      columns={1}
      items={(orderList || [])
        .map((q, idx) => ({
          value: idx.toString(),
          label: <Box variant="span">{q.id}</Box>,
          description: (
            <Box>
              <SpaceBetween direction="vertical" size="l">
                <p hidden>spacing</p>
                <Box display="block">
                  <Box float="left">
                    <ValueWithLabel label="Origin">
                      {q.origin.id}
                    </ValueWithLabel>
                  </Box>
                  <Box float="left" margin={{ left: "xxxl" }}>
                    <ValueWithLabel label="Destination">
                      {q.destination.id}
                    </ValueWithLabel>
                  </Box>
                </Box>

                <Box display="block">
                  <Box float="left">
                    <ValueWithLabel label="Arrival Time">
                      <DateTimeLabel
                        timestamp={new Date(q.arrivalTime).getTime()}
                        mode={DateTimeLabelMode.Custom}
                        customFormat={DateFormats.default}
                      />
                    </ValueWithLabel>
                  </Box>
                </Box>
              </SpaceBetween>
            </Box>
          ),
        }))
        .concat(
          routeBack
            ? [
                {
                  description: <></>,
                  label: (
                    <Box variant="span">
                      <em>Route back to Origin</em>
                    </Box>
                  ),
                  value: routeBackId.toString(),
                },
              ]
            : [],
        )}
    />
  );
};

export default AssignementOrderList;
