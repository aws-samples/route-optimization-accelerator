/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React from "react";
import { Route, Routes } from "react-router-dom";
import { CommonPageWrapper } from "../../components/CommonPageWrapper";
import ListOrders from "./List";
import NewOrder from "./New";
import ViewOrder from "./View";
import EditOrder from "./Edit";

type PageWrapperProps = {
  children: React.ReactNode;
  isLoading: boolean;
};

const OrderPageWrapper: React.FC<PageWrapperProps> = ({
  children,
  isLoading,
}) => {
  return (
    <CommonPageWrapper isLoading={isLoading} header="Orders">
      {children}
    </CommonPageWrapper>
  );
};

const OrderApp: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ListOrders />} />
      <Route path="new" element={<NewOrder />} />
      <Route path=":id" element={<ViewOrder />} />
      <Route path=":id/edit" element={<EditOrder />} />
    </Routes>
  );
};

export default OrderApp;
export { OrderPageWrapper };
