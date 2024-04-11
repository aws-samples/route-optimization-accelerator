/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import * as als from "aws-cdk-lib/aws-location";
import { Construct } from "constructs";

export enum HereMapStyles {
  VectorHereContrast = "VectorHereContrast",
  VectorHereExplore = "VectorHereExplore",
  VectorHereExploreTruck = "VectorHereExploreTruck",
  RasterHereExploreSatellite = "RasterHereExploreSatellite",
  HybridHereExploreSatellite = "HybridHereExploreSatellite",
}

export interface RoutingMapProps {
  mapName: string;
  // use only Here given that is the most flexible for optimization
  mapStyle: HereMapStyles;
}

export class RoutingMaps extends Construct {
  public readonly defaultMap: als.CfnMap;

  constructor(scope: Construct, id: string, props: RoutingMapProps) {
    super(scope, id);

    this.defaultMap = new als.CfnMap(this, "DefaultMap", {
      mapName: props.mapName,
      configuration: {
        style: props.mapStyle,
      },
    });
  }
}
