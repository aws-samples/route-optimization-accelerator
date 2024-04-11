/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { Box, Header, HeaderProps } from "@cloudscape-design/components";
import React from "react";

export interface ValueWithLabelProps extends React.PropsWithChildren {
  label: React.ReactNode;
  actions?: React.ReactNode;
  headering?: boolean;
  headerVariant?: HeaderProps.Variant;
}

export const ValueWithLabel: React.FC<ValueWithLabelProps> = ({
  label,
  actions,
  headering,
  headerVariant = "h3",
  children,
}) => (
  <div>
    <Box variant="awsui-key-label">
      {headering ? (
        <Header variant={headerVariant} actions={actions}>
          {label}
        </Header>
      ) : actions ? (
        <Box display="inline-block">
          <Box variant="awsui-key-label" display="inline-block">
            {label}
          </Box>
          <Box display="inline-block" padding={{ left: "m" }}>
            {actions}
          </Box>
        </Box>
      ) : (
        label
      )}
    </Box>
    <div>{children}</div>
  </div>
);
