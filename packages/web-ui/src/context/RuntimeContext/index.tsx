/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import ErrorMessage from "@aws-northstar/ui/components/CognitoAuth/components/ErrorMessage";
import React, { createContext, useEffect, useState } from "react";
import { Optional } from "../../utils/common";

export interface RuntimeContext {
  readonly region: string;
  readonly userPoolId: string;
  readonly userPoolWebClientId: string;
  readonly identityPoolId: string;
  readonly apiUrl: string;
  readonly map: string;
  readonly calculator: string;
  readonly tracker: string;
  readonly placeIndex: string;
  readonly placeIndexLanguage: string;
  readonly defaultMapCenter: [number, number];
}

/**
 * Context for storing the runtimeContext.
 */
export const RuntimeConfigContext =
  createContext<Optional<RuntimeContext>>(undefined);

const RuntimeContextProvider: React.FC<any> = ({ children }) => {
  const [runtimeContext, setRuntimeContext] =
    useState<Optional<RuntimeContext>>();
  const [error, setError] = useState<Optional<string>>();

  useEffect(() => {
    fetch("/runtime-config.json")
      .then((response) => {
        return response.json();
      })
      .then((runtimeCtx) => {
        if (
          runtimeCtx.region &&
          runtimeCtx.userPoolId &&
          runtimeCtx.userPoolWebClientId &&
          runtimeCtx.identityPoolId &&
          runtimeCtx.apiUrl
        ) {
          setRuntimeContext(runtimeCtx as RuntimeContext);
        } else {
          setError(
            "runtime-config.json should have region, userPoolId, userPoolWebClientId, identityPoolId & apiUrl.",
          );
        }
      })
      .catch(() => {
        setError("No runtime-config.json detected");
      });
  }, [setRuntimeContext]);

  return error ? (
    <ErrorMessage>{error}</ErrorMessage>
  ) : (
    <RuntimeConfigContext.Provider value={runtimeContext}>
      {children}
    </RuntimeConfigContext.Provider>
  );
};

export default RuntimeContextProvider;
