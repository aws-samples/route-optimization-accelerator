/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.solver.geo;

import aws.proto.routeoptimizationaccelerator.aws.LocationHelper;
import aws.proto.routeoptimizationaccelerator.solver.domain.Visit;
import lombok.AllArgsConstructor;
import org.apache.commons.collections4.ListUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@AllArgsConstructor
public class RoadDistance implements DistanceCalculator {
    private static final Logger logger = LogManager.getLogger(RoadDistance.class);

    // maximum matrix distance size for global routing
    // that does not require additional logic to be handled
    private static final int MAX_SUPPORTED_MATRIX_SIZE = 10;

    // if you increase the MAX_SUPPORTED_MATRIX_SIZE more than 10 certain map providers
    // might still execute the request but provide an error on certain items if the
    // routing distance goes beyond a certain number of KMs
    // turn on this flag should you prefer to provide a distance filler
    // and increase the MAX_SUPPORTED_MATRIX_SIZE value to reduce API calls
    // it would work well on local routing use-cases (e.g. last mile)
    // but less ideal for global routing (e.g. mid-mile)
    private static final boolean USE_DISTANCE_FILLER = false;

    private LocationHelper locationHelper;

    @Override
    public DistanceAndTime calculateDistanceAndTime(Visit from, Visit to) {
        LocationHelper.DistanceAndTime result = this.locationHelper.suggestRoute(from, to);

        return new DistanceAndTime(result.distance(), Duration.ofSeconds(result.time().longValue()));
    }

    @Override
    public DistanceAndTimeMap calculateBulkDistanceAndTime(List<Visit> fromLocations, List<Visit> toLocations) {
        // partition the locations based on the supported matrix size
        List<List<Visit>> aPartitions = ListUtils.partition(fromLocations, MAX_SUPPORTED_MATRIX_SIZE);
        List<List<Visit>> bPartitions = ListUtils.partition(toLocations, MAX_SUPPORTED_MATRIX_SIZE);

        Map<Visit, Map<Visit, Double>> distanceMap = new ConcurrentHashMap<>();
        Map<Visit, Map<Visit, Duration>> timeMap = new ConcurrentHashMap<>();

        aPartitions.parallelStream().forEach(a ->
            bPartitions.parallelStream().forEach(b ->
                mergeMaps(distanceMap, timeMap, this.getSupportedDistanceAndTime(a, b))
            )
        );

        return new DistanceAndTimeMap(distanceMap, timeMap);
    }

    private DistanceAndTimeMap getSupportedDistanceAndTime(List<Visit> fromLocations, List<Visit> toLocations) {
        LocationHelper.DistanceAndTimeMatrix response = this.locationHelper.distanceDistanceMatrix(
                fromLocations.stream()
                        .map(t -> Arrays.asList(t.getLongitude(), t.getLatitude()))
                        .collect(Collectors.toList()),
                toLocations.stream()
                        .map(t -> Arrays.asList(t.getLongitude(), t.getLatitude()))
                        .collect(Collectors.toList())
        );
        List<List<Double>> distance = response.distance();
        List<List<Double>> time = response.time();
        Map<Visit, Map<Visit, Double>> distanceMap = new ConcurrentHashMap<>();
        Map<Visit, Map<Visit, Duration>> timeMap = new ConcurrentHashMap<>();

        IntStream.range(0, fromLocations.size()).forEach(i -> {
            Map<Visit, Double> itemDistance = new ConcurrentHashMap<>();
            Map<Visit, Duration> itemTime = new ConcurrentHashMap<>();

            IntStream.range(0, toLocations.size()).forEach(j -> {
                Double dst = distance.get(i).get(j);
                Double tme = time.get(i).get(j);
                Duration drn = Duration.ofSeconds(tme.longValue());

                if (tme == -1.0 && dst == -1.0) {
                    logger.warn("Calculation for route departure={},arrival={} goes in error. Use Distance filler={}",
                            fromLocations.get(i),
                            toLocations.get(j),
                            USE_DISTANCE_FILLER
                    );

                    if (USE_DISTANCE_FILLER) {
                        logger.info("Running distance filler to get individual missing route");
                        LocationHelper.DistanceAndTime distanceAndTime = this.locationHelper.suggestRoute(
                                fromLocations.get(i),
                                toLocations.get(j)
                        );

                        dst = distanceAndTime.distance();
                        drn = Duration.ofSeconds(distanceAndTime.time().longValue());
                    } else {
                        logger.info("Distance filler is not enabled and route is missing, throwing an error");

                        throw new RuntimeException(String.format("Missing routing details from %s to %s", fromLocations.get(i), toLocations.get(j))) ;
                    }
                }

                itemDistance.put(toLocations.get(j), dst);
                itemTime.put(toLocations.get(j), drn);
            });

            distanceMap.put(fromLocations.get(i), itemDistance);
            timeMap.put(fromLocations.get(i), itemTime);
        });

        return new DistanceAndTimeMap(distanceMap, timeMap);
    }

    private void mergeMaps(
            Map<Visit, Map<Visit, Double>> distanceMap,
            Map<Visit, Map<Visit, Duration>> timeMap,
            DistanceAndTimeMap distanceAndTime
    ) {
        Map<Visit, Map<Visit, Double>> currentDistanceMap = distanceAndTime.distanceMap();
        Map<Visit, Map<Visit, Duration>> currentTimeMap = distanceAndTime.timeMap();

        currentDistanceMap.keySet().forEach(q -> {
            if (distanceMap.get(q) != null) {
                distanceMap.get(q).putAll(currentDistanceMap.get(q));
            } else {
                distanceMap.put(q, currentDistanceMap.get(q));
            }
        });

        currentTimeMap.keySet().forEach(q -> {
            if (timeMap.get(q) != null) {
                timeMap.get(q).putAll(currentTimeMap.get(q));
            }else {
                timeMap.put(q, currentTimeMap.get(q));
            }
        });
    }
}
