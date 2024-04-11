/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { useEffect, useState } from "react";
import MapWrapper from "../Map/MapWrapper";
import { Optional } from "../../utils/common";
import { useDebounce } from "../../hooks/use-debounce";
import { Marker, MarkerOptions } from "../Map";

interface RequiredProps {
  position: number[];
}

interface BaseOutput<T extends RequiredProps> {
  data: T[];
}

export interface CommonMapProps<
  T extends RequiredProps,
  Q extends BaseOutput<T>,
> {
  fetchFunction: (bounds: maplibregl.LngLatBounds) => Promise<Q>;
  displayData: (data: T) => Optional<MarkerOptions>;
  onOutOfBound?: (out: boolean) => void;
}

const CommonMap = <T extends RequiredProps, Q extends BaseOutput<T>>({
  fetchFunction,
  onOutOfBound,
  displayData,
}: CommonMapProps<T, Q>) => {
  const [markers, setMarkers] = useState<Optional<Marker[]>>();
  const [bounds, setBounds] = useState<maplibregl.LngLatBounds>();
  const debouncedState = useDebounce(bounds, 500);

  const isOutOfBound = (bounds: maplibregl.LngLatBounds) => {
    const positions = [
      ...bounds.getSouthWest().toArray(),
      ...bounds.getSouthEast().toArray(),
      ...bounds.getNorthEast().toArray(),
      ...bounds.getNorthWest().toArray(),
    ];

    return positions.some((q) => q > 180 || q < -180);
  };

  useEffect(() => {
    if (fetchFunction && debouncedState && !isOutOfBound(debouncedState)) {
      const load = async () => {
        const response = await fetchFunction(debouncedState);

        setMarkers(
          response.data.map((q) => [
            q.position[0],
            q.position[1],
            displayData(q),
          ]),
        );
      };

      load();
    }
  }, [fetchFunction, displayData, debouncedState]);

  const onBoundChange = async (
    _: maplibregl.Map,
    bounds: maplibregl.LngLatBounds,
  ) => {
    if (onOutOfBound) {
      onOutOfBound(isOutOfBound(bounds));
    }

    setBounds(bounds);
  };

  return (
    <MapWrapper
      markers={markers}
      onDrag={onBoundChange}
      onZoom={onBoundChange}
    />
  );
};

export default CommonMap;
