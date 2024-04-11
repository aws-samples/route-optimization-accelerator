/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.data.input.base;

import aws.proto.routeoptimizationaccelerator.common.Location;
import aws.proto.routeoptimizationaccelerator.data.input.FleetLimits;

import java.time.LocalDateTime;

public interface BaseFleet {
    Location getStartingLocation();

    LocalDateTime getPreferredDepartureTime();

    Boolean getBackToOrigin();

    FleetLimits getLimits();

    String[] getAttributes();
}
