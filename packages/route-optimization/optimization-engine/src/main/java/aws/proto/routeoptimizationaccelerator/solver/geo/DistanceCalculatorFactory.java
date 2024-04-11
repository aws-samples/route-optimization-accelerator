/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.solver.geo;

import aws.proto.routeoptimizationaccelerator.data.input.Configuration;
import aws.proto.routeoptimizationaccelerator.data.input.enums.DistanceMatrixType;
import aws.proto.routeoptimizationaccelerator.aws.LocationHelper;
import aws.proto.routeoptimizationaccelerator.solver.mapper.DefaultConfigurationValuesProvider;
import aws.proto.routeoptimizationaccelerator.utils.EnvVariables;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class DistanceCalculatorFactory {
    private static final Logger logger = LogManager.getLogger(DistanceCalculatorFactory.class);

    public static DistanceCalculator create(Configuration commonConfiguration) {
        DistanceMatrixType defaultDistanceMatrix = DefaultConfigurationValuesProvider.DISTANCE_MATRIX_TYPE;
        Boolean defaultAvoidTolls = DefaultConfigurationValuesProvider.AVOID_TOLLS;

        DistanceMatrixType matrixType = commonConfiguration != null ? ObjectUtils.defaultIfNull(commonConfiguration.getDistanceMatrixType(), defaultDistanceMatrix) : defaultDistanceMatrix;
        boolean avoidTolls = commonConfiguration != null ? ObjectUtils.defaultIfNull(commonConfiguration.getAvoidTolls(), defaultAvoidTolls) : defaultAvoidTolls;

        if (matrixType == DistanceMatrixType.AIR_DISTANCE) {
            logger.info("Creating the HaversineDistance calculator");

            return new HaversineDistance();
        }

        logger.info("Creating the RoadDistance calculator");

        // for road distance we use Amazon Location Service
        return new RoadDistance(
                new LocationHelper(EnvVariables.getRegion(), EnvVariables.getRouteCalculatorName(), avoidTolls)
        );
    }
}
