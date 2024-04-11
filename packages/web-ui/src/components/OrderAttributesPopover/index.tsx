/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { Box, Popover, SpaceBetween } from "@cloudscape-design/components";
import { OrderAttributes } from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import React from "react";
import { NumberFormatter } from "../NumberFormatter";

export interface OrderAttributesPopoverProps {
  attributes?: OrderAttributes;
  label?: string;
}

const OrderAttributesPopover: React.FC<OrderAttributesPopoverProps> = ({
  attributes,
  label,
}) => {
  return (
    <>
      {attributes ? (
        <Popover
          position="top"
          size="large"
          triggerType="text"
          content={
            <Box>
              <SpaceBetween size="m">
                <Box variant="p">
                  <strong>Volume</strong>:{" "}
                  <NumberFormatter
                    value={attributes.volume}
                    decimalDigits={2}
                  />
                </Box>
                <Box variant="p">
                  <strong>Weight</strong>:{" "}
                  <NumberFormatter
                    value={attributes.weight}
                    decimalDigits={2}
                  />
                </Box>
              </SpaceBetween>
            </Box>
          }
        >
          {label || "attributes"}
        </Popover>
      ) : (
        "-"
      )}
    </>
  );
};

export default OrderAttributesPopover;
