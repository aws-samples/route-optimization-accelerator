/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TranslateConfig, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const defaultDDBClientOptions: TranslateConfig = {
  marshallOptions: {
    removeUndefinedValues: true,
  },
};

export const getDynamoDBClient = () => {
  const client = new DynamoDBClient({});
  return DynamoDBDocumentClient.from(client, defaultDDBClientOptions);
};

export const chunksArray = (arr: any[], n: number) => {
  const result = [];
  for (let i = 0; i < arr.length; i += n) {
    result.push(arr.slice(i, i + n));
  }

  return result;
};

export const MAX_PAGINATION_LOOP = 20;

export const DEFAULT_PAGE_SIZE = 40;
