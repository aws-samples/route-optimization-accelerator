/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React, { useEffect, useState } from "react";
import { OptimizationPageWrapper } from "..";
import polyline from "@mapbox/polyline";
import { useParams } from "react-router-dom";
import {
  Optimization,
  OptimizationResult,
  useGetRouteOptimization,
  useGetRouteOptimizationResult,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Header,
  SpaceBetween,
  Spinner,
  Tabs,
} from "@cloudscape-design/components";
import MapWrapper from "../../../components/Map/MapWrapper";
import {
  extractOrderMarkers,
  getOrdersBoundingBoxes,
  getOrdersCentroid,
} from "../../../utils/geo";
import { LineOptions, Marker } from "../../../components/Map";
import "./custom.css";
import OptmizationAssignments from "./OptimizationAssignments";
import OptimizationTaskDetails from "./OptimizationTaskDetails";
import OptimizationOrderDetails from "./OptimizationOrderDetails";
import OptimizationFleetDetails from "./OptimizationFleetDetails";
import { useApiClient } from "../../../api/WebApi";
import { getColorList } from "../../../utils/colors";
import OptmizationAssignmentsStats from "./OptimizationAssignmentsStats";
import { Optional } from "../../../utils/common";
import OptimizationConfiguration from "../../../components/OptimizationConfiguration";

interface RouteData {
  line: number[][];
  orderIdList: string[];
}

const ViewOptimization: React.FC = () => {
  const { id } = useParams();
  const optimizationResponse = useGetRouteOptimization({ id: id! });
  const optimizationResultResponse = useGetRouteOptimizationResult({ id: id! });
  const [optimization, setOptimization] =
    useState<Optional<Optimization>>(undefined);
  const [optimizationResults, setOptimizationResults] =
    useState<Optional<OptimizationResult>>(undefined);
  const [lineOptions, setLineOptions] = useState<LineOptions>();
  const [centroid, setCentroid] = useState<[number?, number?]>([
    undefined,
    undefined,
  ]);
  const [bbox, setBBox] =
    useState<Optional<[[number, number], [number, number]]>>(undefined);
  const [markers, setMarkers] = useState<Optional<Marker[]>>(undefined);
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] =
    useState<number>(-1);
  const [assignmentCount, setAssignmentCount] = useState<number>(
    Number.MAX_VALUE,
  );
  const [selectedAssignmentId, setSelectedAssignmentId] =
    useState<Optional<string>>(undefined);
  const [allRoutes, setAllRoutes] = useState<Optional<RouteData[]>>(undefined);
  const [showMarkers, setShowMarkers] = useState<boolean>(true);
  const [loadingRoutes, setLoadingRoutes] = useState<boolean>(false);
  const webApi = useApiClient();

  useEffect(() => {
    if (!optimizationResponse.isLoading && optimizationResponse.isSuccess) {
      setOptimization(optimizationResponse.data.data);
    }
  }, [optimizationResponse.isLoading]);

  useEffect(() => {
    if (
      !optimizationResultResponse.isLoading &&
      optimizationResultResponse.isSuccess
    ) {
      setOptimizationResults(optimizationResultResponse.data.data);
    }
  }, [optimizationResultResponse.isLoading]);

  const getValidAssignments = () =>
    optimizationResults?.assignments?.filter((q) => q.orders.length > 0);

  useEffect(() => {
    if (optimization && optimizationResults) {
      const processRoutes = async () => {
        const assigments = getValidAssignments();

        if (assigments) {
          setLoadingRoutes(true);
          const assigmentResultDetailsPromises = assigments.map((q) =>
            webApi.getRouteOptimizationAssignmentResult({
              fleetId: q.fleetId,
              id: id!,
            }),
          );
          const results = await Promise.all(assigmentResultDetailsPromises);
          const lineList = results.map((q): RouteData => {
            const line = q.suggestedRoute.legs
              .flatMap((g: any) =>
                g.geometry
                  ? polyline.decode(g.geometry.pathPolyline, 6)
                  : undefined,
              )
              .filter((q: any) => !!q);

            return { line, orderIdList: q.data.orders.map((q) => q.id) };
          });

          setLoadingRoutes(false);
          setAllRoutes(lineList);
        }
      };

      processRoutes();
    }
  }, [id, webApi, optimization, optimizationResults]);

  useEffect(() => {
    if (allRoutes && optimization) {
      let routesToDisplay = allRoutes;
      let colorList = getColorList(allRoutes.length);

      if (selectedAssignmentIndex !== -1) {
        routesToDisplay = [routesToDisplay[selectedAssignmentIndex]];
        colorList = [colorList[selectedAssignmentIndex]];
      } else {
        setCentroid(getOrdersCentroid(optimization.orders));
      }

      const validOrders = routesToDisplay.flatMap((q) =>
        optimization.orders.filter((o) => q.orderIdList.includes(o.id)),
      );
      const markers = routesToDisplay.flatMap((q, idx) => {
        const markerColor = colorList[idx];
        const filteredOrders = optimization.orders.filter((o) =>
          q.orderIdList.includes(o.id),
        );

        return extractOrderMarkers(filteredOrders, markerColor);
      });

      setMarkers(markers);
      setBBox(getOrdersBoundingBoxes(validOrders));
      setLineOptions({
        lineList: routesToDisplay.map((q) => q.line),
        colorList,
      });
    }
  }, [allRoutes, optimization, selectedAssignmentIndex]);

  const nextAssignment = () => {
    setSelectedAssignmentIndex((old) => old + 1);
  };
  const prevAssignment = () => {
    if (selectedAssignmentIndex === -1) {
      setSelectedAssignmentIndex(0);
    }

    if (selectedAssignmentIndex > 0) {
      setSelectedAssignmentIndex((old) => old - 1);
    }
  };

  return (
    <OptimizationPageWrapper isLoading={optimizationResponse.isLoading}>
      <SpaceBetween size="xl">
        <Container>
          <SpaceBetween size="xl">
            <Header>Optimization Details</Header>
            {optimizationResponse.isError && (
              <Alert type="error" dismissible>
                Error loading the results of the optimization task. Please try
                again.
              </Alert>
            )}
            {!optimizationResponse.isError && (
              <Tabs
                tabs={[
                  {
                    id: "one",
                    label: "Task Details",
                    content: (
                      <OptimizationTaskDetails
                        optimization={optimization}
                        optimizationResult={optimizationResults}
                      />
                    ),
                  },
                  {
                    id: "two",
                    label: "Order Details",
                    content: (
                      <OptimizationOrderDetails orders={optimization?.orders} />
                    ),
                  },
                  {
                    id: "three",
                    label: "Fleet Details",
                    content: (
                      <OptimizationFleetDetails
                        fleet={optimization?.fleet}
                        virtualFleet={
                          optimization?.config
                            ? optimization.config.virtualFleet
                            : undefined
                        }
                      ></OptimizationFleetDetails>
                    ),
                  },
                  {
                    id: "forth",
                    label: "Configuration",
                    content: (
                      <OptimizationConfiguration
                        config={optimization?.config}
                      />
                    ),
                  },
                ]}
              />
            )}
          </SpaceBetween>
        </Container>

        <Container
          footer={
            <OptmizationAssignmentsStats
              optimization={optimization}
              optimizationResult={optimizationResults}
            />
          }
        >
          <SpaceBetween size="l">
            <Header
              actions={
                <SpaceBetween size="m" direction="horizontal">
                  <Button
                    variant="primary"
                    disabled={!selectedAssignmentId}
                    onClick={() => {
                      window.open(
                        `${window.location.origin}/optimization/${id}/${selectedAssignmentId}`,
                      );
                    }}
                  >
                    View assignment details
                  </Button>
                  <Button
                    disabled={selectedAssignmentIndex === -1}
                    onClick={() => setSelectedAssignmentIndex(-1)}
                  >
                    Reset selection
                  </Button>
                  <Button
                    disabled={!lineOptions || !lineOptions.lineList.length}
                    iconName={`status-${showMarkers ? "negative" : "positive"}`}
                    onClick={() => setShowMarkers((old) => !old)}
                  >
                    {showMarkers ? "Hide" : "Show"} Markers
                  </Button>
                  <Button
                    variant="icon"
                    iconName="angle-left"
                    disabled={selectedAssignmentIndex === 0}
                    onClick={prevAssignment}
                  ></Button>
                  <Button
                    variant="icon"
                    iconName="angle-right"
                    disabled={selectedAssignmentIndex + 1 >= assignmentCount}
                    onClick={nextAssignment}
                  ></Button>
                </SpaceBetween>
              }
            >
              Optimization Results {loadingRoutes && <Spinner />}
            </Header>
            <Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>
              <Box>
                <MapWrapper
                  lon={centroid[0]}
                  lat={centroid[1]}
                  line={lineOptions}
                  bounds={bbox}
                  markers={showMarkers ? markers : []}
                  style={{ height: "550px" }}
                />
              </Box>
              <Box className="assignments-list">
                <OptmizationAssignments
                  isResultError={optimizationResultResponse.isError}
                  isResultLoading={optimizationResultResponse.isLoading}
                  isRouteSuccess={optimizationResponse.isSuccess}
                  optimizationResult={optimizationResults}
                  selectedAssignmentIndex={selectedAssignmentIndex}
                  onSelectionChange={(idx) => setSelectedAssignmentIndex(idx)}
                  onAssignmentsResultChange={(cnt) => setAssignmentCount(cnt)}
                  onAssignmentsSelectionChange={(fleetId) =>
                    setSelectedAssignmentId(fleetId)
                  }
                />
              </Box>
            </Grid>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </OptimizationPageWrapper>
  );
};

export default ViewOptimization;
