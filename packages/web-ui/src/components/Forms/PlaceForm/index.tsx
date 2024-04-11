/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  Button,
  SpaceBetween,
  Form,
  Grid,
  FormField,
  Input,
  Select,
} from "@cloudscape-design/components";
import {
  Place,
  PlaceType,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import React, { useEffect, useState } from "react";
import { capitalizeFirstLetter } from "../../../utils/common";
import AddressFinder from "../../AddressFinder";

export interface PlaceFormProps {
  place?: Place;
  editMode?: boolean;
  onSave: (data: Place) => void;
}

export const PlaceForm: React.FC<PlaceFormProps> = ({ place, onSave }) => {
  const [state, setState] = useState<Place>({} as Place);

  useEffect(() => {
    setState(place || ({ isActive: "Y" } as Place));
  }, [place]);

  const getPlaceTypes = (): { value: PlaceType; label: string }[] => [
    { value: "DEPOT", label: "Depot" },
    { value: "LOCATION", label: "Location" },
  ];

  const saveAction = () => {
    onSave(state!);
  };

  return (
    <Form
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button variant="primary" onClick={saveAction}>
            Save
          </Button>
        </SpaceBetween>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
          <FormField
            label="Name"
            description="The name of the place (e.g. Seattle Depot)"
          >
            <Input
              value={state!.name}
              onChange={({ detail }) =>
                setState((old) => ({ ...old, name: detail.value }))
              }
              placeholder="Name"
            />
          </FormField>

          <FormField label="Type" description="Select the place type">
            <Select
              selectedOption={{
                value: state.type,
                label: state.type
                  ? capitalizeFirstLetter(state.type.toLocaleLowerCase())
                  : "",
              }}
              onChange={({ detail }) =>
                setState((old) => ({
                  ...old,
                  type: detail.selectedOption.value! as PlaceType,
                }))
              }
              options={getPlaceTypes()}
            />
          </FormField>
        </Grid>
        <Grid gridDefinition={[{ colspan: 12 }]}>
          <FormField
            label="Address"
            description="Type the address of the place"
            stretch
          >
            <AddressFinder
              value={state!.address}
              lat={(state!.position || {}).latitude}
              lon={(state!.position || {}).longitude}
              onChange={(selectedAddress) => {
                if (
                  selectedAddress &&
                  selectedAddress.label &&
                  selectedAddress.lat &&
                  selectedAddress.lon
                )
                  setState((old) => ({
                    ...old,
                    address: selectedAddress.label,
                    position: {
                      latitude: selectedAddress.lat!,
                      longitude: selectedAddress.lon!,
                    },
                  }));
              }}
            />
          </FormField>
        </Grid>
      </SpaceBetween>
    </Form>
  );
};

export default PlaceForm;
