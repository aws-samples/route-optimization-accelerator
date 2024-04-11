/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React, { useEffect, useState } from "react";
import {
  Optimization,
  OptimizationAssignmentResult,
  OptimizationResult,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import {
  Alert,
  Box,
  Grid,
  SpaceBetween,
  Tiles,
} from "@cloudscape-design/components";
import { ValueWithLabel } from "../../../../components/ValueWithLabel";
import { Duration } from "../../../../components/Duration";
import { NumberFormatter } from "../../../../components/NumberFormatter";
import {
  DateTimeLabel,
  DateTimeLabelMode,
  InitialRelativeMode,
} from "../../../../components/DateTimeLabel";

export interface OptmizationAssignmentsProps {
  isRouteSuccess: boolean;
  isResultError: boolean;
  isResultLoading: boolean;
  optimization?: Optimization;
  optimizationResult?: OptimizationResult;
  selectedAssignmentIndex?: number;
  onSelectionChange?: (index: number, fleetSize: number) => void;
  onAssignmentsResultChange?: (assignmentsCount: number) => void;
  onAssignmentsSelectionChange?: (fleetId: string) => void;
}

const OptmizationAssignments: React.FC<OptmizationAssignmentsProps> = ({
  optimizationResult,
  isResultLoading,
  isResultError,
  isRouteSuccess,
  selectedAssignmentIndex,
  onSelectionChange,
  onAssignmentsResultChange,
  onAssignmentsSelectionChange,
}) => {
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [optimizationResultAssignements, setOptimizationResultAssignements] =
    useState<OptimizationAssignmentResult[]>([]);

  useEffect(() => {
    if (optimizationResult) {
      setOptimizationResultAssignements(
        (optimizationResult.assignments || []).filter(
          (t) => t && t.orders && t.orders.length > 0,
        ),
      );
    }
  }, [optimizationResult]);

  useEffect(() => {
    if (optimizationResultAssignements && onAssignmentsResultChange) {
      onAssignmentsResultChange(optimizationResultAssignements.length);
    }
  }, [optimizationResultAssignements, onAssignmentsResultChange]);

  const onTileSelect = (selectedId: string) => {
    setSelectedAssignment(selectedId);

    if (onSelectionChange) {
      onSelectionChange(
        Number(selectedId),
        optimizationResultAssignements.length,
      );
    }
  };

  useEffect(() => {
    if (selectedAssignmentIndex === -1) {
      setSelectedAssignment("");
    }

    if (
      selectedAssignmentIndex !== undefined &&
      selectedAssignmentIndex < optimizationResultAssignements.length
    ) {
      setSelectedAssignment(selectedAssignmentIndex.toString());
    }
  }, [optimizationResultAssignements, selectedAssignmentIndex]);

  useEffect(() => {
    if (!onAssignmentsSelectionChange) return;

    if (selectedAssignment !== "" && selectedAssignment !== "-1") {
      onAssignmentsSelectionChange(
        optimizationResultAssignements[Number(selectedAssignment)].fleetId,
      );
    } else {
      onAssignmentsSelectionChange("");
    }
  }, [
    selectedAssignment,
    optimizationResultAssignements,
    onAssignmentsSelectionChange,
  ]);

  return (
    <>
      {isRouteSuccess && isResultError && (
        <Alert type="warning">
          Results not available yet. Refresh this page once the optimization
          task is completed
        </Alert>
      )}
      {isResultLoading && (
        <Alert type="info">Loading optimization results</Alert>
      )}
      {optimizationResult && (
        <Tiles
          onChange={({ detail }) => onTileSelect(detail.value)}
          value={selectedAssignment}
          columns={1}
          items={(optimizationResultAssignements || []).map((q, idx) => ({
            value: idx.toString(),
            label: q.fleetId,
            description: (
              <Box>
                <SpaceBetween direction="vertical" size="l">
                  <p hidden>spacing</p>
                  <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                    <ValueWithLabel label="Used capacity">
                      <NumberFormatter
                        value={q.totalWeight}
                        decimalDigits={2}
                      />
                    </ValueWithLabel>
                    <ValueWithLabel label="Used volume">
                      <NumberFormatter
                        value={q.totalVolume}
                        decimalDigits={2}
                      />
                    </ValueWithLabel>
                  </Grid>

                  <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                    <ValueWithLabel label="Total Distance (Km)">
                      <NumberFormatter
                        value={q.totalTravelDistance / 1000}
                        decimalDigits={2}
                      />
                    </ValueWithLabel>
                    <ValueWithLabel label="Total Time">
                      <Duration value={q.totalTimeDuration} unit="seconds" />
                    </ValueWithLabel>
                  </Grid>

                  <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                    <ValueWithLabel label="Departure">
                      <DateTimeLabel
                        timestamp={new Date(q.departureTime).getTime()}
                        mode={DateTimeLabelMode.Relative}
                        initialRelativeMode={InitialRelativeMode.Relative}
                        allowDateFlipping={false}
                      />
                    </ValueWithLabel>

                    <ValueWithLabel label="Orders">
                      {q.orders.length}
                    </ValueWithLabel>
                  </Grid>
                </SpaceBetween>
              </Box>
            ),
          }))}
        />
      )}
    </>
  );
};

export default OptmizationAssignments;
