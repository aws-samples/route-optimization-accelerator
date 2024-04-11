/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React, { useEffect, useState } from "react";
import {
  OptimizationFleetDetail,
  OptimizationVirtualFleet,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import { Table, Toggle } from "@cloudscape-design/components";
import PaginationComponent from "../../../../components/PaginationDetails";
import { Optional, paginate } from "../../../../utils/common";
import MapPopover from "../../../../components/MapPopover";
import {
  DateFormats,
  DateTimeLabel,
  DateTimeLabelMode,
} from "../../../../components/DateTimeLabel";
import { Tags } from "../../../../components/Tags";
import FleetLimitsPopover from "../../../../components/FleetLimitPopover";

export interface TotalFleetDetails extends OptimizationFleetDetail {
  isVirtual: boolean;
}

export interface OptimizationFleetDetailsProps {
  fleet?: OptimizationFleetDetail[];
  virtualFleet?: OptimizationVirtualFleet[];
}

const OptimizationFleetDetails: React.FC<OptimizationFleetDetailsProps> = ({
  fleet,
  virtualFleet,
}) => {
  const [fleetList, setFleetList] =
    useState<Optional<OptimizationFleetDetail[]>>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(5);

  useEffect(() => {
    const totalFleet: TotalFleetDetails[] = [];
    if (fleet && fleet.length > 0) {
      totalFleet.push(
        ...fleet.map((f): TotalFleetDetails => ({ isVirtual: false, ...f })),
      );
    }

    if (virtualFleet) {
      virtualFleet.forEach((vFleet) => {
        for (let i = 0; i < vFleet.size; i++) {
          totalFleet.push({
            id: (i + 1).toString(),
            isVirtual: true,
            limits: vFleet.limits,
            attributes: vFleet.attributes,
            backToOrigin: vFleet.backToOrigin,
            startingLocation: vFleet.startingLocation,
            preferredDepartureTime: vFleet.preferredDepartureTime,
          });
        }
      });
    }

    setFleetList(totalFleet);
  }, [fleet, virtualFleet]);

  return (
    <Table
      variant="embedded"
      stripedRows={true}
      loading={!fleetList}
      columnDefinitions={[
        {
          id: "id",
          header: "Fleet Id",
          cell: (e) =>
            e.isVirtual ? (
              <em title="Virtual id generated at Runtime">Virtual-Id</em>
            ) : (
              e.id
            ),
        },
        {
          id: "startingLocation",
          header: "Starting Location",
          cell: (e) => (
            <MapPopover
              lat={e.startingLocation.latitude}
              lon={e.startingLocation.longitude}
              markers={[
                [
                  e.startingLocation.longitude,
                  e.startingLocation.latitude,
                  { color: "red", popupContent: <>Fleet Location</> },
                ],
              ]}
            >
              Location
            </MapPopover>
          ),
        },
        {
          id: "departureTime",
          header: "Preferred Departure Time",
          cell: (e) =>
            e.preferredDepartureTime ? (
              <>
                <DateTimeLabel
                  allowDateFlipping={false}
                  timestamp={new Date(e.preferredDepartureTime).getTime()}
                  mode={DateTimeLabelMode.Custom}
                  customFormat={DateFormats.default}
                />
              </>
            ) : (
              "-"
            ),
        },
        {
          id: "limits",
          header: "Limits",
          cell: (e) => <FleetLimitsPopover limits={e.limits} />,
        },
        {
          id: "requirements",
          header: "Requirements",
          cell: (e) => <Tags tags={e.attributes} />,
        },
        {
          id: "backToOrigin",
          header: "Back to origin",
          cell: (e) => <Toggle checked={!!e.backToOrigin} disabled />,
        },
        {
          id: "isVirtual",
          header: "Is Virtual",
          cell: (e) => <Toggle checked={e.isVirtual} disabled />,
        },
      ]}
      items={
        fleetList
          ? paginate<TotalFleetDetails[]>(fleetList, pageSize, currentPage)
          : []
      }
      trackBy="id"
      pagination={
        <PaginationComponent
          pagination={{
            count: fleetList ? fleetList.length : 0,
            pageNumber: currentPage,
            pageSize,
          }}
          onPageChange={(e) => setCurrentPage(e)}
        />
      }
    />
  );
};

export default OptimizationFleetDetails;
