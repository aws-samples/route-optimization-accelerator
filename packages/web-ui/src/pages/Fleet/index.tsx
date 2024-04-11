/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React from "react";
import { Route, Routes } from "react-router-dom";
import { CommonPageWrapper } from "../../components/CommonPageWrapper";
import ListFleet from "./List";
import EditFleet from "./Edit";
import NewFleet from "./New";
import ViewFleet from "./View";

type PageWrapperProps = {
  children: React.ReactNode;
  isLoading: boolean;
};

const FleetPageWrapper: React.FC<PageWrapperProps> = ({
  children,
  isLoading,
}) => {
  return (
    <CommonPageWrapper isLoading={isLoading} header="Fleet">
      {children}
    </CommonPageWrapper>
  );
};

const FleetApp: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ListFleet />} />
      <Route path="new" element={<NewFleet />} />
      <Route path=":id" element={<ViewFleet />} />
      <Route path=":id/edit" element={<EditFleet />} />
    </Routes>
  );
};

export default FleetApp;
export { FleetPageWrapper };
