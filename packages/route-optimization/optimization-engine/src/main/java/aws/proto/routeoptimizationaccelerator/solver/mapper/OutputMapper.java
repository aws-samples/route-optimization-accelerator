/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.solver.mapper;

import aws.proto.routeoptimizationaccelerator.data.output.AssignmentResult;
import aws.proto.routeoptimizationaccelerator.data.output.OptimizationResult;
import aws.proto.routeoptimizationaccelerator.data.output.OrderResult;
import aws.proto.routeoptimizationaccelerator.data.output.ScoreDetails;
import aws.proto.routeoptimizationaccelerator.solver.solution.VehicleRoutingSolution;

import java.time.Duration;

public class OutputMapper {

    public static OptimizationResult convertSolutionToResult(VehicleRoutingSolution solution, Duration solverDuration) {
        AssignmentResult[] assignments = solution.getVehicles()
                .stream()
                .map(t -> AssignmentResult.builder()
                    .fleetId(t.getId())
                    .orders(t.getCustomers().stream().map(o -> OrderResult.builder()
                            .id(o.getId())
                            .arrivalTime(o.getArrivalTime())
                            .build()
                    ).toArray(OrderResult[]::new))
                    .isVirtual(t.isVirtual())
                    .virtualGroupId(t.getVirtualGroupId())
                    .totalTimeDuration(t.getTotalTime())
                    .totalTravelDistance(t.getTotalDrivingDistance())
                    .totalVolume(t.getTotalVolume())
                    .totalWeight(t.getTotalWeight())
                    .departureTime(t.getPreferredDepartureTime())
                    .build()
                ).toArray(AssignmentResult[]::new);

        return OptimizationResult.builder()
                .problemId(solution.getId())
                .assignments(assignments)
                .score(ScoreDetails.builder()
                        .hard(solution.getScore().hardScore())
                        .medium(solution.getScore().mediumScore())
                        .soft(solution.getScore().softScore())
                        .build())
                .solverDuration(solverDuration.toSeconds())
                .build();
    }
}
