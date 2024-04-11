/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { Select, SelectProps } from "@cloudscape-design/components";
import React, { useEffect, useState } from "react";
import { useApiClient } from "../../api/WebApi";
import { useDebounce } from "../../hooks/use-debounce";
import { DropdownStatusProps } from "@cloudscape-design/components/internal/components/dropdown-status";
import {
  Optional,
  capitalizeFirstLetter,
  keyReducer,
} from "../../utils/common";
import { Place } from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";

export interface PlaceFinderProps {
  selectedItemValue?: string;
  onSelect?: (option: Optional<Place>) => void;
}

export const PlaceFinder: React.FC<PlaceFinderProps> = ({
  selectedItemValue,
  onSelect,
}) => {
  const [selectedOption, setSelectedOption] =
    React.useState<SelectProps.Option | null>(null);
  const [options, setOptions] = React.useState<SelectProps.Options>([]);
  const [rawData, setRawData] = useState<Optional<{ [key: string]: Place }>>();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<DropdownStatusProps.StatusType>();
  const [hasAdditionalPages, setHasAdditionalPages] = useState<boolean>(false);
  const debouncedValue = useDebounce(value, 200);
  const webApi = useApiClient();

  const fetch = async () => {
    try {
      setStatus("loading");

      const response = await webApi.listPlaces({
        name: debouncedValue,
        limit: 50_000,
      });
      const items: SelectProps.Options = response.data.map((q) => ({
        value: q.id,
        label: q.name,
        description: `Type: ${capitalizeFirstLetter(q.type.toLocaleLowerCase())}`,
      }));

      setOptions((old) =>
        Object.values({
          ...old.reduce(keyReducer("value"), {}),
          ...items.reduce(keyReducer("value"), {}),
        }),
      );
      setRawData(response.data.reduce(keyReducer(), {}));
      setStatus(response.pagination.lastEvaluatedKey ? "pending" : "finished");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  useEffect(() => {
    if (options && options.length > 0) {
      setSelectedOption(
        options.find((q: any) => q.value === selectedItemValue) || null,
      );
    }
  }, [options, selectedItemValue]);

  useEffect(() => {
    if (hasAdditionalPages) {
      fetch();
    }
  }, [debouncedValue]);

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    if (onSelect) {
      onSelect(selectedOption ? rawData![selectedOption?.value!]! : undefined);
    }
  }, [selectedOption]);

  useEffect(() => {
    setHasAdditionalPages(status === "pending");
  }, [status]);

  return (
    <Select
      selectedOption={selectedOption}
      onChange={({ detail }) => setSelectedOption(detail.selectedOption)}
      placeholder="Select a location"
      empty="No options available"
      onLoadItems={({ detail }) => setValue(detail.filteringText)}
      statusType={status}
      options={options}
      filteringType={hasAdditionalPages ? "manual" : "auto"}
      errorText="Error loading the places"
      loadingText="Loading elements"
    />
  );
};
