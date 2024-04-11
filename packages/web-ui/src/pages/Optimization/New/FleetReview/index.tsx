/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { Button, Table, Toggle } from "@cloudscape-design/components";
import React from "react";
import { Optional } from "../../../../utils/common";
import { OptimizationFleetDetail } from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";

import MapPopover from "../../../../components/MapPopover";
import FleetLimitsPopover from "../../../../components/FleetLimitPopover";
import { DEFAULT_CONFIG } from "../../../../components/OptimizationConfiguration";
import { Tags } from "../../../../components/Tags";

export interface FleetReviewProps {
  optimizationFleet: Optional<OptimizationFleetDetail[]>;
  allowCancellation?: boolean;
  onCancel?: (id: string) => void;
}

const FleetReview: React.FC<FleetReviewProps> = ({
  optimizationFleet,
  allowCancellation,
  onCancel,
}) => {
  return (
    <>
      {optimizationFleet && optimizationFleet.length > 0 && (
        <Table
          columnDefinitions={[
            {
              id: "id",
              header: "Id",
              cell: (item) => item.id,
            },
            {
              id: "preferredDepartureTime",
              header: "Departure Time",
              cell: (item) => item.preferredDepartureTime || "-",
            },
            {
              id: "location",
              header: "Location",
              cell: (item) => (
                <MapPopover
                  lat={item.startingLocation.latitude}
                  lon={item.startingLocation.longitude}
                  markers={[
                    [
                      item.startingLocation.longitude,
                      item.startingLocation.latitude,
                      { color: "red", popupContent: <>Fleet Location</> },
                    ],
                  ]}
                >
                  Location
                </MapPopover>
              ),
            },
            {
              id: "backToOrigin",
              header: "Back to Origin",
              cell: (item) => (
                <Toggle
                  disabled
                  checked={
                    item.backToOrigin === undefined
                      ? DEFAULT_CONFIG.backToOrigin!
                      : item.backToOrigin
                  }
                />
              ),
            },
            {
              id: "limits",
              header: "Limits",
              cell: (item) => (
                <FleetLimitsPopover limits={item.limits} label="Limits" />
              ),
            },
            {
              id: "attributes",
              header: "Attributes",
              cell: (item) => <Tags tags={item.attributes} />,
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
            { id: "preferredDepartureTime", visible: true },
            { id: "location", visible: true },
            { id: "backToOrigin", visible: true },
            { id: "limits", visible: true },
            { id: "attributes", visible: true },
            { id: "actions", visible: allowCancellation === true },
          ]}
          items={optimizationFleet || []}
        />
      )}
    </>
  );
};

export default FleetReview;
