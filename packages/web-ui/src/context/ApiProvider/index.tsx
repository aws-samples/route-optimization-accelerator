/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { DefaultApiClientProvider } from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import { useApiClient } from "../../api/WebApi";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: "always",
      refetchOnMount: "always",
      refetchOnReconnect: false,
      retry: false,
      refetchInterval: Infinity,
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  },
});

export const ApiContextProvider: React.FC<any> = ({ children }) => {
  const api = useApiClient();

  return (
    <DefaultApiClientProvider apiClient={api} client={queryClient}>
      {children}
    </DefaultApiClientProvider>
  );
};
