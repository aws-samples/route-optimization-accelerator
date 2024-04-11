/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { Button, Popover } from "@cloudscape-design/components";
import React, { useEffect, useState } from "react";
import dayjs from "../../utils/dayjs";

export enum DateFormats {
  default = "DD/MM/YYYY HH:mm:ss",
}

export enum DateTimeLabelMode {
  Relative = "relative",
  ISOFormat = "ISOFormat",
  Custom = "custom",
}

export enum InitialRelativeMode {
  Relative = "relative",
  Absolute = "absolute",
}

export interface DateTimeLabelProps extends React.PropsWithChildren {
  timestamp?: number;
  mode?: DateTimeLabelMode;
  customFormat?: string;
  allowDateFlipping?: boolean;
  initialRelativeMode?: InitialRelativeMode;
  timeZone?: string;
}

export const DateTimeLabel: React.FC<DateTimeLabelProps> = ({
  timestamp,
  mode,
  customFormat,
  allowDateFlipping = true,
  initialRelativeMode,
  timeZone,
}) => {
  const [view, setView] = React.useState<InitialRelativeMode>(
    initialRelativeMode || InitialRelativeMode.Relative,
  );
  const [tzToUse, setTzToUse] = useState<string>();
  const [extendedFormat, setExtendedFormt] = useState<string>();
  const [relativeFormat, setRelativeFormat] = useState<string>();

  const flipView = () => {
    if (view === "relative") {
      setView(InitialRelativeMode.Absolute);
    } else {
      setView(InitialRelativeMode.Relative);
    }
  };

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const currentTimezone = timeZone || tz;

    if (currentTimezone) {
      setTzToUse(currentTimezone);
      setRelativeFormat(dayjs.utc().tz(currentTimezone).to(timestamp));
      setExtendedFormt(
        dayjs
          .utc(timestamp)
          .tz(currentTimezone)
          .format(customFormat || DateFormats.default),
      );
    }
  }, [timestamp, timeZone, customFormat]);

  return (
    <>
      {timestamp && timestamp > 0 ? (
        <>
          {mode === DateTimeLabelMode.Relative && (
            <>
              {allowDateFlipping && (
                <Button iconName="calendar" variant="icon" onClick={flipView} />
              )}
              <Popover
                position="top"
                size="medium"
                triggerType="text"
                content={
                  view === InitialRelativeMode.Relative
                    ? extendedFormat
                    : relativeFormat
                }
              >
                {view === InitialRelativeMode.Relative
                  ? relativeFormat
                  : extendedFormat}
              </Popover>
            </>
          )}
          {mode === DateTimeLabelMode.ISOFormat &&
            dayjs.utc(timestamp).tz(tzToUse).toISOString()}
          {mode === DateTimeLabelMode.Custom &&
            dayjs.utc(timestamp).tz(tzToUse).format(customFormat)}
        </>
      ) : (
        "-"
      )}
    </>
  );
};
