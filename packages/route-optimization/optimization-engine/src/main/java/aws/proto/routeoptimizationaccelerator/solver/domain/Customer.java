/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.solver.domain;

import ai.timefold.solver.core.api.domain.entity.PlanningEntity;
import ai.timefold.solver.core.api.domain.lookup.PlanningId;
import ai.timefold.solver.core.api.domain.variable.InverseRelationShadowVariable;
import ai.timefold.solver.core.api.domain.variable.NextElementShadowVariable;
import ai.timefold.solver.core.api.domain.variable.PreviousElementShadowVariable;
import ai.timefold.solver.core.api.domain.variable.ShadowVariable;
import aws.proto.routeoptimizationaccelerator.solver.solution.ArrivalTimeUpdatingVariableListener;
import lombok.*;
import org.apache.commons.lang3.ObjectUtils;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@PlanningEntity
public class Customer {
    @PlanningId
    private String id;

    // time window from
    private LocalDateTime readyTime;

    // time window to
    private LocalDateTime dueTime;

    // service time
    private Duration serviceDuration;

    // customer location with distance map
    private Visit visit;

    // parcel volume
    private Double volume;

    // parcel weight
    private Double weight;

    // dynamic requirements that has to match the vehicles attributes
    private List<String> requirements;

    // vehicle/member to be used for delivery
    @InverseRelationShadowVariable(sourceVariableName = "customers")
    private Vehicle vehicle;

    @PreviousElementShadowVariable(sourceVariableName = "customers")
    private Customer previousCustomer;

    @NextElementShadowVariable(sourceVariableName = "customers")
    private Customer nextCustomer;

    @ShadowVariable(variableListenerClass = ArrivalTimeUpdatingVariableListener.class, sourceVariableName = "vehicle")
    @ShadowVariable(variableListenerClass = ArrivalTimeUpdatingVariableListener.class, sourceVariableName = "previousCustomer")
    private LocalDateTime arrivalTime;

    public boolean hasVehicles() {
        return this.vehicle != null;
    }

    public LocalDateTime getDepartureTime() {
        if (arrivalTime == null) {
            return null;
        }

        return getStartServiceTime().plus(serviceDuration);
    }

    public LocalDateTime getStartServiceTime() {
        if (arrivalTime == null) {
            return null;
        }

        // if no service window, we just consider the arrival time as good
        if (readyTime == null) {
            return arrivalTime;
        }

        return arrivalTime.isBefore(readyTime) ? readyTime : arrivalTime;
    }

    public Duration getWaitingDuration() {
        if (arrivalTime == null) {
            return Duration.ZERO;
        }

        if (readyTime == null) {
            return Duration.ZERO;
        }

        return arrivalTime.isBefore(readyTime) ? Duration.between(arrivalTime, readyTime) : Duration.ZERO;
    }

    public long getWaitingTime() {
        return this.getWaitingDuration().toMinutes();
    }

    public Duration getLateArrivalExcessDuration() {
        if (arrivalTime == null) {
            return Duration.ZERO;
        }

        if (dueTime == null) {
            return Duration.ZERO;
        }

        return arrivalTime.isAfter(dueTime) ? Duration.between(dueTime, arrivalTime) : Duration.ZERO;
    }

    public long getLateArrivalExcess() {
        return this.getLateArrivalExcessDuration().toMinutes();
    }

    public Duration getLateDepartureExcessDuration() {
        if (arrivalTime == null) {
            return Duration.ZERO;
        }

        if (dueTime == null) {
            return Duration.ZERO;
        }

        LocalDateTime departureTime = this.getDepartureTime();

        return departureTime.isAfter(dueTime) ? Duration.between(dueTime, departureTime) : Duration.ZERO;
    }

    public long getLateDepartureExcess() {
        return this.getLateDepartureExcessDuration().toMinutes();
    }

    public int getMissingRequirementsCount() {
        if (ObjectUtils.isEmpty(this.getRequirements()) || ObjectUtils.isEmpty(this.getVehicle()) || ObjectUtils.isEmpty(this.getVehicle().getAttributes())) {
            return 0;
        }

        return (int) this.getRequirements().stream()
                .filter(requirement -> !this.getVehicle().getAttributes().contains(requirement))
                .count();
    }

    public long getDrivingTimeFromPreviousStandstill() {
        if (vehicle == null) {
            throw new IllegalStateException(
                    "This method must not be called when the shadow variables are not initialized yet.");
        }

        if (previousCustomer == null) {
            return vehicle.getDepot().getTimeTo(visit);
        }

        return previousCustomer.getVisit().getTimeTo(visit);
    }

    public long getDistanceFromPreviousStandstill() {
        if (vehicle == null) {
            throw new IllegalStateException(
                    "This method must not be called when the shadow variables are not initialized yet.");
        }

        if (previousCustomer == null) {
            return vehicle.getDepot().getDistanceTo(visit);
        }

        return previousCustomer.getVisit().getDistanceTo(visit);
    }

}
