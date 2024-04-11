/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import * as als from "aws-cdk-lib/aws-location";
import { Construct } from "constructs";
import { PositionFiltering } from "../common";

export interface TrackersInfo {
  trackerName: string;
  positionFiltering?: PositionFiltering;
}

export interface TrackersProps {
  fleetTracker: TrackersInfo;
  placeTracker: TrackersInfo;
}

export class Tackers extends Construct {
  public readonly fleetTracker: als.CfnTracker;
  public readonly placeTracker: als.CfnTracker;

  constructor(scope: Construct, id: string, props: TrackersProps) {
    super(scope, id);

    const { fleetTracker, placeTracker } = props;

    this.fleetTracker = new als.CfnTracker(this, "FleetTracker", {
      trackerName: fleetTracker.trackerName,
      positionFiltering: fleetTracker.positionFiltering,
    });

    this.placeTracker = new als.CfnTracker(this, "PlaceTracker", {
      trackerName: placeTracker.trackerName,
      positionFiltering: placeTracker.positionFiltering,
    });
  }
}
