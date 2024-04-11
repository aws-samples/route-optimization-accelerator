/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.solver.domain;

import ai.timefold.solver.core.api.domain.entity.PlanningEntity;
import ai.timefold.solver.core.api.domain.lookup.PlanningId;
import ai.timefold.solver.core.api.domain.variable.PlanningListVariable;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@PlanningEntity
public class Vehicle {
    @PlanningId
    private String id;

    private Depot depot;

    @PlanningListVariable
    private List<Customer> customers;

    private boolean backToOrigin;

    private LocalDateTime preferredDepartureTime;

    private Integer maximumOrders;

    private Long maximumTime;

    private Long maximumDistance;

    private Double maximumVolume;

    private Double maximumWeight;

    private List<String> attributes;

    private boolean isVirtual;

    private String virtualGroupId;

    public long getTotalTime() {
        if (customers.isEmpty()) {
            return 0;
        }

        long totalTime = 0;
        Visit previousLocation = depot;

        for (Customer customer : customers) {
            totalTime += previousLocation.getDurationTo(customer.getVisit()).toSeconds();
            totalTime += customer.getServiceDuration().toSeconds();
            totalTime += customer.getWaitingDuration().toSeconds();

            previousLocation = customer.getVisit();
        }

        if (this.backToOrigin) {
            totalTime += previousLocation.getTimeTo(depot);
        }

        return totalTime;
    }

    public long getTotalDrivingTime() {
        if (customers.isEmpty()) {
            return 0;
        }

        long totalTime = 0;
        Visit previousLocation = depot;

        for (Customer customer : customers) {
            totalTime += previousLocation.getTimeTo(customer.getVisit());
            previousLocation = customer.getVisit();
        }

        if (this.backToOrigin) {
            totalTime += previousLocation.getTimeTo(depot);
        }

        return totalTime;
    }

    public long getTotalDrivingDistance() {
        if (customers.isEmpty()) {
            return 0L;
        }

        long totalDistance = 0L;
        Visit previousLocation = depot;

        for (Customer customer : customers) {
            totalDistance += previousLocation.getDistanceTo(customer.getVisit());
            previousLocation = customer.getVisit();
        }

        if (this.backToOrigin) {
            totalDistance += previousLocation.getDistanceTo(depot);
        }

        return totalDistance;
    }

    public Double getTotalVolume() {
        if (customers.isEmpty()) {
            return 0D;
        }

        return customers.stream().filter(q -> q.getVolume() != null).mapToDouble(Customer::getVolume).sum();
    }


    public Double getTotalWeight() {
        if (customers.isEmpty()) {
            return 0D;
        }

        return customers.stream().filter(q -> q.getWeight() != null).mapToDouble(Customer::getWeight).sum();
    }

    public boolean hasOrders() {
        return !this.customers.isEmpty();
    }

    public long getExcessOrders() {
        long currentOrders = this.customers.size();
        if (this.maximumOrders == null || currentOrders < this.maximumOrders) {
            return 0L;
        }

        return currentOrders - this.maximumOrders;
    }

    public long getExcessDistance() {
        if (this.maximumDistance == null) {
            return 0L;
        }

        long totalDistance = this.getTotalDrivingDistance();

        if (totalDistance < this.maximumDistance) {
            return 0L;
        }

        return totalDistance - this.maximumDistance;
    }

    public long getExcessTime() {
        if (this.maximumTime == null) {
            return 0L;
        }
        long totalTime = this.getTotalTime();

        if (totalTime < this.maximumTime) {
            return 0L;
        }

        return  totalTime - this.maximumTime;
    }

    public long getExcessVolume() {
        if (this.maximumVolume == null) {
            return 0L;
        }

        Double totalVolume = this.getTotalVolume();

        if (totalVolume < this.maximumVolume) {
            return 0L;
        }

        return (long)((totalVolume - this.maximumVolume) * 100);
    }

    public long getExcessWeight() {
        if (this.maximumWeight == null) {
            return 0L;
        }
        Double totalWeight = this.getTotalWeight();

        if (totalWeight < this.maximumWeight) {
            return 0L;
        }

        return (long)((totalWeight - this.maximumWeight) * 100);
    }

}
