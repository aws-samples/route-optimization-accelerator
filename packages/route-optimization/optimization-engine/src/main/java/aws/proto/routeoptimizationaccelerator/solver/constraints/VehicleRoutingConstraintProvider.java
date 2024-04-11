/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.solver.constraints;

import ai.timefold.solver.core.api.score.stream.Constraint;
import ai.timefold.solver.core.api.score.stream.ConstraintFactory;
import ai.timefold.solver.core.api.score.stream.ConstraintProvider;
import aws.proto.routeoptimizationaccelerator.solver.domain.Customer;
import aws.proto.routeoptimizationaccelerator.solver.domain.Vehicle;

public class VehicleRoutingConstraintProvider implements ConstraintProvider {

    @Override
    public Constraint[] defineConstraints(ConstraintFactory factory) {
        return new Constraint[] {
                shouldNotHaveMissingRequirements(factory),
                shouldNotExceedMaximumOrders(factory),
                shouldNotExceedMaximumTime(factory),
                shouldNotExceedMaximumDistance(factory),
                shouldNotExceedMaximumWeight(factory),
                shouldNotExceedMaximumVolume(factory),
                shouldNotArriveLate(factory),
                preferOnTimeArrival(factory),
                preferOnTimeDeparture(factory),
                penalizeVirtualVehicles(factory),
                minimizeTravelTime(factory),
                minimizeTravelDistance(factory)
        };
    }

    protected Constraint shouldNotHaveMissingRequirements(ConstraintFactory factory) {
        return factory.forEach(Customer.class)
                .penalizeConfigurableLong(Customer::getMissingRequirementsCount)
                .asConstraint(VehicleRoutingConstraintConfiguration.ORDER_REQUIREMENTS);
    }

    protected Constraint shouldNotExceedMaximumOrders(ConstraintFactory factory) {
        return factory.forEach(Vehicle.class)
                .penalizeConfigurableLong(Vehicle::getExcessOrders)
                .asConstraint(VehicleRoutingConstraintConfiguration.MAXIMUM_ORDERS);
    }

    protected Constraint shouldNotExceedMaximumTime(ConstraintFactory factory) {
        return factory.forEach(Vehicle.class)
                .penalizeConfigurableLong(Vehicle::getExcessTime)
                .asConstraint(VehicleRoutingConstraintConfiguration.MAXIMUM_TIME);
    }

    protected Constraint shouldNotExceedMaximumDistance(ConstraintFactory factory) {
        return factory.forEach(Vehicle.class)
                .penalizeConfigurableLong(Vehicle::getExcessDistance)
                .asConstraint(VehicleRoutingConstraintConfiguration.MAXIMUM_DISTANCE);
    }

    protected Constraint shouldNotExceedMaximumWeight(ConstraintFactory factory) {
        return factory.forEach(Vehicle.class)
                .penalizeConfigurableLong(Vehicle::getExcessWeight)
                .asConstraint(VehicleRoutingConstraintConfiguration.VEHICLE_CAPACITY);
    }

    protected Constraint shouldNotExceedMaximumVolume(ConstraintFactory factory) {
        return factory.forEach(Vehicle.class)
                .penalizeConfigurableLong(Vehicle::getExcessVolume)
                .asConstraint(VehicleRoutingConstraintConfiguration.VEHICLE_VOLUME);
    }

    protected Constraint shouldNotArriveLate(ConstraintFactory factory) {
        return factory.forEach(Customer.class)
                .penalizeConfigurableLong(Customer::getLateArrivalExcess)
                .asConstraint(VehicleRoutingConstraintConfiguration.LATE_ARRIVAL);
    }

    protected Constraint preferOnTimeArrival(ConstraintFactory factory) {
        return factory.forEach(Customer.class)
                .penalizeConfigurableLong(Customer::getWaitingTime)
                .asConstraint(VehicleRoutingConstraintConfiguration.EARLY_ARRIVAL);
    }

    protected Constraint preferOnTimeDeparture(ConstraintFactory factory) {
        return factory.forEach(Customer.class)
                .penalizeConfigurableLong(Customer::getLateDepartureExcess)
                .asConstraint(VehicleRoutingConstraintConfiguration.LATE_DEPARTURE);
    }

    protected Constraint penalizeVirtualVehicles(ConstraintFactory factory) {
        return factory.forEach(Vehicle.class)
                .filter(Vehicle::hasOrders)
                .penalizeConfigurableLong(t -> t.isVirtual() ? 1 : 0)
                .asConstraint(VehicleRoutingConstraintConfiguration.VIRTUAL_VEHICLE);
    }

    protected Constraint minimizeTravelTime(ConstraintFactory factory) {
        return factory.forEach(Vehicle.class)
                .penalizeConfigurableLong(Vehicle::getTotalDrivingTime)
                .asConstraint(VehicleRoutingConstraintConfiguration.TRAVEL_TIME);
    }

    protected Constraint minimizeTravelDistance(ConstraintFactory factory) {
        return factory.forEach(Customer.class)
                .filter(Customer::hasVehicles)
                .penalizeConfigurableLong(Customer::getDistanceFromPreviousStandstill)
                .asConstraint(VehicleRoutingConstraintConfiguration.TRAVEL_DISTANCE);
    }
}
