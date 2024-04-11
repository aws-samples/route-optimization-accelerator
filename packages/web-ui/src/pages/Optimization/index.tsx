/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React from "react";
import { Route, Routes } from "react-router-dom";
import ListOptimizations from "./List";
import { CommonPageWrapper } from "../../components/CommonPageWrapper";
import NewOptimization from "./New";
import ViewOptimization from "./View";
import OptimizationDetail from "./Detail";

type PageWrapperProps = {
  children: React.ReactNode;
  isLoading: boolean;
};

const OptimizationPageWrapper: React.FC<PageWrapperProps> = ({
  children,
  isLoading,
}) => {
  return (
    <CommonPageWrapper isLoading={isLoading} header="Route Optimization">
      {children}
    </CommonPageWrapper>
  );
};

const OptimizationApp: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ListOptimizations />} />
      <Route path="new" element={<NewOptimization />} />
      <Route path=":id" element={<ViewOptimization />} />
      <Route path=":id/:fleetId" element={<OptimizationDetail />} />
    </Routes>
  );
};

export default OptimizationApp;
export { OptimizationPageWrapper };
