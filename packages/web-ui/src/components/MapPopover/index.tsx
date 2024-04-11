/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { Popover } from "@cloudscape-design/components";
import React from "react";
import MapWrapper from "../Map/MapWrapper";
import { MapProps } from "../Map";

export interface MapPopoverProps extends MapProps {
  children: React.ReactNode;
}

const MapPopover: React.FC<MapPopoverProps> = ({ children, ...props }) => {
  return (
    <Popover
      position="top"
      size="large"
      triggerType="text"
      content={
        <MapWrapper {...props} style={{ width: "400px", height: "400px" }} />
      }
    >
      {children}
    </Popover>
  );
};

export default MapPopover;
