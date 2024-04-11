/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.solver.geo;

import aws.proto.routeoptimizationaccelerator.common.Position;
import aws.proto.routeoptimizationaccelerator.solver.domain.Visit;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class HaversineDistance implements DistanceCalculator {
    // in Kilometers, refers to the Equatorial radius
    // the earth is not really a sphere
    // sometimes the mean is used as well: 6371.0088
    // for the sake of this approximation we stick to the Equatorial radius
    private static final double EARTH_RADIUS = 6378.1370;
    // avg km/h speed
    private static final double AVG_SPEED_KMH = 60;

    @Override
    public DistanceAndTime calculateDistanceAndTime(Visit from, Visit to) {
        double distanceInKm = this.getHaversineDistance(from, to);
        Duration time = Duration.ofSeconds((long) ((distanceInKm / AVG_SPEED_KMH) * 60 * 60));

        return new DistanceAndTime(distanceInKm, time);
    }

    @Override
    public DistanceAndTimeMap calculateBulkDistanceAndTime(List<Visit> fromLocations, List<Visit> toLocations) {
        Map<Visit, Map<Visit, Double>> distanceMap = new HashMap<>();
        Map<Visit, Map<Visit, Duration>> timeMap = new HashMap<>();

        fromLocations.forEach(from -> {
            Map<Visit, Double> itemDistance = new HashMap<>();
            Map<Visit, Duration> itemTime = new HashMap<>();

            toLocations.forEach(to -> {
                DistanceAndTime distanceAndTime = calculateDistanceAndTime(from, to);

                itemDistance.put(to, distanceAndTime.distance());
                itemTime.put(to, distanceAndTime.time());
            });

            distanceMap.put(from, itemDistance);
            timeMap.put(from, itemTime);
        });

        return new DistanceAndTimeMap(distanceMap, timeMap);
    }

    private double getHaversineDistance(Position from, Position to) {
        if (from.equals(to)) {
            return 0L;
        }
        double p1 = Math.toRadians(from.getLatitude());
        double p2 = Math.toRadians(to.getLatitude());
        double deltaP = Math.toRadians(to.getLatitude() - from.getLatitude());
        double deltaC = Math.toRadians(to.getLongitude() - from.getLongitude());
        double a = (Math.sin(deltaP / 2) * Math.sin(deltaP / 2)) + (Math.cos(p1) * Math.cos(p2) * Math.sin(deltaC / 2) * Math.sin(deltaC / 2));
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return c * EARTH_RADIUS;
    }
}
