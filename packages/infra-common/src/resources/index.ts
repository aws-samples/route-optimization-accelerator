/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import * as events from "aws-cdk-lib/aws-events";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { Bucket } from "../constructs";

export interface CommonResourcesProps {
  eventBusName?: string;
}

export class CommonResources extends Construct {
  public readonly accessLogsBucket: s3.IBucket;
  public readonly bus: events.EventBus;

  constructor(scope: Construct, id: string, props: CommonResourcesProps) {
    super(scope, id);

    const { eventBusName } = props;
    this.accessLogsBucket = new Bucket(this, "AccessLogsBucket", {
      accessControl: s3.BucketAccessControl.LOG_DELIVERY_WRITE,
    });

    this.bus = new events.EventBus(this, "ProtoEventBus", {
      eventBusName,
    });
  }
}
