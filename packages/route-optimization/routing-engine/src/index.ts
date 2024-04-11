/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { Construct } from "constructs";
import { RoutingMapProps, RoutingMaps } from "./maps";
import { PlaceIndexes, PlaceIndexesProps } from "./places";
import { RouteCalculators, RouteCalculatorsProps } from "./routes";
import { Tackers, TrackersProps } from "./trackers";

export interface RoutingEngineProps {
  map: RoutingMapProps;
  tracker: TrackersProps;
  route: RouteCalculatorsProps;
  placeIndex: PlaceIndexesProps;
}

export class RoutingEngine extends Construct {
  public readonly trackers: Tackers;
  public readonly routeCalculators: RouteCalculators;
  public readonly maps: RoutingMaps;
  public readonly placeIndexes: PlaceIndexes;

  constructor(scope: Construct, id: string, props: RoutingEngineProps) {
    super(scope, id);

    const { map, tracker, route, placeIndex } = props;

    this.maps = new RoutingMaps(this, "map", map);
    this.trackers = new Tackers(this, "tracker", tracker);
    this.routeCalculators = new RouteCalculators(
      this,
      "routeCalculator",
      route,
    );
    this.placeIndexes = new PlaceIndexes(this, "place", placeIndex);
  }
}
