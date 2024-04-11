/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/

/**
 * Common @aws-sdk dependencies.
 * These are used in _all_ API projects
 */
const awsSdkDepsCommon = ["@aws-sdk/types"];

/**
 * @aws-sdk dependencies specific for ADMIN-WEB-API
 */
export const awsSdkDepsAdminWebApi = [
  ...awsSdkDepsCommon,
  "@aws-sdk/client-location",
  "@aws-sdk/client-api-gateway",
  "@aws-sdk/client-secrets-manager",
  "@aws-sdk/smithy-client",
  "@aws-sdk/client-scheduler",
  "@aws-sdk/client-eventbridge",
  "@aws-sdk/client-lambda",
  "@aws-sdk/client-cognito-identity-provider",
  "@aws-sdk/client-cognito-identity",
  "@aws-sdk/client-dynamodb",
  "@aws-sdk/lib-dynamodb",
  "@aws-sdk/client-sqs",
];
