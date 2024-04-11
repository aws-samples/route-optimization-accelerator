/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { Select, SelectProps } from "@cloudscape-design/components";
import React, { useEffect, useState } from "react";
import { useApiClient } from "../../api/WebApi";
import { useDebounce } from "../../hooks/use-debounce";
import { DropdownStatusProps } from "@cloudscape-design/components/internal/components/dropdown-status";
import { Optional, keyReducer } from "../../utils/common";
import { Order } from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";

export interface OrderFinderProps {
  selectedItemValue?: string;
  onSelect?: (option: Optional<Order>) => void;
}

export const OrderFinder: React.FC<OrderFinderProps> = ({
  selectedItemValue,
  onSelect,
}) => {
  const [selectedOption, setSelectedOption] =
    React.useState<SelectProps.Option | null>(null);
  const [options, setOptions] = React.useState<SelectProps.Options>([]);
  const [rawData, setRawData] = useState<Optional<{ [key: string]: Order }>>();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<DropdownStatusProps.StatusType>();
  const [hasAdditionalPages, setHasAdditionalPages] = useState<boolean>(false);
  const debouncedValue = useDebounce(value, 200);
  const webApi = useApiClient();

  const fetch = async () => {
    try {
      setStatus("loading");

      const response = await webApi.listOrders({
        name: debouncedValue,
        limit: 50_000,
      });
      const items: SelectProps.Options = response.data.map((q) => ({
        value: q.id,
        label: q.number,
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
      placeholder="Select an order"
      empty="No options available"
      onLoadItems={({ detail }) => setValue(detail.filteringText)}
      statusType={status}
      options={options}
      filteringType={hasAdditionalPages ? "manual" : "auto"}
      errorText="Error loading the orders"
      loadingText="Loading elements"
    />
  );
};
