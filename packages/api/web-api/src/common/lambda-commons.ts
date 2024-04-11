/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  Response,
  OperationResponse,
  buildResponseHeaderInterceptor,
} from "@route-optimization-accelerator/web-api-service-typescript-runtime";

export const CORS_HEADERS: { [key: string]: string } = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

// define using buildResponseHeaderInterceptor instead of corsInterceptor so that
// application can override the CORS_HEADERS defined above
export const customHeadersInterceptor =
  buildResponseHeaderInterceptor(CORS_HEADERS);

export const buildBadRequest = (message: string): OperationResponse<any, any> =>
  Response.badRequest({ message });

export const buildNotFound = (message: string): OperationResponse<any, any> =>
  Response.notFound({ message });

export const buildInternalServerError = (
  message: string,
): OperationResponse<any, any> => Response.internalFailure({ message });
