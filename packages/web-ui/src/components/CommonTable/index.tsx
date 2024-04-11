/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Header,
  Pagination,
  SpaceBetween,
  Spinner,
  Table,
  TableProps,
  TextFilter,
} from "@cloudscape-design/components";
import { PaginationDetails } from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import { useApiClient } from "../../api/WebApi";
import { DEFAULTS, Optional, keyReducer } from "../../utils/common";
import { useDebounce } from "../../hooks/use-debounce";

interface BaseOutput<T> {
  data: T[];
  pagination: any;
}

export interface CommonTableProps<T, Q extends BaseOutput<T>> {
  fetchFunction: (lastEvaluatedKey?: string, filterText?: string) => Promise<Q>;
  onError?: (message: string) => void;
  onCreateNew: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onSelectionChange?: (data: Optional<T[]>) => void;
  headerActions?: React.ReactNode;
  selectionType?: TableProps.SelectionType;
  columndDefinition: Array<TableProps.ColumnDefinition<T>>;
  idPropertyName?: string;
  loadingText?: string;
  filterText?: string;
  missingItemsText?: string;
  headerText?: string;
  createNewTextEmptyBox?: string;
  refresh?: number;
  actionLoading?: boolean;
}

const CommonTable = <T, Q extends BaseOutput<T>>({
  refresh,
  columndDefinition,
  idPropertyName,
  selectionType,
  actionLoading,
  headerActions,
  loadingText,
  filterText,
  headerText,
  missingItemsText,
  createNewTextEmptyBox,
  onSelectionChange,
  onLoadingChange,
  fetchFunction,
  onCreateNew,
  onError,
}: CommonTableProps<T, Q>) => {
  const webApi = useApiClient();
  const [selectedItems, setSelectedItems] = useState<T[]>();
  const [pageSize] = useState(DEFAULTS.pageSize);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [headerLoading, setHeaderLoading] = useState<boolean>(false);
  const [allItems, setAllItems] = useState<{
    [key: string]: T;
  }>({});
  const [currentPageItems, setCurrentPageItems] = useState<T[]>([]);
  const [elementCount, setElementCount] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [filteredText, setFilteredText] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationDetails | undefined>();
  const debouncedFilteredText = useDebounce(filteredText, 300);

  const retrieveContent = async (restore?: boolean) => {
    try {
      setHeaderLoading(true);
      const idPName = idPropertyName || "id";
      const results = await fetchFunction(
        !restore ? (pagination || {}).lastEvaluatedKey : undefined,
        filteredText,
      );

      setAllItems((old) => ({
        ...(!restore ? old : {}),
        // @ts-ignore
        ...results.data.reduce(keyReducer(idPName), {}),
      }));
      setPagination(results.pagination);
    } catch (err) {
      console.error(err);
      handleError("Uneable to retrieve the elements");
    } finally {
      setHeaderLoading(false);
    }
  };

  useEffect(() => {
    const base = currentPage * pageSize;

    const values = Object.values(allItems);
    setPageCount(Math.ceil(values.length / DEFAULTS.pageSize));
    setCurrentPageItems((values || []).slice(base, base + pageSize));
    setElementCount(values.length);
  }, [allItems, currentPage, pageSize]);

  useEffect(() => {
    const fetchData = async () => {
      if (pagination?.lastEvaluatedKey && pageCount - (currentPage + 1) <= 0) {
        await retrieveContent();
      }
    };

    fetchData();
  }, [currentPage]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await retrieveContent(true);
      setIsLoading(false);
    };

    fetchData();
  }, [webApi, refresh, debouncedFilteredText]);

  useEffect(() => {
    setSelectedItems(undefined);
  }, [refresh]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedItems);
    }
  }, [selectedItems]);

  const handleError = (message: string) => {
    if (onError) {
      onError(message);
    }
  };

  useEffect(() => {
    if (actionLoading !== undefined) {
      setHeaderLoading(actionLoading);
    }
  }, [actionLoading]);

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }
  }, [isLoading]);

  useEffect(() => {
    setHasNextPage(pagination !== undefined && !!pagination.lastEvaluatedKey);
  }, [pagination]);

  return (
    <Table
      variant="embedded"
      stripedRows={true}
      loading={isLoading}
      onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
      selectedItems={selectedItems}
      selectionType={selectionType}
      filter={
        <TextFilter
          filteringPlaceholder={filterText || "Find elements"}
          filteringText={filteredText}
          onChange={(v) => setFilteredText(v.detail.filteringText)}
        />
      }
      columnDefinitions={columndDefinition}
      items={currentPageItems}
      loadingText={loadingText || "Loading items"}
      empty={
        <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
          <SpaceBetween size="m">
            <b>{missingItemsText || "No items"}</b>
            <Button onClick={onCreateNew}>
              {createNewTextEmptyBox || "Create a new item"}
            </Button>
          </SpaceBetween>
        </Box>
      }
      trackBy={idPropertyName}
      header={
        <Header
          counter={
            allItems ? `(${elementCount}${hasNextPage ? "+" : ""})` : undefined
          }
          actions={headerActions}
        >
          {headerText || "Items"} {headerLoading ? <Spinner /> : ""}
        </Header>
      }
      pagination={
        <Pagination
          currentPageIndex={currentPage + 1}
          pagesCount={pageCount}
          openEnd={hasNextPage}
          onChange={(e) => setCurrentPage(e.detail.currentPageIndex - 1)}
        />
      }
    />
  );
};

export default CommonTable;
