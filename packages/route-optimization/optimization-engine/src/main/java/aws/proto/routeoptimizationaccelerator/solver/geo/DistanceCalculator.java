/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.solver.geo;

import aws.proto.routeoptimizationaccelerator.solver.domain.Visit;

import java.time.Duration;
import java.util.List;
import java.util.Map;

public interface DistanceCalculator {
    DistanceAndTime calculateDistanceAndTime(Visit from, Visit to);

    DistanceAndTimeMap calculateBulkDistanceAndTime(List<Visit> fromLocations, List<Visit> toLocations);

    default void initDistanceAndTimeMaps(List<Visit> locationList) {
        DistanceAndTimeMap distanceAndTimeMatrix = this.calculateBulkDistanceAndTime(locationList, locationList);

        locationList.forEach(location -> {
            location.setDrivingDistanceMap(distanceAndTimeMatrix.distanceMap.get(location));
            location.setDrivingDurationMap(distanceAndTimeMatrix.timeMap.get(location));
        });
    }

    record DistanceAndTime(double distance, Duration time) { }

    record DistanceAndTimeMap(Map<Visit, Map<Visit, Double>> distanceMap, Map<Visit, Map<Visit, Duration>> timeMap) { }
}
