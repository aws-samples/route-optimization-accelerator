/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import type { OptimizationOrderDetail } from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import * as turf from "@turf/turf";
import { Marker } from "../components/Map";
import { getColorList } from "./colors";

export const getOrdersCentroid = (
  orders: OptimizationOrderDetail[],
): [number, number] => {
  const lonLatCollection = orders.map((t) => [
    t.destination.longitude,
    t.destination.latitude,
  ]);
  const points = turf.points(lonLatCollection);
  const coordinates = turf.centroid(points).geometry.coordinates;

  return [coordinates[0], coordinates[1]];
};

export const getOrdersBoundingBoxes = (
  orders: OptimizationOrderDetail[],
): [[number, number], [number, number]] => {
  const lonLatCollection = orders.flatMap((t) => [
    [t.destination.longitude, t.destination.latitude],
    [t.origin.longitude, t.origin.latitude],
  ]);
  const points = turf.lineString(lonLatCollection);
  const bbox = turf.bbox(points);

  return [
    [bbox[0], bbox[1]],
    [bbox[2], bbox[3]],
  ];
};

export const extractOrderMarkers = (
  orders: OptimizationOrderDetail[],
  color?: string,
): Marker[] => {
  const colors = getColorList(orders.length);

  return orders.flatMap((order, idx) => [
    [
      order.origin.longitude,
      order.origin.latitude,
      {
        color: "red",
        popupContent: <p>Depot</p>,
      },
    ] as Marker,
    [
      order.destination.longitude,
      order.destination.latitude,
      {
        color: color || colors[idx],
        popupContent: <p>{order.id}</p>,
      },
    ],
  ]);
};
