/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React from "react";
import { Route, Routes } from "react-router-dom";
import ListExternalAPI from "./List";
import { CommonPageWrapper } from "../../components/CommonPageWrapper";

type PageWrapperProps = {
  children: React.ReactNode;
  isLoading: boolean;
};

const ExternalAPIPageWrapper: React.FC<PageWrapperProps> = ({
  children,
  isLoading,
}) => {
  return (
    <CommonPageWrapper isLoading={isLoading} header="External API">
      {children}
    </CommonPageWrapper>
  );
};

const ExternalAPIApp: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ListExternalAPI />} />
    </Routes>
  );
};

export default ExternalAPIApp;
export { ExternalAPIPageWrapper };
