/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.solver.mapper;

import aws.proto.routeoptimizationaccelerator.data.input.ConstraintData;
import aws.proto.routeoptimizationaccelerator.data.input.ConstraintsConfiguration;
import aws.proto.routeoptimizationaccelerator.data.input.enums.DistanceMatrixType;

public class DefaultConfigurationValuesProvider {
    // compute it using road distance with routing engine (ALS)
    public static DistanceMatrixType DISTANCE_MATRIX_TYPE = DistanceMatrixType.ROAD_DISTANCE;

    // no maximum orders by default
    public static Integer MAX_ORDERS = 0;

    // no maximum time by default
    public static Integer MAX_TIME = 0;

    // no maximum distance by default
    public static Integer MAX_DISTANCE = 0;

    // in seconds, define the maximum amount of time to spend to find a solution
    // default 5 minutes
    public static Integer MAX_SOLVER_DURATION = 60 * 5;

    // in seconds, define the maximum time to spend in case the solution
    // cannot be improved. default 10 seconds
    public static Integer MAX_SOLVER_UNIMPROVED_DURATION = 10;

    // no toll avoidance
    public static Boolean AVOID_TOLLS = false;

    // not explained by default
    public static Boolean EXPLAIN = false;

    // back to origin
    public static Boolean BACK_TO_ORIGIN = true;

    // use default weights
    public static ConstraintsConfiguration WEIGHTS = ConstraintsConfiguration.builder()
            .travelTime(ConstraintData.builder().weight(1).build())
            .travelDistance(ConstraintData.builder().weight(1).build())
            .maxDistance(ConstraintData.builder().weight(1).build())
            .maxTime(ConstraintData.builder().weight(1).build())
            .earlyArrival(ConstraintData.builder().weight(1).build())
            .lateArrival(ConstraintData.builder().weight(1).build())
            .lateDeparture(ConstraintData.builder().weight(1).build())
            .orderCount(ConstraintData.builder().weight(1).build())
            .vehicleWeight(ConstraintData.builder().weight(1).build())
            .vehicleVolume(ConstraintData.builder().weight(1).build())
            .virtualVehicle(ConstraintData.builder().weight(1).build())
            .orderRequirements(ConstraintData.builder().weight(1).build())
            .build();
}
