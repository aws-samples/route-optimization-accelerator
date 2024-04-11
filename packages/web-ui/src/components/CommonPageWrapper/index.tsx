/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { ContentLayout, Header } from "@cloudscape-design/components";
import React, { useEffect, useRef } from "react";
import LoadingBar from "react-top-loading-bar";

type PageWrapperProps = {
  children: React.ReactNode;
  isLoading: boolean;
  header: string;
};

const CommonPageWrapper: React.FC<PageWrapperProps> = ({
  children,
  isLoading,
  header,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (isLoading) {
      // @ts-ignore
      ref.current.continuousStart();
    } else {
      // @ts-ignore
      ref.current.complete();
    }
  }, [isLoading]);

  return (
    <ContentLayout header={<Header>{header}</Header>}>
      <LoadingBar ref={ref} />
      {children}
    </ContentLayout>
  );
};

export { CommonPageWrapper };
