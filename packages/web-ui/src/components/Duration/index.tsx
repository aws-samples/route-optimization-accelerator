/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { Popover } from "@cloudscape-design/components";
import type { DurationUnitType } from "dayjs/plugin/duration";
import React from "react";
import dayjs from "../../utils/dayjs";

export enum DurationFormats {
  default = "HH:mm:ss",
}

export interface DurationProps extends React.PropsWithChildren {
  from?: number;
  to?: number;
  value?: number;
  unit?: DurationUnitType;
  format?: string;
}

export const Duration: React.FC<DurationProps> = ({
  from,
  to,
  value,
  unit,
  format = DurationFormats.default,
}) => {
  return (
    <>
      {from && to ? (
        <Popover
          position="top"
          size="medium"
          triggerType="text"
          content={dayjs.duration(dayjs(to).diff(from)).format(format)}
        >
          {dayjs.duration(dayjs(to).diff(from)).humanize()}
        </Popover>
      ) : (
        <></>
      )}
      {value && unit ? (
        <Popover
          position="top"
          size="medium"
          triggerType="text"
          content={dayjs.duration(value, unit).format(format)}
        >
          {dayjs.duration(value, unit).humanize()}
        </Popover>
      ) : (
        <></>
      )}
      {!from && !to && !value && "-"}
    </>
  );
};
