/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.data;

import aws.proto.routeoptimizationaccelerator.data.input.Fleet;
import aws.proto.routeoptimizationaccelerator.data.input.Order;
import aws.proto.routeoptimizationaccelerator.data.input.OptimizationRequest;
import aws.proto.routeoptimizationaccelerator.data.input.VirtualFleet;
import aws.proto.routeoptimizationaccelerator.exception.InputValidationException;
import org.apache.commons.lang3.StringUtils;

import java.util.Arrays;

public class OptimizationRequestValidator {
    private final OptimizationRequest message;
    public OptimizationRequestValidator(OptimizationRequest message) {
        this.message = message;
    }

    public void isValid() throws InputValidationException {
        long fleetCapacity = 0;
        long fleetVolume = 0;
        long orderCapacity = 0;
        long orderVolume = 0;

        if (message.getOrders() == null || message.getOrders().length == 0) {
            throw new InputValidationException("At least one order must be provided");
        }

        if (message.getFleet() == null || message.getFleet().length == 0) {
            throw new InputValidationException("At least one fleet member must be provided");
        }

        for (Fleet fleet : message.getFleet()) {
            if (fleet.getLimits() != null && fleet.getLimits().getMaxVolume() != null) {
                fleetVolume += fleet.getLimits().getMaxVolume();
            }

            if (fleet.getLimits() != null && fleet.getLimits().getMaxCapacity() != null) {
                fleetCapacity += fleet.getLimits().getMaxCapacity();
            }
        }

        boolean hasVirtualFleet = message.getConfig() != null && message.getConfig().getVirtualFleet() != null;
        VirtualFleet[] vFleetArray = hasVirtualFleet ? message.getConfig().getVirtualFleet() : null;

        if (hasVirtualFleet) {
            for (VirtualFleet vFleet: vFleetArray) {
                if (vFleet.getLimits() != null && vFleet.getLimits().getMaxCapacity() != null) {
                    fleetCapacity += vFleet.getLimits().getMaxCapacity() * vFleet.getSize();
                }

                if (vFleet.getLimits() != null && vFleet.getLimits().getMaxVolume() != null) {
                    fleetVolume += vFleet.getLimits().getMaxVolume() * vFleet.getSize();
                }
            }
        }

        for (Order order : message.getOrders()) {
            if (order.getAttributes() != null && order.getAttributes().getVolume() != null) {
                orderVolume += order.getAttributes().getVolume();
            }

            if (order.getAttributes() != null && order.getAttributes().getWeight() != null) {
                orderCapacity += order.getAttributes().getWeight();
            }
        }

        if (StringUtils.isBlank(message.getProblemId())) {
            throw new InputValidationException("'problemId' it's a required field");
        }
        if (Arrays.stream(message.getOrders()).anyMatch(q -> StringUtils.isBlank(q.getId()))) {
            throw new InputValidationException("'id' it's a required field for all orders");
        }

        if (Arrays.stream(message.getOrders()).anyMatch(q -> q.getOrigin() == null || q.getOrigin().isEmpty())) {
            throw new InputValidationException("'origin' and it's respective fields are required for all orders");
        }

        if (Arrays.stream(message.getOrders()).anyMatch(q -> q.getDestination() == null || q.getDestination().isEmpty())) {
            throw new InputValidationException("'destination' and it's respective fields are required for all orders");
        }

        long populatedServiceCount = Arrays.stream(message.getOrders()).filter(q -> q.getServiceWindow() != null && !q.getServiceWindow().isEmpty()).count();

        if (populatedServiceCount > 0 && message.getOrders().length != populatedServiceCount) {
            throw new InputValidationException("'serviceWindow' must be either defined or empty for every order");
        }

        if (Arrays.stream(message.getFleet()).anyMatch(q -> StringUtils.isBlank(q.getId()))) {
            throw new InputValidationException("'id' it's a required field for all fleet members");
        }

        if (Arrays.stream(message.getFleet()).anyMatch(q -> q.getStartingLocation() == null || q.getStartingLocation().isEmpty())) {
            throw new InputValidationException("'startingLocation' and it's respective fields are required for all fleet members");
        }

        if (hasVirtualFleet && Arrays.stream(vFleetArray).anyMatch(q -> q.getStartingLocation() == null || q.getStartingLocation().isEmpty() || StringUtils.isBlank(q.getGroupId()))) {
            throw new InputValidationException("'startingLocation' and 'groupId' has to be specified for the virtual fleet");
        }

        if (fleetCapacity < orderCapacity) {
            throw new InputValidationException(String.format("Total fleet capacity (%d) is not enough to cover total order request (%d). You can augment it with virtual vehicles", fleetCapacity, orderCapacity));
        }

        if (fleetVolume < orderVolume) {
            throw new InputValidationException(String.format("Total fleet volume (%d) is not enough to cover total order request (%d). You can augment it with virtual vehicles", fleetVolume, orderVolume));
        }
    }
}
