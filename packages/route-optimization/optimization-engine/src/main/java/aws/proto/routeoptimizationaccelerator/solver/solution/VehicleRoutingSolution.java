/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.solver.solution;

import ai.timefold.solver.core.api.domain.constraintweight.ConstraintConfigurationProvider;
import ai.timefold.solver.core.api.domain.solution.PlanningEntityCollectionProperty;
import ai.timefold.solver.core.api.domain.solution.PlanningScore;
import ai.timefold.solver.core.api.domain.solution.PlanningSolution;
import ai.timefold.solver.core.api.domain.solution.ProblemFactCollectionProperty;
import ai.timefold.solver.core.api.domain.valuerange.ValueRangeProvider;
import ai.timefold.solver.core.api.score.buildin.hardmediumsoftlong.HardMediumSoftLongScore;
import aws.proto.routeoptimizationaccelerator.solver.constraints.VehicleRoutingConstraintConfiguration;
import aws.proto.routeoptimizationaccelerator.solver.domain.Customer;
import aws.proto.routeoptimizationaccelerator.solver.domain.Depot;
import aws.proto.routeoptimizationaccelerator.solver.domain.Vehicle;
import aws.proto.routeoptimizationaccelerator.solver.domain.Visit;
import lombok.*;

import java.util.List;

@PlanningSolution
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleRoutingSolution {
    private String id;

    @ProblemFactCollectionProperty
    private List<Visit> visits;

    @ProblemFactCollectionProperty
    private List<Depot> depots;

    @PlanningEntityCollectionProperty
    private List<Vehicle> vehicles;

    @ProblemFactCollectionProperty
    @ValueRangeProvider
    private List<Customer> customers;

    @PlanningScore
    private HardMediumSoftLongScore score;

    @ConstraintConfigurationProvider
    private VehicleRoutingConstraintConfiguration constraintConfiguration;

}
