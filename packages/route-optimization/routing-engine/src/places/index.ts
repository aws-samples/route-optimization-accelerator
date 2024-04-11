/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { DEFAULT_MAP_PROVIDER } from "@route-optimization-accelerator/infra-common";
import * as als from "aws-cdk-lib/aws-location";
import { Construct } from "constructs";

export interface PlaceIndexesProps {
  placeIndexName: string;
}

export class PlaceIndexes extends Construct {
  public readonly defaultPlaceIndex: als.CfnPlaceIndex;

  constructor(scope: Construct, id: string, props: PlaceIndexesProps) {
    super(scope, id);

    this.defaultPlaceIndex = new als.CfnPlaceIndex(this, "DefaultPlaceIndex", {
      indexName: props.placeIndexName,
      dataSource: DEFAULT_MAP_PROVIDER,
    });
  }
}
