/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { Alert, AlertProps } from "@cloudscape-design/components";
import { Optional } from "@cloudscape-design/components/internal/types";
import React from "react";

export interface AlertContent {
  type: AlertProps.Type;
  message: string;
}

export interface AlertWrapperProps {
  alert: Optional<AlertContent>;
}

const AlertWrapper: React.FC<AlertWrapperProps> = ({ alert }) => {
  return alert ? <Alert type={alert.type}>{alert.message}</Alert> : <></>;
};

export default AlertWrapper;
