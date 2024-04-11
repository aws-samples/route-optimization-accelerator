/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  Button,
  Container,
  FormField,
  Grid,
  Header,
  SegmentedControl,
  Select,
  SpaceBetween,
} from "@cloudscape-design/components";
import React, { useCallback, useEffect, useState } from "react";
import { FleetFinder } from "../../../../components/FleetFinder";
import { Optional } from "../../../../utils/common";
import {
  Fleet,
  OptimizationConfiguration,
  OptimizationFleetDetail,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import AlertWrapper from "../../../../components/AlertWrapper";
import FleetReview from "../FleetReview";
import { MODE_CONFIGURATION } from "..";
import CodeEditorWrapper from "../../../../components/CodeEditorWrapper";
import { EXAMPLES } from "../request-examples";

export interface FleetSelectionProps {
  fleet?: OptimizationFleetDetail[];
  onChange?: (fleet: OptimizationFleetDetail[]) => void;
  onConfigChange?: (config?: OptimizationConfiguration) => void;
}

const FleetSelection: React.FC<FleetSelectionProps> = ({
  fleet,
  onChange,
  onConfigChange,
}) => {
  const [selectedOption, setSelectedOption] = useState<any>();
  const [selectedView, setSelectedView] = useState(MODE_CONFIGURATION.assisted);
  const [currentFleet, setCurrentFleet] = useState<Optional<Fleet>>();
  const [optimizationFleet, setOptimizationFleet] =
    useState<Optional<OptimizationFleetDetail[]>>(fleet);
  const [configuration, setConfiguration] =
    useState<Optional<OptimizationConfiguration>>();

  const mapFleetToOptimizationFleet = (
    fleet: Fleet,
  ): OptimizationFleetDetail => ({
    id: fleet.id,
    startingLocation: fleet.startingLocation,
    attributes: fleet.attributes,
    backToOrigin: fleet.backToOrigin,
    limits: fleet.limits,
    preferredDepartureTime: fleet.preferredDepartureTime,
  });

  const addToOptimizationFleet = () => {
    if (currentFleet) {
      if (optimizationFleet?.find((q) => currentFleet.id === q.id)) {
        return;
      }

      const mappedFleet = mapFleetToOptimizationFleet(currentFleet);
      setOptimizationFleet((old) =>
        old ? [...old, mappedFleet] : [mappedFleet],
      );
    }
  };

  const removeOptimizationFleet = (id: string) => {
    if (optimizationFleet) {
      const oFleet = [...optimizationFleet];
      oFleet.splice(
        oFleet.findIndex((q) => q.id === id),
        1,
      );

      setOptimizationFleet(oFleet);
    }
  };

  useEffect(() => {
    if (onChange) {
      onChange(optimizationFleet ?? []);
    }
  }, [onChange, optimizationFleet]);

  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(configuration);
    }
  }, [onConfigChange, configuration]);

  const importFleetFromCode = useCallback((code: string) => {
    try {
      const parsedFleet = JSON.parse(code);
      setOptimizationFleet(parsedFleet);
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (selectedOption && selectedOption.value) {
      const item = EXAMPLES[selectedOption.value].value;

      setOptimizationFleet(item.fleet!);
      setConfiguration(item.config);
    }
  }, [selectedOption]);

  return (
    <Container header={<Header variant="h3">Add Fleet</Header>}>
      <SpaceBetween size="l">
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 3 }]}>
          <FleetFinder onSelect={setCurrentFleet} />
          <Button onClick={addToOptimizationFleet}>Add</Button>
        </Grid>
        <Header
          actions={
            <SegmentedControl
              selectedId={selectedView}
              onChange={({ detail }) => setSelectedView(detail.selectedId)}
              label="Select the "
              options={MODE_CONFIGURATION.options}
            />
          }
        >
          Selected Fleet
        </Header>
        {(!optimizationFleet || optimizationFleet.length === 0) && (
          <AlertWrapper
            alert={{
              type: "info",
              message:
                "Select a fleet member from the dropdown to add it to the list",
            }}
          />
        )}
        {selectedView === MODE_CONFIGURATION.assisted && (
          <FleetReview
            optimizationFleet={optimizationFleet}
            allowCancellation
            onCancel={(idx) => removeOptimizationFleet(idx)}
          />
        )}
        {selectedView === MODE_CONFIGURATION.code && (
          <SpaceBetween size="m">
            <FormField
              label="Select a sample payload to replace the existing one"
              constraintText="Make sure the same selection will be applied also on the next steps, this will guarantee to apply the right orders for this fleet"
              stretch
            >
              <Select
                selectedOption={selectedOption}
                onChange={({ detail }) =>
                  setSelectedOption(detail.selectedOption)
                }
                options={Object.keys(EXAMPLES).map((v) => ({
                  label: EXAMPLES[v].description,
                  value: v,
                }))}
                filteringType="auto"
              />
            </FormField>
            <CodeEditorWrapper
              code={JSON.stringify(optimizationFleet, null, 2)}
              onCodeChange={importFleetFromCode}
            />
          </SpaceBetween>
        )}
      </SpaceBetween>
    </Container>
  );
};

export default FleetSelection;
