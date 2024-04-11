/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { Alert } from "@cloudscape-design/components";
import ErrorBoundary from "../ErrorBoundary";
import { Map, MapProps } from ".";

const MapWrapper: React.FC<MapProps> = (props) => {
  return (
    <ErrorBoundary
      fallback={
        <Alert
          statusIconAriaLabel="Error"
          type="error"
          header="Error loading the map"
        >
          Please try reloading the page.
        </Alert>
      }
    >
      <Map {...props} />
    </ErrorBoundary>
  );
};

export default MapWrapper;
