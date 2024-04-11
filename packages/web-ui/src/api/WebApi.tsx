/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  CognitoAuthContextAPI,
  CognitoUserSession,
  useCognitoAuthContext,
} from "@aws-northstar/ui";
import {
  Configuration,
  DefaultApi,
  Middleware,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import { useContext, useMemo } from "react";
import { RuntimeConfigContext } from "../context/RuntimeContext";

const cognitoAuthMiddleware = (
  cognitoContext: CognitoAuthContextAPI,
): Middleware => ({
  pre: async ({ init, url }) => {
    const getToken = () =>
      new Promise<string>((resolve, reject) => {
        try {
          cognitoContext.getAuthenticatedUser!()!.getSession(
            (_: any, session: CognitoUserSession) => {
              resolve(session.getIdToken().getJwtToken());
            },
          );
        } catch (err) {
          reject(err);
        }
      });

    const token = await getToken();

    return {
      url,
      init: {
        ...init,
        headers: {
          ...init.headers,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    };
  },
});

export const useApiClient = () => {
  const cognitoContext = useCognitoAuthContext();
  const runtimeContext = useContext(RuntimeConfigContext);

  const baseUrl = runtimeContext!.apiUrl;

  return useMemo(
    () =>
      new DefaultApi(
        new Configuration({
          basePath: baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl,
          fetchApi: window.fetch.bind(window),
          middleware: [cognitoAuthMiddleware(cognitoContext)],
        }),
      ),
    [baseUrl, cognitoContext],
  );
};
