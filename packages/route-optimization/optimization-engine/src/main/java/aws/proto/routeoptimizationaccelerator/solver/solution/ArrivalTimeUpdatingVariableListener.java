/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.solver.solution;

import ai.timefold.solver.core.api.domain.variable.VariableListener;
import ai.timefold.solver.core.api.score.director.ScoreDirector;
import aws.proto.routeoptimizationaccelerator.solver.domain.Customer;
import aws.proto.routeoptimizationaccelerator.solver.domain.Vehicle;

import java.time.LocalDateTime;
import java.util.Objects;

public class ArrivalTimeUpdatingVariableListener implements VariableListener<VehicleRoutingSolution, Customer> {

    private static final String ARRIVAL_TIME_FIELD = "arrivalTime";

    @Override
    public void beforeVariableChanged(ScoreDirector<VehicleRoutingSolution> scoreDirector, Customer customer) {

    }

    @Override
    public void afterVariableChanged(ScoreDirector<VehicleRoutingSolution> scoreDirector, Customer customer) {
        if (customer.getVehicle() == null) {
            if (customer.getArrivalTime() != null) {
                scoreDirector.beforeVariableChanged(customer, ARRIVAL_TIME_FIELD);
                customer.setArrivalTime(null);
                scoreDirector.afterVariableChanged(customer, ARRIVAL_TIME_FIELD);
            }
            return;
        }

        Customer previousCustomer = customer.getPreviousCustomer();
        LocalDateTime departureTime = customer.getVehicle().getPreferredDepartureTime();

        // if there's a previous customer we get the departure time of the previous customer
        if (previousCustomer != null) {
            departureTime = previousCustomer.getDepartureTime();
        }

        // if is the first customer and the vehicle doesn't have a preferred departure time
        // we compute it based on the first customer's arrival time
        if(previousCustomer == null && departureTime == null) {
            departureTime = this.suggestLatestDepartureTime(customer.getVehicle(), customer);
            customer.getVehicle().setPreferredDepartureTime(departureTime);
        }

        Customer nextCustomer = customer;
        LocalDateTime arrivalTime = calculateArrivalTime(nextCustomer, departureTime);
        while (nextCustomer != null && !Objects.equals(nextCustomer.getArrivalTime(), arrivalTime)) {
            scoreDirector.beforeVariableChanged(nextCustomer, ARRIVAL_TIME_FIELD);
            nextCustomer.setArrivalTime(arrivalTime);
            scoreDirector.afterVariableChanged(nextCustomer, ARRIVAL_TIME_FIELD);
            departureTime = nextCustomer.getDepartureTime();
            nextCustomer = nextCustomer.getNextCustomer();
            arrivalTime = calculateArrivalTime(nextCustomer, departureTime);
        }
    }

    @Override
    public void beforeEntityAdded(ScoreDirector<VehicleRoutingSolution> scoreDirector, Customer customer) {

    }

    @Override
    public void afterEntityAdded(ScoreDirector<VehicleRoutingSolution> scoreDirector, Customer customer) {

    }

    @Override
    public void beforeEntityRemoved(ScoreDirector<VehicleRoutingSolution> scoreDirector, Customer customer) {

    }

    @Override
    public void afterEntityRemoved(ScoreDirector<VehicleRoutingSolution> scoreDirector, Customer customer) {

    }

    // compute the departure date in case its not been set for the vehicle
    private LocalDateTime suggestLatestDepartureTime(Vehicle vehicle, Customer customer) {
        long timeToDestination = vehicle.getDepot().getTimeTo(customer.getVisit());
        LocalDateTime firstCustomerArrivalFrom = customer.getReadyTime();

        // if the service window has not been set for this specific problem
        if (firstCustomerArrivalFrom == null) {
            // just use the runtime and assume that it will start after 1 hour
            return LocalDateTime.now().plusHours(1);
        }

        // otherwise let the vehicle depart in time to reach its destination
        return firstCustomerArrivalFrom.minusSeconds(timeToDestination);
    }
    private LocalDateTime calculateArrivalTime(Customer customer, LocalDateTime previousDepartureTime) {
        if (customer == null || previousDepartureTime == null) {
            return null;
        }

        return previousDepartureTime.plusSeconds(customer.getDrivingTimeFromPreviousStandstill());
    }
}
