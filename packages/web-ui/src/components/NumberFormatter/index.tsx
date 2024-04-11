/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React from "react";

export interface DurationProps extends React.PropsWithChildren {
  value?: number;
  decimalDigits?: number;
  prepend?: string;
  append?: string;
}

export const NumberFormatter: React.FC<DurationProps> = ({
  value,
  decimalDigits,
  prepend,
  append,
}) => {
  return (
    <>
      {value !== null && value !== undefined
        ? `${prepend || ""}${value.toLocaleString(navigator.language, {
            minimumFractionDigits: decimalDigits || 0,
            maximumFractionDigits: decimalDigits || 0,
          })}${append || ""}`
        : "-"}
    </>
  );
};
