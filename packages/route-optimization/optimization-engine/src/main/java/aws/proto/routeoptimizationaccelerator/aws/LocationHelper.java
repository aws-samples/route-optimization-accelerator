/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.aws;

import aws.proto.routeoptimizationaccelerator.common.Position;
import org.apache.commons.lang3.concurrent.TimedSemaphore;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.location.LocationClient;
import software.amazon.awssdk.services.location.model.*;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class LocationHelper {
    /*
        TODO:
         those limits below are referred to the default TPS for Amazon Location Service
         the value could be adjusted based on your AWS Account quota.
         More information: https://docs.aws.amazon.com/general/latest/gr/location.html
    */
    private final TimedSemaphore matrixSemaphore = new TimedSemaphore(1, TimeUnit.SECONDS, 5);
    private final TimedSemaphore routeSemaphore = new TimedSemaphore(1, TimeUnit.SECONDS, 10);
    private static final Logger logger = LogManager.getLogger(LocationHelper.class);

    private final LocationClient locationClient;
    private final String calculatorName;
    private final Boolean avoidTolls;

    public LocationHelper(String region, String calculatorName, boolean avoidTools) {
        this.avoidTolls = avoidTools;
        this.calculatorName = calculatorName;
        this.locationClient = LocationClient.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    public record DistanceAndTime(Double distance, Double time) {}
    public record DistanceAndTimeMatrix(List<List<Double>> distance, List<List<Double>> time) {}

    public DistanceAndTime suggestRoute(Position origin, Position destination) {
        try {
            routeSemaphore.acquire();
            CalculateRouteRequest request = CalculateRouteRequest.builder()
                    .departurePosition(origin.getLongitude(), origin.getLatitude())
                    .destinationPosition(destination.getLongitude(), destination.getLatitude())
                    .calculatorName(this.calculatorName)
                    .travelMode(TravelMode.CAR)
                    .carModeOptions(CalculateRouteCarModeOptions.builder()
                            .avoidTolls(this.avoidTolls)
                            .avoidFerries(true)
                            .build()
                    )
                    // TODO: departure time?
                    .distanceUnit("Kilometers")
                    .build();
            CalculateRouteResponse response = this.locationClient.calculateRoute(request);

            return new DistanceAndTime(response.summary().distance(), response.summary().durationSeconds());
        }
        catch (InterruptedException ex) {
            logger.error("InterruptedException on suggest route: ", ex);

            // this shouldn't happen
            return null;
        }
    }

    public DistanceAndTimeMatrix distanceDistanceMatrix(Collection<Collection<Double>> departingPositions, Collection<Collection<Double>> arrivalPositions) {
        try {
            matrixSemaphore.acquire();
            CalculateRouteMatrixRequest request = CalculateRouteMatrixRequest.builder()
                    .calculatorName(this.calculatorName)
                    .departurePositions(departingPositions)
                    .destinationPositions(arrivalPositions)
                    .travelMode(TravelMode.CAR)
                    .carModeOptions(CalculateRouteCarModeOptions.builder()
                            .avoidTolls(this.avoidTolls)
                            .avoidFerries(true)
                            .build()
                    )
                    .distanceUnit("Kilometers")
                    .build();
            CalculateRouteMatrixResponse response = this.locationClient.calculateRouteMatrix(request);
            List<List<Double>> distance = new ArrayList<>();
            List<List<Double>> time = new ArrayList<>();

            response.routeMatrix().forEach(t -> {
                List<Double> itemDistance = new ArrayList<>();
                List<Double> itemTime = new ArrayList<>();

                t.forEach(q -> {
                    if (q.error() != null) {
                        logger.debug("Could not calculate the distance/time matrix correctly for an element; {}", q.error());
                        // highlight the distances that weren't calculated correctly due high
                        itemDistance.add(-1.0);
                        itemTime.add(-1.0);
                    } else {
                        itemDistance.add(q.distance());
                        itemTime.add(q.durationSeconds());
                    }
                });

                distance.add(itemDistance);
                time.add(itemTime);
            });

            return new DistanceAndTimeMatrix(distance, time);
        } catch (InterruptedException ex) {
            logger.error("InterruptedException on distance matrix: ", ex);

            // this shouldn't happen
            return null;
        } catch (Exception ex) {
            logger.error("Error running the distance matrix: ", ex);

            throw ex;
        }
    }

}
