/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  OptimizationAssignmentOrderResult,
  OptimizationOrderDetail,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import React, { useEffect, useState } from "react";
import {
  Header,
  SpaceBetween,
  Table,
  Toggle,
} from "@cloudscape-design/components";
import {
  DateFormats,
  DateTimeLabel,
  DateTimeLabelMode,
} from "../../../../components/DateTimeLabel";
import PaginationComponent from "../../../../components/PaginationDetails";
import dayjs from "../../../../utils/dayjs";
import { Duration, DurationFormats } from "../../../../components/Duration";
import { NumberFormatter } from "../../../../components/NumberFormatter";
import { DEFAULTS } from "../../../../utils/common";

export interface OptimizationOrderDetailProps {
  optimizationOrders?: OptimizationOrderDetail[];
  assignedOrders?: OptimizationAssignmentOrderResult[];
  suggestedRoute?: any;
}

export interface LegInformation {
  distance?: number;
  duration?: number;
}

export interface AssignementOrderTableProps
  extends OptimizationOrderDetail,
    OptimizationAssignmentOrderResult,
    LegInformation {}

const AssignementOrderTable: React.FC<OptimizationOrderDetailProps> = ({
  optimizationOrders,
  assignedOrders,
  suggestedRoute,
}) => {
  const [pageSize] = useState(DEFAULTS.pageSize);
  const [currentPage, setCurrentPage] = useState(0);
  const [showLegInfo, setShowLegInfo] = useState(false);
  const [orderList, setOrderList] = useState<AssignementOrderTableProps[]>([]);
  const [currentPageItems, setCurrentPageItems] = useState<
    AssignementOrderTableProps[]
  >([]);

  const fetchPage = (pageNumber: number) => {
    setCurrentPage(pageNumber - 1);
  };

  useEffect(() => {
    const base = currentPage * pageSize;

    setCurrentPageItems((orderList || []).slice(base, base + pageSize));
  }, [orderList, pageSize, currentPage]);

  useEffect(() => {
    if (optimizationOrders && assignedOrders) {
      setOrderList(
        assignedOrders.map((q, idx) => {
          const order = optimizationOrders.find((o) => o.id === q.id);
          const leg = suggestedRoute ? suggestedRoute.legs[idx] : {};

          return {
            ...order!,
            arrivalTime: q.arrivalTime,
            distance: leg.distance,
            duration: leg.durationSeconds,
          };
        }),
      );
    }
  }, [optimizationOrders, assignedOrders, suggestedRoute]);

  return (
    <SpaceBetween size="l">
      <Header>Orders</Header>
      <Toggle
        onChange={({ detail }) => setShowLegInfo(detail.checked)}
        checked={showLegInfo}
      >
        Show Travel Details
      </Toggle>
      <Table
        columnDefinitions={[
          {
            id: "id",
            header: "Id",
            cell: (e) => e.id,
          },
          {
            id: "serviceDuration",
            header: "Service Duration",
            cell: (e) =>
              e.serviceTime
                ? dayjs
                    .duration(e.serviceTime, "seconds")
                    .format(DurationFormats.default)
                : "-",
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
            id: "arrivalTime",
            header: "Arrival Time",
            cell: (e) => (
              <DateTimeLabel
                timestamp={new Date(e.arrivalTime!).getTime()}
                mode={DateTimeLabelMode.Custom}
                customFormat={DateFormats.default}
              />
            ),
          },
          {
            id: "distance",
            header: "Distance",
            cell: (e) => (
              <NumberFormatter value={e.distance} decimalDigits={2} />
            ),
          },
          {
            id: "travelDuration",
            header: "Travel Duration",
            cell: (e) => {
              return <Duration value={e.duration} unit="seconds" />;
            },
          },
          {
            id: "waitTime",
            header: "Wait Time",
            cell: (e) =>
              e.serviceWindow ? (
                <Duration
                  value={
                    e.arrivalTime! < e.serviceWindow?.from
                      ? new Date(e.serviceWindow.from).getTime() -
                        new Date(e.arrivalTime).getTime()
                      : 0
                  }
                  unit="milliseconds"
                />
              ) : (
                "-"
              ),
          },
          {
            id: "lateTime",
            header: "Late Time",
            cell: (e) =>
              e.serviceWindow ? (
                <Duration
                  value={
                    e.arrivalTime! > e.serviceWindow?.to
                      ? new Date(e.arrivalTime).getTime() -
                        new Date(e.serviceWindow.to).getTime()
                      : 0
                  }
                  unit="milliseconds"
                />
              ) : (
                "-"
              ),
          },
        ]}
        columnDisplay={[
          { id: "id", visible: true },
          { id: "serviceDuration", visible: true },
          { id: "serviceFrom", visible: true },
          { id: "serviceTo", visible: true },
          { id: "arrivalTime", visible: true },
          { id: "distance", visible: showLegInfo },
          { id: "travelDuration", visible: showLegInfo },
          { id: "waitTime", visible: true },
          { id: "lateTime", visible: true },
        ]}
        items={currentPageItems}
        variant="embedded"
        stripedRows={true}
        stickyHeader={true}
        trackBy="id"
        pagination={
          <PaginationComponent
            pagination={{
              count: orderList.length,
              pageNumber: currentPage + 1,
              pageSize,
            }}
            onPageChange={fetchPage}
          />
        }
      />
    </SpaceBetween>
  );
};

export default AssignementOrderTable;
