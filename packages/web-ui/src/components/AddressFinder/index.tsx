/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { useCognitoAuthContext } from "@aws-northstar/ui";
import { Autosuggest, SpaceBetween } from "@cloudscape-design/components";
import { useContext, useEffect, useState } from "react";
import MapWrapper from "../Map/MapWrapper";
import {
  getCognitoCredentials,
  getCognitoSessionFromContext,
} from "../../utils/cognito";
import { useDebounce } from "../../hooks/use-debounce";
import { RuntimeConfigContext } from "../../context/RuntimeContext";
import {
  GetPlaceCommand,
  LocationClient,
  SearchPlaceIndexForSuggestionsCommand,
} from "@aws-sdk/client-location";

export interface AddressInformation {
  municipality?: string;
  country?: string;
  label: string;
  postalCode?: string;
  lat?: number;
  lon?: number;
}

export interface AddressFinderProps {
  value: string;
  lat?: number;
  lon?: number;
  onChange?: (addressInformation?: AddressInformation) => void;
}

const AddressFinder: React.FC<AddressFinderProps> = ({
  value,
  lat,
  lon,
  onChange,
}) => {
  const [state, setState] = useState<string>(value || "");
  const [options, setOptions] = useState<any>([]);
  const [selectedOption, setSelectedOption] = useState<any>();
  const [client, setClient] = useState<LocationClient>();
  const [addressInformation, setAddressInformation] =
    useState<AddressInformation>();
  const debouncedState = useDebounce(state, 300);
  const runtimeContext = useContext(RuntimeConfigContext);
  const cognitoContext = useCognitoAuthContext();

  useEffect(() => {
    setState(value);
    setAddressInformation({
      label: value,
      lon: lon,
      lat: lat,
    });
  }, [value, lat, lon]);

  useEffect(() => {
    if (onChange) {
      onChange(addressInformation || undefined);
    }
  }, [addressInformation]);

  useEffect(() => {
    (async () => {
      if (client && selectedOption) {
        const data = await client.send(
          new GetPlaceCommand({
            IndexName: runtimeContext!.placeIndex!,
            Language: runtimeContext!.placeIndexLanguage,
            PlaceId: selectedOption.value,
          }),
        );

        setAddressInformation({
          lat: data.Place!.Geometry!.Point![1],
          lon: data.Place!.Geometry!.Point![0],
          country: data.Place!.Country!,
          label: data.Place!.Label!,
          municipality: data.Place!.Municipality!,
          postalCode: data.Place!.PostalCode!,
        });
      }
    })();
  }, [selectedOption]);

  useEffect(() => {
    if (!state) {
      setSelectedOption(undefined);
      setOptions([]);
    } else {
      setAddressInformation((old) => ({ ...old, label: state }));
    }
  }, [state]);

  useEffect(() => {
    async function init() {
      try {
        const session = await getCognitoSessionFromContext(cognitoContext);
        const credentials = await getCognitoCredentials(
          session,
          runtimeContext!.region,
          runtimeContext!.identityPoolId,
          runtimeContext!.userPoolId,
        );

        const client = new LocationClient({
          credentials,
          region: runtimeContext!.region,
        });

        setClient(client);
      } catch (err) {
        console.error(err);
      }
    }

    init();
  }, [cognitoContext, runtimeContext]);

  useEffect(() => {
    const getSuggestions = async () => {
      const data = await client!.send(
        new SearchPlaceIndexForSuggestionsCommand({
          IndexName: runtimeContext!.placeIndex!,
          Language: runtimeContext!.placeIndexLanguage,
          Text: state,
          MaxResults: 15,
        }),
      );

      setOptions(
        data
          .Results!.filter((q) => q.PlaceId)
          .map((q) => ({
            value: q.PlaceId!,
            label: q.Text,
          })),
      );
    };

    if (
      client &&
      debouncedState &&
      debouncedState.length >= 3 &&
      debouncedState.length < 100
    ) {
      getSuggestions();
    }
  }, [runtimeContext, debouncedState]);

  return (
    <SpaceBetween direction="vertical" size="l">
      <Autosuggest
        value={selectedOption && state ? selectedOption.label : state}
        options={options}
        onSelect={({ detail }) => {
          if (!detail.selectedOption) return;

          setSelectedOption({
            value: detail.selectedOption.value,
            label: detail.selectedOption.label,
          });
        }}
        enteredTextLabel={(value) => `Use: "${value}"`}
        ariaLabel="Address auto suggest"
        placeholder="Enter an address"
        empty="No matches found"
        onChange={({ detail }) => setState(detail.value)}
      />
      <MapWrapper
        lat={addressInformation?.lat}
        lon={addressInformation?.lon}
        zoom={11}
        markers={
          addressInformation?.lon && addressInformation?.lat
            ? [[addressInformation?.lon, addressInformation?.lat]]
            : undefined
        }
        style={{ height: "450px" }}
      />
    </SpaceBetween>
  );
};

export default AddressFinder;
