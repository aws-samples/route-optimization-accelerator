/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React, { useEffect, useState } from "react";
import { OptimizationPageWrapper } from "..";
import { useParams } from "react-router-dom";
import polyline from "@mapbox/polyline";
import {
  GetRouteOptimizationAssignmentResultResponseContent,
  Optimization,
  OptimizationFleetDetail,
  OptimizationResult,
  useGetRouteOptimization,
  useGetRouteOptimizationAssignmentResult,
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
} from "@cloudscape-design/components";
import MapWrapper from "../../../components/Map/MapWrapper";
import { Optional, deepEquals } from "../../../utils/common";
import { LineOptions, Marker } from "../../../components/Map";
import AssignementOrderList from "./AssignementOrderList";
import "./custom.css";
import {
  extractOrderMarkers,
  getOrdersBoundingBoxes,
  getOrdersCentroid,
} from "../../../utils/geo";
import { COLOR_PALETTE } from "../../../utils/colors";
import AssignmentAdditionalDetail from "./AssignmentAdditionalDetail";
import AssignementOrderTable from "./AssignementOrderTable";
import { DEFAULT_CONFIG } from "../../../components/OptimizationConfiguration";

const OptimizationDetail: React.FC = () => {
  const { id, fleetId } = useParams();
  const [centroid, setCentroid] = useState<[number?, number?]>([
    undefined,
    undefined,
  ]);
  const [bbox, setBBox] =
    useState<Optional<[[number, number], [number, number]]>>(undefined);
  const [markers, setMarkers] = useState<Optional<Marker[]>>(undefined);
  const [lineOptions, setLineOptions] = useState<LineOptions>();
  const optimizationResponse = useGetRouteOptimization({ id: id! });
  const optimizationResultResponse = useGetRouteOptimizationResult({ id: id! });
  const [selectedOrderIndex, setSelectedOrderIndex] = useState<number>(-1);
  const [selectionCount, setSelectionCount] = useState<number>(0);
  const [, setSelectedOrderId] = useState<Optional<string>>(undefined);
  const optimizationAssignmentResultResponse =
    useGetRouteOptimizationAssignmentResult({
      id: id!,
      fleetId: fleetId!,
    });
  const [optimization, setOptimization] =
    useState<Optional<Optimization>>(undefined);
  const [, setOptimizationResults] =
    useState<Optional<OptimizationResult>>(undefined);
  const [optimizationAssignmentResults, setOptimizationAssignmentResults] =
    useState<Optional<GetRouteOptimizationAssignmentResultResponseContent>>(
      undefined,
    );
  const [vehicle, setVehicle] = useState<Optional<OptimizationFleetDetail>>();

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

  useEffect(() => {
    if (
      !optimizationAssignmentResultResponse.isLoading &&
      optimizationAssignmentResultResponse.isSuccess
    ) {
      setOptimizationAssignmentResults(
        optimizationAssignmentResultResponse.data,
      );
    }
  }, [optimizationAssignmentResultResponse.isLoading]);

  useEffect(() => {
    if (optimizationAssignmentResults && optimization) {
      setVehicle(
        optimization.fleet.find(
          (q) => q.id === optimizationAssignmentResults.data.fleetId,
        ),
      );
    }
  }, [optimizationAssignmentResults, optimization]);

  useEffect(() => {
    if (optimizationAssignmentResults && optimization) {
      const legs = optimizationAssignmentResults.suggestedRoute.legs;
      const legGeometry = legs
        .map((q: any) =>
          q.geometry ? polyline.decode(q.geometry.pathPolyline, 6) : undefined,
        )
        .filter((q: any) => !!q);

      const orderIdList = optimizationAssignmentResults.data.orders.map(
        (q) => q.id,
      );
      const orders = optimization.orders.filter((q) =>
        orderIdList.includes(q.id),
      );
      const isUnselected = selectedOrderIndex === -1;
      const firstLeg = legs[selectedOrderIndex];
      const lastLeg = legs[selectedOrderIndex];

      setBBox(
        isUnselected
          ? getOrdersBoundingBoxes(orders)
          : [
              firstLeg.startPosition,
              deepEquals(firstLeg.startPosition, lastLeg.endPosition)
                ? lastLeg.startPosition
                : lastLeg.endPosition,
            ],
      );
      setCentroid(getOrdersCentroid(orders));
      setMarkers(extractOrderMarkers(orders, COLOR_PALETTE[0]));
      setLineOptions({
        lineList: [
          isUnselected
            ? legGeometry.flatMap((q: any) => q)
            : legGeometry[selectedOrderIndex],
        ],
      });
    }
  }, [optimizationAssignmentResults, selectedOrderIndex, optimization]);

  const nextOrder = () => {
    setSelectedOrderIndex((old) => old + 1);
  };
  const prevOrder = () => {
    if (selectedOrderIndex === -1) {
      setSelectedOrderIndex(0);
    }

    if (selectedOrderIndex > 0) {
      setSelectedOrderIndex((old) => old - 1);
    }
  };

  return (
    <OptimizationPageWrapper
      isLoading={
        optimizationResponse.isLoading ||
        optimizationResultResponse.isLoading ||
        optimizationAssignmentResultResponse.isLoading
      }
    >
      <SpaceBetween size="xl">
        <Container
          footer={
            <AssignmentAdditionalDetail
              assignmentResult={optimizationAssignmentResults?.data}
              optimizationOrders={optimization?.orders}
              optimizationFleet={optimization?.fleet}
              config={optimization?.config}
            />
          }
        >
          <SpaceBetween size="xl">
            <Header
              actions={
                <SpaceBetween size="m" direction="horizontal">
                  <Button
                    disabled={selectedOrderIndex === -1}
                    onClick={() => setSelectedOrderIndex(-1)}
                  >
                    Reset selection
                  </Button>
                  <Button
                    variant="icon"
                    iconName="angle-left"
                    disabled={selectedOrderIndex === 0}
                    onClick={prevOrder}
                  ></Button>
                  <Button
                    variant="icon"
                    iconName="angle-right"
                    disabled={selectedOrderIndex + 1 >= selectionCount}
                    onClick={nextOrder}
                  ></Button>
                </SpaceBetween>
              }
            >
              Assignment Details
            </Header>

            {optimizationResponse.isError ||
            optimizationResultResponse.isError ||
            optimizationAssignmentResultResponse.isError ? (
              <Alert type="error">
                Unable to load the requested assignment
              </Alert>
            ) : (
              <Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>
                <Box>
                  <MapWrapper
                    lon={centroid[0]}
                    lat={centroid[1]}
                    line={lineOptions}
                    bounds={bbox}
                    markers={markers}
                    style={{ height: "550px" }}
                  />
                </Box>
                <Box className="order-list">
                  <AssignementOrderList
                    assignedOrders={optimizationAssignmentResults?.data.orders}
                    optimizationOrders={optimization?.orders}
                    routeBack={
                      vehicle?.backToOrigin !== undefined
                        ? vehicle?.backToOrigin
                        : DEFAULT_CONFIG.backToOrigin!
                    }
                    selectedOrderIndex={selectedOrderIndex}
                    onSelectionChange={(idx) => setSelectedOrderIndex(idx)}
                    onOrderResultChange={(cnt) => setSelectionCount(cnt)}
                    onOrderSelectionChange={(orderId) =>
                      setSelectedOrderId(orderId)
                    }
                  />
                </Box>
              </Grid>
            )}
          </SpaceBetween>
        </Container>

        <Container>
          <AssignementOrderTable
            assignedOrders={optimizationAssignmentResults?.data.orders}
            optimizationOrders={optimization?.orders}
            suggestedRoute={optimizationAssignmentResults?.suggestedRoute}
          />
        </Container>
      </SpaceBetween>
    </OptimizationPageWrapper>
  );
};

export default OptimizationDetail;
