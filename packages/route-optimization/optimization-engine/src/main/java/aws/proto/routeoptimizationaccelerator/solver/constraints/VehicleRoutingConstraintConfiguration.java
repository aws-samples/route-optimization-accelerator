/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.solver.constraints;

import ai.timefold.solver.core.api.domain.constraintweight.ConstraintConfiguration;
import ai.timefold.solver.core.api.domain.constraintweight.ConstraintWeight;
import ai.timefold.solver.core.api.score.buildin.hardmediumsoftlong.HardMediumSoftLongScore;
import aws.proto.routeoptimizationaccelerator.data.input.enums.ConstraintType;
import lombok.Getter;

@ConstraintConfiguration
@Getter
public class VehicleRoutingConstraintConfiguration {
    public static final String TRAVEL_TIME = "Travel Time";
    public static final String TRAVEL_DISTANCE = "Travel Distance";
    public static final String EARLY_ARRIVAL = "Early Arrival";
    public static final String LATE_DEPARTURE = "Late Departure";
    public static final String VIRTUAL_VEHICLE = "Virtual Vehicle";
    public static final String LATE_ARRIVAL = "Late Arrival";
    public static final String VEHICLE_CAPACITY = "Vehicle Capacity";
    public static final String VEHICLE_VOLUME = "Vehicle Volume";
    public static final String MAXIMUM_ORDERS = "Maximum Orders";
    public static final String MAXIMUM_TIME = "Maximum time";
    public static final String MAXIMUM_DISTANCE = "Maximum Distance";
    public static final String ORDER_REQUIREMENTS = "Requirements";

    // traveling time has to be minimized as much as possible, configuring this as soft constraint
    @ConstraintWeight(TRAVEL_TIME)
    private HardMediumSoftLongScore travelTime = HardMediumSoftLongScore.ofSoft(1);

    // traveling distance has to be minimized as much as possible, configuring this as soft constraint
    @ConstraintWeight(TRAVEL_DISTANCE)
    private HardMediumSoftLongScore travelDistance = HardMediumSoftLongScore.ofSoft(1);

    // early arrival is not ideal as the driver might need to wait for customer to be ready (e.g. store opening hours)
    // we consider this as medium constraint
    @ConstraintWeight(EARLY_ARRIVAL)
    private HardMediumSoftLongScore earlyArrival = HardMediumSoftLongScore.ofMedium(1);

    // late departure (as in after servicing time) might be considered acceptable, but we configure
    // it as medium constraint in order to provide better customer experience
    @ConstraintWeight(LATE_DEPARTURE)
    private HardMediumSoftLongScore lateDeparture = HardMediumSoftLongScore.ofMedium(1);

    // if virtual vehicles are used it would be penalised
    @ConstraintWeight(VIRTUAL_VEHICLE)
    private HardMediumSoftLongScore virtualVehicle = HardMediumSoftLongScore.ofMedium(1);

    // late arrival is not accepted, thus this is configured as hard constraint
    @ConstraintWeight(LATE_ARRIVAL)
    private HardMediumSoftLongScore lateArrival = HardMediumSoftLongScore.ofHard(1);

    // vehicle capacity excess is not acceptable, thus is configured as hard constraint
    @ConstraintWeight(VEHICLE_CAPACITY)
    private HardMediumSoftLongScore vehicleCapacity = HardMediumSoftLongScore.ofHard(1);

    // vehicle volume excess is not acceptable, thus is configured as hard constraint
    @ConstraintWeight(VEHICLE_VOLUME)
    private HardMediumSoftLongScore vehicleVolume = HardMediumSoftLongScore.ofHard(1);

    // configured max amount of orders cannot be exceeded
    @ConstraintWeight(MAXIMUM_ORDERS)
    private HardMediumSoftLongScore maximumOrders = HardMediumSoftLongScore.ofHard(1);

    // configured max distance cannot be exceeded
    @ConstraintWeight(MAXIMUM_DISTANCE)
    private HardMediumSoftLongScore maximumDistance = HardMediumSoftLongScore.ofHard(1);

    // configured max time cannot be exceeded
    @ConstraintWeight(MAXIMUM_TIME)
    private HardMediumSoftLongScore maximumTime = HardMediumSoftLongScore.ofHard(1);

    // configured to define dynamic requirements that need to match fleet attributes
    @ConstraintWeight(ORDER_REQUIREMENTS)
    private HardMediumSoftLongScore orderRequirements = HardMediumSoftLongScore.ofHard(1);


    public VehicleRoutingConstraintConfiguration() {}

    public void setTravelTimeWeight(int travelTimeWeight) {
        setTravelTimeWeight(travelTimeWeight, ConstraintType.Soft);
    }

    public void setTravelTimeWeight(int travelTimeWeight, ConstraintType type) {
        this.travelTime = getConstraint(travelTimeWeight, type);
    }

    public void setTravelDistanceWeight(int travelDistanceWeight) {
        setTravelDistanceWeight(travelDistanceWeight, ConstraintType.Soft);
    }
    public void setTravelDistanceWeight(int travelDistanceWeight, ConstraintType type) {
        this.travelDistance = getConstraint(travelDistanceWeight, type);
    }

    public void setEarlyArrivalWeight(int earlyArrivalWeight) {
        setEarlyArrivalWeight(earlyArrivalWeight, ConstraintType.Medium);
    }

    public void setEarlyArrivalWeight(int earlyArrivalWeight, ConstraintType type) {
        this.earlyArrival = getConstraint(earlyArrivalWeight, type);
    }

    public void setLateDepartureWeight(int lateDepartureWeight) {
        setLateDepartureWeight(lateDepartureWeight, ConstraintType.Medium);
    }

    public void setLateDepartureWeight(int lateDepartureWeight, ConstraintType type) {
        this.lateDeparture = getConstraint(lateDepartureWeight, type);
    }

    public void setVirtualVehicleWeight(int virtualVehicleWeight) {
        setVirtualVehicleWeight(virtualVehicleWeight, ConstraintType.Medium);
    }

    public void setVirtualVehicleWeight(int virtualVehicleWeight, ConstraintType type) {
        this.virtualVehicle = getConstraint(virtualVehicleWeight, type);
    }

    public void setLateArrivalWeight(int lateArrivalWeight) {
        setLateArrivalWeight(lateArrivalWeight, ConstraintType.Hard);
    }

    public void setLateArrivalWeight(int lateArrivalWeight, ConstraintType type) {
        this.lateArrival = getConstraint(lateArrivalWeight, type);
    }

    public void setVehicleCapacityWeight(int vehicleCapacityWeight) {
        setVehicleCapacityWeight(vehicleCapacityWeight, ConstraintType.Hard);
    }

    public void setVehicleCapacityWeight(int vehicleCapacityWeight, ConstraintType type) {
        this.vehicleCapacity = getConstraint(vehicleCapacityWeight, type);
    }

    public void setVehicleVolumeWeight(int vehicleVolumeWeight) {
        setVehicleVolumeWeight(vehicleVolumeWeight, ConstraintType.Hard);
    }

    public void setVehicleVolumeWeight(int vehicleVolumeWeight, ConstraintType type) {
        this.vehicleVolume = getConstraint(vehicleVolumeWeight, type);
    }

    public void setMaximumOrdersWeight(int maximumOrdersWeight) {
        setMaximumOrdersWeight(maximumOrdersWeight, ConstraintType.Hard);
    }

    public void setMaximumOrdersWeight(int maximumOrdersWeight, ConstraintType type) {
        this.maximumOrders = getConstraint(maximumOrdersWeight, type);
    }

    public void setMaximumDistanceWeight(int maximumDistanceWeight) {
        setMaximumDistanceWeight(maximumDistanceWeight, ConstraintType.Hard);
    }

    public void setMaximumDistanceWeight(int maximumDistanceWeight, ConstraintType type) {
        this.maximumDistance = getConstraint(maximumDistanceWeight, type);
    }

    public void setMaximumTimeWeight(int maximumTimeWeight) {
        setMaximumTimeWeight(maximumTimeWeight, ConstraintType.Hard);
    }

    public void setMaximumTimeWeight(int maximumTimeWeight, ConstraintType type) {
        this.maximumTime = getConstraint(maximumTimeWeight, type);
    }

    public void setOrderRequirementsWeight(int orderRequirementsWeight) {
        this.setOrderRequirementsWeight(orderRequirementsWeight, ConstraintType.Hard);
    }
    public void setOrderRequirementsWeight(int orderRequirementsWeight, ConstraintType type) {
        this.orderRequirements = getConstraint(orderRequirementsWeight, type);
    }

    private HardMediumSoftLongScore getConstraint(int weight, ConstraintType type) {
        switch (type) {
            case Hard -> {
                return HardMediumSoftLongScore.ofHard(weight);
            }
            case Medium -> {
                return HardMediumSoftLongScore.ofMedium(weight);
            }
            default -> {
                return HardMediumSoftLongScore.ofSoft(weight);
            }
        }

    }
}
