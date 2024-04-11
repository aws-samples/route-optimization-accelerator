/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.solver.domain;

import aws.proto.routeoptimizationaccelerator.common.Location;

import java.time.Duration;
import java.util.Map;

public class Visit extends Location {
    private Map<Visit, Double> drivingDistance;
    private Map<Visit, Duration> drivingDuration;


    public void setDrivingDistanceMap(Map<Visit, Double> distanceMap) {
        this.drivingDistance = distanceMap;
    }

    public long getDistanceTo(Visit location) {
        // convert it in meters
        return (long)(drivingDistance.get(location) * 1000);
    }

    public void setDrivingDurationMap(Map<Visit, Duration> timeMap) {
        this.drivingDuration = timeMap;
    }

    public long getTimeTo(Visit location) {
        return drivingDuration.get(location).toSeconds();
    }

    public Duration getDurationTo(Visit location) {
        return drivingDuration.get(location);
    }

    public static Visit fromLocation(Location l) {
        Visit d = new Visit();

        d.setId(l.getId());
        d.setLongitude(l.getLongitude());
        d.setLatitude(l.getLatitude());

        return d;
    }

}
