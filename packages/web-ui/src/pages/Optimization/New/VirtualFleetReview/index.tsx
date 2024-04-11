/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  Box,
  Button,
  SpaceBetween,
  Table,
  Toggle,
} from "@cloudscape-design/components";
import React from "react";
import { Optional } from "../../../../utils/common";
import { OptimizationVirtualFleet } from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";

import MapPopover from "../../../../components/MapPopover";
import FleetLimitsPopover from "../../../../components/FleetLimitPopover";
import { DEFAULT_CONFIG } from "../../../../components/OptimizationConfiguration";
import { Tags } from "../../../../components/Tags";

export interface VirtualFleetReviewProps {
  virtualFleet: Optional<OptimizationVirtualFleet[]>;
  allowCreation?: boolean;
  allowCancellation?: boolean;
  onCancel?: (id: string) => void;
  onCreateNew?: () => void;
}

const VirtualFleetReview: React.FC<VirtualFleetReviewProps> = ({
  virtualFleet,
  allowCreation,
  allowCancellation,
  onCancel,
  onCreateNew,
}) => {
  return (
    <SpaceBetween size="m">
      {((allowCreation === false && virtualFleet && virtualFleet.length > 0) ||
        allowCreation) && (
        <Table
          columnDefinitions={[
            { id: "group", header: "Group ID", cell: (item) => item.groupId },
            { id: "size", header: "Size", cell: (item) => item.size },
            {
              id: "location",
              header: "Starting Location",
              cell: (item) => (
                <MapPopover
                  lat={item.startingLocation.latitude}
                  lon={item.startingLocation.longitude}
                  markers={[
                    [
                      item.startingLocation.longitude,
                      item.startingLocation.latitude,
                      {
                        color: "red",
                        popupContent: <>Starting Location</>,
                      },
                    ],
                  ]}
                >
                  Location
                </MapPopover>
              ),
            },
            {
              id: "departureTime",
              header: "Departure Time",
              cell: (item) => item.preferredDepartureTime,
            },
            {
              id: "backToOrigin",
              header: "Back to Origin",
              cell: (item) => (
                <Toggle
                  disabled
                  checked={
                    item.backToOrigin !== undefined
                      ? item.backToOrigin
                      : DEFAULT_CONFIG.backToOrigin!
                  }
                />
              ),
            },
            {
              id: "limits",
              header: "Limits",
              cell: (item) => <FleetLimitsPopover limits={item.limits} />,
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
                  onClick={() => onCancel && onCancel(item.groupId)}
                  variant="icon"
                  iconName="remove"
                  iconAlt="Remove item"
                />
              ),
            },
          ]}
          columnDisplay={[
            { id: "group", visible: true },
            { id: "size", visible: true },
            { id: "location", visible: true },
            { id: "departureTime", visible: true },
            { id: "backToOrigin", visible: true },
            { id: "limits", visible: true },
            { id: "attributes", visible: true },
            { id: "actions", visible: allowCancellation === true },
          ]}
          items={virtualFleet || []}
          stripedRows
          empty={
            <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
              <SpaceBetween size="m">
                <b>No virtual fleet</b>
                <Button onClick={onCreateNew}>Create new virtual fleet</Button>
              </SpaceBetween>
            </Box>
          }
        />
      )}
      {allowCreation && virtualFleet && virtualFleet?.length > 0 && (
        <Button onClick={onCreateNew}>Create new virtual fleet</Button>
      )}
    </SpaceBetween>
  );
};

export default VirtualFleetReview;
