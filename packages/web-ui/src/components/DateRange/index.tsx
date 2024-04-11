/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  DateRangePicker,
  DateRangePickerProps,
} from "@cloudscape-design/components";
import { useEffect, useState } from "react";
import dayjs from "../../utils/dayjs";

export interface DateRangeProps {
  absoluteOnly?: boolean;
  date?: {
    from: Date;
    to: Date;
  };
  onChange?: (from: Date, to: Date) => void;
  className?: string;
  placeholder?: string;
}

const DateRange: React.FC<DateRangeProps> = ({
  date,
  className,
  placeholder,
  absoluteOnly,
  onChange,
}) => {
  const [dateValue, setDateValue] = useState<DateRangePickerProps.Value | null>(
    null,
  );

  useEffect(() => {
    let from = undefined;
    let to = undefined;

    if (dateValue && dateValue?.type === "relative") {
      const now = dayjs();
      const duration = dayjs.duration({
        [`${dateValue.unit}s`]: dateValue.amount,
      });

      from = now.subtract(duration).toDate();
      to = now.toDate();
    } else if (dateValue && dateValue?.type === "absolute") {
      from = dayjs(dateValue.startDate).toDate();
      to = dayjs(dateValue.endDate).toDate();
    }

    if (from && to && onChange) {
      onChange(from!, to!);
    }
  }, [onChange, dateValue]);

  return (
    <DateRangePicker
      className={className}
      i18nStrings={{
        todayAriaLabel: "Today",
        nextMonthAriaLabel: "Next month",
        previousMonthAriaLabel: "Previous month",
        customRelativeRangeDurationLabel: "Duration",
        customRelativeRangeDurationPlaceholder: "Enter duration",
        customRelativeRangeOptionLabel: "Custom range",
        customRelativeRangeOptionDescription: "Set a custom range in the past",
        customRelativeRangeUnitLabel: "Unit of time",
        formatRelativeRange: (e) => {
          const n = 1 === e.amount ? e.unit : `${e.unit}s`;
          return `Last ${e.amount} ${n}`;
        },
        formatUnit: (e, n) => (1 === n ? e : `${e}s`),
        dateTimeConstraintText:
          "Range is 6 to 30 days. For date, use YYYY/MM/DD. For time, use 24 hr format.",
        relativeModeTitle: "Relative range",
        absoluteModeTitle: "Absolute range",
        relativeRangeSelectionHeading: "Choose a range",
        startDateLabel: "Start date",
        endDateLabel: "End date",
        startTimeLabel: "Start time",
        endTimeLabel: "End time",
        clearButtonLabel: "Clear and dismiss",
        cancelButtonLabel: "Cancel",
        applyButtonLabel: "Apply",
      }}
      onChange={({ detail }) => setDateValue(detail.value)}
      value={
        dateValue ||
        (date
          ? {
              startDate: date.from.toISOString(),
              endDate: date.to.toISOString(),
              type: "absolute",
            }
          : null)
      }
      relativeOptions={[
        {
          key: "previous-30-minutes",
          amount: 30,
          unit: "minute",
          type: "relative",
        },
        {
          key: "previous-1-hour",
          amount: 1,
          unit: "hour",
          type: "relative",
        },
        {
          key: "previous-6-hours",
          amount: 6,
          unit: "hour",
          type: "relative",
        },
        {
          key: "previous-12-hours",
          amount: 12,
          unit: "hour",
          type: "relative",
        },
        {
          key: "previous-24-hours",
          amount: 24,
          unit: "hour",
          type: "relative",
        },
      ]}
      rangeSelectorMode={absoluteOnly ? "absolute-only" : "default"}
      isValidRange={(range) => {
        if (range && range!.type === "absolute") {
          const [startDateWithoutTime] = range.startDate.split("T");
          const [endDateWithoutTime] = range.endDate.split("T");
          if (!startDateWithoutTime || !endDateWithoutTime) {
            return {
              valid: false,
              errorMessage:
                "The selected date range is incomplete. Select a start and end date for the date range.",
            };
          }
          if (
            new Date(range.startDate).getTime() -
              new Date(range.endDate).getTime() >
            0
          ) {
            return {
              valid: false,
              errorMessage:
                "The selected date range is invalid. The start date must be before the end date.",
            };
          }
        }
        return { valid: true };
      }}
      placeholder={placeholder || "Filter by a date and time range"}
    />
  );
};

export default DateRange;
