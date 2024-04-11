/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React, { useEffect, useState } from "react";
import { OptimizationOrderDetail } from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import { Table } from "@cloudscape-design/components";
import PaginationComponent from "../../../../components/PaginationDetails";
import { Optional, paginate } from "../../../../utils/common";
import dayjs from "../../../../utils/dayjs";
import { DurationFormats } from "../../../../components/Duration";
import MapPopover from "../../../../components/MapPopover";
import {
  DateFormats,
  DateTimeLabel,
  DateTimeLabelMode,
} from "../../../../components/DateTimeLabel";

export interface OptimizationOrderDetailsProps {
  orders?: OptimizationOrderDetail[];
}

const OptimizationOrderDetails: React.FC<OptimizationOrderDetailsProps> = ({
  orders,
}) => {
  const [orderList, setOrderList] =
    useState<Optional<OptimizationOrderDetail[]>>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(5);

  useEffect(() => {
    if (orders && orders.length > 0) {
      setOrderList(orders);
    }
  }, [orders]);

  return (
    <Table
      variant="embedded"
      stripedRows={true}
      loading={!orderList}
      columnDefinitions={[
        {
          id: "id",
          header: "Order Id",
          cell: (e) => e.id,
        },
        {
          id: "location",
          header: "Location",
          cell: (e) => (
            <MapPopover
              lat={e.origin.latitude}
              lon={e.origin.longitude}
              markers={[
                [
                  e.origin.longitude,
                  e.origin.latitude,
                  { color: "red", popupContent: <>Origin</> },
                ],
                [
                  e.destination.longitude,
                  e.destination.latitude,
                  { color: "green", popupContent: <>Destination</> },
                ],
              ]}
              bounds={[
                [e.origin.longitude, e.origin.latitude],
                [e.destination.longitude, e.destination.latitude],
              ]}
            >
              Location
            </MapPopover>
          ),
        },
        {
          id: "serviceTime",
          header: "Service time",
          cell: (e) =>
            e.serviceTime
              ? dayjs
                  .duration(e.serviceTime, "seconds")
                  .format(DurationFormats.default)
              : "-",
        },
        {
          id: "serviceWindow",
          header: "Service window",
          cell: (e) =>
            e.serviceWindow ? (
              <>
                <DateTimeLabel
                  allowDateFlipping={false}
                  timestamp={new Date(e.serviceWindow.from).getTime()}
                  mode={DateTimeLabelMode.Custom}
                  customFormat={DateFormats.default}
                />
                {"-"}
                <DateTimeLabel
                  allowDateFlipping={false}
                  timestamp={new Date(e.serviceWindow.to).getTime()}
                  mode={DateTimeLabelMode.Custom}
                  customFormat={DateFormats.default}
                />
              </>
            ) : (
              "-"
            ),
        },
        {
          id: "requirements",
          header: "Requirements",
          cell: (e) => e.requirements || "-",
        },
      ]}
      items={
        orderList
          ? paginate<OptimizationOrderDetail[]>(
              orderList,
              pageSize,
              currentPage,
            )
          : []
      }
      trackBy="id"
      pagination={
        <PaginationComponent
          pagination={{
            count: orderList ? orderList.length : 0,
            pageNumber: currentPage,
            pageSize,
          }}
          onPageChange={(e) => setCurrentPage(e)}
        />
      }
    />
  );
};

export default OptimizationOrderDetails;
