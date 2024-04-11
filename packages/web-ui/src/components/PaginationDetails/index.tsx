/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { Pagination } from "@cloudscape-design/components";
import React from "react";

export interface PaginationDetails {
  count: number;
  pageSize: number;
  pageNumber: number;
}

type PaginationDetailsProps = {
  pagination?: PaginationDetails;
  onPageChange?: (pageNumber: number) => void;
};

const PaginationComponent: React.FC<PaginationDetailsProps> = ({
  pagination,
  onPageChange,
}) => {
  return pagination ? (
    <Pagination
      currentPageIndex={pagination.pageNumber}
      pagesCount={Math.ceil(pagination.count / pagination.pageSize)}
      ariaLabels={{
        nextPageLabel: "Next page",
        previousPageLabel: "Previous page",
        pageLabel: (pageNumber) => `Page ${pageNumber} of all pages`,
      }}
      onChange={({ detail }) =>
        onPageChange && onPageChange(detail.currentPageIndex)
      }
      onPreviousPageClick={({ detail }) =>
        onPageChange && onPageChange(detail.requestedPageIndex)
      }
      onNextPageClick={({ detail }) =>
        onPageChange && onPageChange(detail.requestedPageIndex)
      }
    />
  ) : (
    <></>
  );
};

export default PaginationComponent;
