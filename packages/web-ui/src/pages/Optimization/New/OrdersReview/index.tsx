/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { Button, Table } from "@cloudscape-design/components";
import React from "react";
import { Optional } from "../../../../utils/common";
import { OptimizationOrderDetail } from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import MapPopover from "../../../../components/MapPopover";
import { Duration } from "../../../../components/Duration";
import OrderAttributesPopover from "../../../../components/OrderAttributesPopover";
import {
  DateFormats,
  DateTimeLabel,
  DateTimeLabelMode,
} from "../../../../components/DateTimeLabel";
import { Tags } from "../../../../components/Tags";

export interface OrdersReviewProps {
  optimizationOrders: Optional<OptimizationOrderDetail[]>;
  allowCancellation?: boolean;
  onCancel?: (id: string) => void;
}

const OrdersReview: React.FC<OrdersReviewProps> = ({
  optimizationOrders,
  allowCancellation,
  onCancel,
}) => {
  return (
    <>
      {optimizationOrders && optimizationOrders.length > 0 && (
        <Table
          columnDefinitions={[
            {
              id: "id",
              header: "Id",
              cell: (item) => item.id,
            },
            {
              id: "origin",
              header: "Origin",
              cell: (item) => (
                <MapPopover
                  lat={item.origin.latitude}
                  lon={item.origin.longitude}
                  markers={[
                    [
                      item.origin.longitude,
                      item.origin.latitude,
                      { color: "red", popupContent: <>Origin Location</> },
                    ],
                  ]}
                >
                  Origin
                </MapPopover>
              ),
            },
            {
              id: "destination",
              header: "Destination",
              cell: (item) => (
                <MapPopover
                  lat={item.destination.latitude}
                  lon={item.destination.longitude}
                  markers={[
                    [
                      item.destination.longitude,
                      item.destination.latitude,
                      { color: "red", popupContent: <>Destination Location</> },
                    ],
                  ]}
                >
                  Destination
                </MapPopover>
              ),
            },
            {
              id: "serviceTime",
              header: "Service Time",
              cell: (item) => (
                <Duration value={item.serviceTime} unit="seconds" />
              ),
            },
            {
              id: "serviceFrom",
              header: "Service From",
              cell: (e) =>
                e.serviceWindow ? (
                  <DateTimeLabel
                    timestamp={new Date(e.serviceWindow.from).getTime()}
                    mode={DateTimeLabelMode.Custom}
                    customFormat={DateFormats.default}
                  />
                ) : (
                  "-"
                ),
            },
            {
              id: "serviceTo",
              header: "Service To",
              cell: (e) =>
                e.serviceWindow ? (
                  <DateTimeLabel
                    timestamp={new Date(e.serviceWindow.to).getTime()}
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
              cell: (item) => (
                <OrderAttributesPopover attributes={item.attributes} />
              ),
            },
            {
              id: "requirements",
              header: "Requirements",
              cell: (item) => <Tags tags={item.requirements} />,
            },
            {
              id: "actions",
              header: "Actions",
              cell: (item) => (
                <Button
                  onClick={() => onCancel && onCancel(item.id)}
                  variant="icon"
                  iconName="remove"
                  iconAlt="Remove item"
                />
              ),
            },
          ]}
          columnDisplay={[
            { id: "id", visible: true },
            { id: "origin", visible: true },
            { id: "destination", visible: true },
            { id: "serviceTime", visible: true },
            { id: "serviceFrom", visible: true },
            { id: "serviceTo", visible: true },
            { id: "attributes", visible: true },
            { id: "requirements", visible: true },
            { id: "actions", visible: allowCancellation === true },
          ]}
          items={optimizationOrders || []}
        />
      )}
    </>
  );
};

export default OrdersReview;
