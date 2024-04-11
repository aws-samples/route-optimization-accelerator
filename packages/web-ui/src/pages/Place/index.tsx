/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React from "react";
import { Route, Routes } from "react-router-dom";
import { CommonPageWrapper } from "../../components/CommonPageWrapper";
import ListPlaces from "./List";
import NewPlace from "./New";
import ViewPlace from "./View";
import EditPlace from "./Edit";

type PageWrapperProps = {
  children: React.ReactNode;
  isLoading: boolean;
};

const PlacePageWrapper: React.FC<PageWrapperProps> = ({
  children,
  isLoading,
}) => {
  return (
    <CommonPageWrapper isLoading={isLoading} header="Places">
      {children}
    </CommonPageWrapper>
  );
};

const PlaceApp: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ListPlaces />} />
      <Route path="new" element={<NewPlace />} />
      <Route path=":id" element={<ViewPlace />} />
      <Route path=":id/edit" element={<EditPlace />} />
    </Routes>
  );
};

export default PlaceApp;
export { PlacePageWrapper };
