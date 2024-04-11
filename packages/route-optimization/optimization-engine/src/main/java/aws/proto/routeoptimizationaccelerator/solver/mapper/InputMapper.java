/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.solver.mapper;

import aws.proto.routeoptimizationaccelerator.data.input.*;
import aws.proto.routeoptimizationaccelerator.data.input.base.BaseFleet;
import aws.proto.routeoptimizationaccelerator.solver.constraints.VehicleRoutingConstraintConfiguration;
import aws.proto.routeoptimizationaccelerator.solver.domain.Customer;
import aws.proto.routeoptimizationaccelerator.solver.domain.Depot;
import aws.proto.routeoptimizationaccelerator.solver.domain.Vehicle;
import aws.proto.routeoptimizationaccelerator.solver.domain.Visit;
import aws.proto.routeoptimizationaccelerator.solver.geo.DistanceCalculatorFactory;
import aws.proto.routeoptimizationaccelerator.solver.solution.VehicleRoutingSolution;
import org.apache.commons.lang3.ObjectUtils;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Stream;

public class InputMapper {
    public InputMapper() {}

    public static VehicleRoutingSolution convertInputToSolution(OptimizationRequest input) {
        Configuration commonConfiguration = input.getConfig();
        List<Visit> locations = Stream.concat(
                Arrays.stream(input.getFleet()).map(t -> Depot.fromLocation(t.getStartingLocation())).distinct(),
                Arrays.stream(input.getOrders()).map(t -> Visit.fromLocation(t.getDestination())).distinct()
        ).toList();

        Stream<Vehicle> availableVehicles = Arrays.stream(
                input.getFleet()).map(t -> createBaseVehicle(t, commonConfiguration, locations)
                        .id(t.getId())
                        .isVirtual(false)
                        .build()
                );
        Stream<Vehicle> virtualVehicles = Stream.empty();

        if (commonConfiguration != null && commonConfiguration.getVirtualFleet() != null) {
            VirtualFleet[] vFleet = commonConfiguration.getVirtualFleet();
            for (VirtualFleet b : vFleet) {
                int numberOfVehicles = b.getSize();

                Stream<Vehicle> localVirtualFleet = Stream.generate(() -> createBaseVehicle(b, commonConfiguration, locations)
                                .id("v-" + UUID.randomUUID())
                                .isVirtual(true)
                                .virtualGroupId(b.getGroupId())
                                .build())
                                .limit(numberOfVehicles);

                virtualVehicles = Stream.concat(virtualVehicles, localVirtualFleet);
            }
        }
        List<Vehicle> vehicles = Stream.concat(availableVehicles, virtualVehicles).toList();
        List<Customer> customers = Arrays.stream(
                input.getOrders()).map(t -> Customer.builder()
                        .id(t.getId())
                        .visit(locations.stream().filter(l -> Objects.equals(l.getId(), t.getDestination().getId())).findFirst().orElseThrow())
                        .serviceDuration(Duration.ofSeconds(ObjectUtils.defaultIfNull(t.getServiceTime(), 0)))
                        .readyTime(t.getServiceWindow() != null && !t.getServiceWindow().isEmpty() ? t.getServiceWindow().getFrom() : null)
                        .dueTime(t.getServiceWindow() != null && !t.getServiceWindow().isEmpty() ? t.getServiceWindow().getTo() : null)
                        .volume(t.getAttributes() != null ? t.getAttributes().getVolume() : null)
                        .weight(t.getAttributes() != null ? t.getAttributes().getWeight() : null)
                        .requirements(!ObjectUtils.isEmpty(t.getRequirements()) ? Arrays.asList(t.getRequirements()) : null)
                        .build()
                ).toList();
        boolean hasMaxDistanceLimit = vehicles.stream().anyMatch(t -> t.getMaximumDistance() != null && t.getMaximumDistance() > 0);
        boolean hasMaxTimeLimit = vehicles.stream().anyMatch(t -> t.getMaximumTime() != null && t.getMaximumTime() > 0);
        boolean hasMaximumOrdersLimit = vehicles.stream().anyMatch(t -> t.getMaximumOrders() != null && t.getMaximumOrders() > 0);
        boolean hasMaxVolumeLimit = vehicles.stream().anyMatch(t -> t.getMaximumVolume() != null && t.getMaximumVolume() > 0);
        boolean hasMaxCapacityLimit = vehicles.stream().anyMatch(t -> t.getMaximumWeight() != null && t.getMaximumWeight() > 0);
        boolean hasServiceWindows = customers.stream().anyMatch(t -> t.getReadyTime() != null && t.getDueTime() != null);
        boolean hasVirtualVehicles = commonConfiguration != null && commonConfiguration.getVirtualFleet() != null;
        boolean hasRequirements = customers.stream().anyMatch(t -> t.getRequirements() != null && t.getRequirements().size() > 0);

        // execute distance matrix

        DistanceCalculatorFactory
                .create(commonConfiguration)
                .initDistanceAndTimeMaps(locations);

        // constraint configuration: default weights are defined in this class
        VehicleRoutingConstraintConfiguration constraints = new VehicleRoutingConstraintConfiguration();
        ConstraintsConfiguration constraintsConfiguration = commonConfiguration != null && commonConfiguration.getConstraints() != null ?
                commonConfiguration.getConstraints() : null;

        // TOD: to add support for the constraint type as well
        constraints.setMaximumDistanceWeight(getMaxDistanceWeight(constraintsConfiguration, hasMaxDistanceLimit));
        constraints.setMaximumTimeWeight(getMaxTimeWeight(constraintsConfiguration, hasMaxTimeLimit));
        constraints.setMaximumOrdersWeight(getMaxOrdersWeight(constraintsConfiguration, hasMaximumOrdersLimit));
        constraints.setVehicleVolumeWeight(getMaxVolumeWeight(constraintsConfiguration, hasMaxVolumeLimit));
        constraints.setVehicleCapacityWeight(getMaxCapacityWeight(constraintsConfiguration, hasMaxCapacityLimit));
        constraints.setLateArrivalWeight(getLateArrivalWeight(constraintsConfiguration, hasServiceWindows));
        constraints.setLateDepartureWeight(getLateDepartureWeight(constraintsConfiguration, hasServiceWindows));
        constraints.setEarlyArrivalWeight(getEarlyArrivalWeight(constraintsConfiguration, hasServiceWindows));
        constraints.setTravelDistanceWeight(getTravelDistanceWeight(constraintsConfiguration));
        constraints.setTravelTimeWeight(getTravelTimeWeight(constraintsConfiguration));
        constraints.setVirtualVehicleWeight(getVirtualVehicleWeight(constraintsConfiguration, hasVirtualVehicles));
        constraints.setOrderRequirementsWeight(getOrderRequirementWeight(constraintsConfiguration, hasRequirements));

        return VehicleRoutingSolution.builder()
                // TODO: verify if visits and depots are really needed to be in the solution object?
                .id(input.getProblemId())
                .depots(locations.stream().filter(t -> t instanceof Depot).map(t -> (Depot)t).toList())
                .visits(locations.stream().filter(t -> !(t instanceof Depot)).toList())
                .vehicles(vehicles)
                .customers(customers)
                .constraintConfiguration(constraints)
                .build();
    }

    private static Vehicle.VehicleBuilder createBaseVehicle(BaseFleet v, Configuration commonConfiguration, List<Visit> locations) {
        return Vehicle.builder()
                .backToOrigin(getBackToOriginConfiguration(commonConfiguration, v.getBackToOrigin()))
                .maximumDistance(getMaxDistanceConfiguration(commonConfiguration, v.getLimits()))
                .maximumTime(getMaxTimeConfiguration(commonConfiguration, v.getLimits()))
                .maximumOrders(getMaxOrdersConfiguration(commonConfiguration, v.getLimits()))
                .maximumVolume(v.getLimits() != null ? v.getLimits().getMaxVolume() : null)
                .maximumWeight(v.getLimits() != null ? v.getLimits().getMaxCapacity() : null)
                .preferredDepartureTime(getPreferredDepartureTime(commonConfiguration, v.getPreferredDepartureTime()))
                .depot(locations.stream().filter(l -> Objects.equals(l.getId(), v.getStartingLocation().getId())).map(d -> (Depot)d).findFirst().orElseThrow())
                .attributes(!ObjectUtils.isEmpty(v.getAttributes()) ? Arrays.asList(v.getAttributes()) : null)
                .customers(new ArrayList<>());
    }

    private static int getOrderRequirementWeight(ConstraintsConfiguration weights, boolean isLimitSet) {
        if (!isLimitSet) {
            return 0;
        }


        if (weights != null && weights.getVirtualVehicle() != null) {
            return weights.getOrderRequirements().getWeight();
        }

        return DefaultConfigurationValuesProvider.WEIGHTS.getOrderRequirements().getWeight();
    }

    private static int getVirtualVehicleWeight(ConstraintsConfiguration weights, boolean isLimitSet) {
        if (!isLimitSet) {
            return 0;
        }

        if (weights != null && weights.getVirtualVehicle() != null) {
            return weights.getVirtualVehicle().getWeight();
        }

        return DefaultConfigurationValuesProvider.WEIGHTS.getVirtualVehicle().getWeight();
    }

    private static int getTravelTimeWeight(ConstraintsConfiguration weights) {
        if (weights != null && weights.getTravelTime() != null) {
            return weights.getTravelTime().getWeight();
        }

        return DefaultConfigurationValuesProvider.WEIGHTS.getTravelTime().getWeight();
    }

    private static int getTravelDistanceWeight(ConstraintsConfiguration weights) {
        if (weights != null && weights.getTravelDistance() != null) {
            return weights.getTravelDistance().getWeight();
        }

        return DefaultConfigurationValuesProvider.WEIGHTS.getTravelDistance().getWeight();
    }

    private static int getEarlyArrivalWeight(ConstraintsConfiguration weights, boolean isLimitSet) {
        if (!isLimitSet) {
            return 0;
        }

        if (weights != null && weights.getEarlyArrival() != null) {
            return weights.getEarlyArrival().getWeight();
        }

        return DefaultConfigurationValuesProvider.WEIGHTS.getEarlyArrival().getWeight();
    }

    private static int getLateDepartureWeight(ConstraintsConfiguration weights, boolean isLimitSet) {
        if (!isLimitSet) {
            return 0;
        }

        if (weights != null && weights.getLateDeparture() != null) {
            return weights.getLateDeparture().getWeight();
        }

        return DefaultConfigurationValuesProvider.WEIGHTS.getLateDeparture().getWeight();
    }

    private static int getLateArrivalWeight(ConstraintsConfiguration weights, boolean isLimitSet) {
        if (!isLimitSet) {
            return 0;
        }

        if (weights != null && weights.getLateArrival() != null) {
            return weights.getLateArrival().getWeight();
        }

        return DefaultConfigurationValuesProvider.WEIGHTS.getLateArrival().getWeight();
    }

    private static int getMaxCapacityWeight(ConstraintsConfiguration weights, boolean isLimitSet) {
        if (!isLimitSet) {
            return 0;
        }

        if (weights != null && weights.getVehicleWeight() != null) {
            return weights.getVehicleWeight().getWeight();
        }

        return DefaultConfigurationValuesProvider.WEIGHTS.getVehicleWeight().getWeight();
    }

    private static int getMaxVolumeWeight(ConstraintsConfiguration weights, boolean isLimitSet) {
        if (!isLimitSet) {
            return 0;
        }

        if (weights != null && weights.getVehicleVolume() != null) {
            return weights.getVehicleVolume().getWeight();
        }

        return DefaultConfigurationValuesProvider.WEIGHTS.getVehicleVolume().getWeight();
    }

    private static int getMaxOrdersWeight(ConstraintsConfiguration weights, boolean isLimitSet) {
        if (!isLimitSet) {
            return 0;
        }

        if (weights != null && weights.getOrderCount() != null) {
            return weights.getOrderCount().getWeight();
        }

        return DefaultConfigurationValuesProvider.WEIGHTS.getOrderCount().getWeight();
    }

    private static int getMaxTimeWeight(ConstraintsConfiguration weights, boolean isLimitSet) {
        if (!isLimitSet) {
            return 0;
        }

        if (weights != null && weights.getMaxTime() != null) {
            return weights.getMaxTime().getWeight();
        }

        return DefaultConfigurationValuesProvider.WEIGHTS.getMaxTime().getWeight();
    }

    private static int getMaxDistanceWeight(ConstraintsConfiguration weights, boolean isLimitSet) {
        if (!isLimitSet) {
            return 0;
        }

        if (weights != null && weights.getMaxDistance() != null) {
            return weights.getMaxDistance().getWeight();
        }

        return DefaultConfigurationValuesProvider.WEIGHTS.getMaxDistance().getWeight();
    }

    private static int getMaxOrdersConfiguration(Configuration commonConfiguration, FleetLimits limits) {
        if (limits != null && ObjectUtils.defaultIfNull(limits.getMaxOrders(), 0) > 0) {
            return limits.getMaxOrders();
        }

        if (commonConfiguration != null && ObjectUtils.defaultIfNull(commonConfiguration.getMaxOrders(), 0) > 0) {
            return commonConfiguration.getMaxOrders();
        }

        return DefaultConfigurationValuesProvider.MAX_ORDERS;
    }

    private static long getMaxTimeConfiguration(Configuration commonConfiguration, FleetLimits limits) {
        if (limits != null && ObjectUtils.defaultIfNull(limits.getMaxTime(), 0) > 0) {
            return limits.getMaxTime();
        }

        if (commonConfiguration != null && ObjectUtils.defaultIfNull(commonConfiguration.getMaxTime(), 0) > 0) {
            return commonConfiguration.getMaxTime();
        }

        return DefaultConfigurationValuesProvider.MAX_TIME;
    }

    private static long getMaxDistanceConfiguration(Configuration commonConfiguration, FleetLimits limits) {
        if (limits != null && ObjectUtils.defaultIfNull(limits.getMaxDistance(), 0) > 0) {
            return limits.getMaxDistance();
        }

        if (commonConfiguration != null && ObjectUtils.defaultIfNull(commonConfiguration.getMaxDistance(), 0) > 0) {
            return commonConfiguration.getMaxDistance();
        }

        return DefaultConfigurationValuesProvider.MAX_DISTANCE;
    }


    private static boolean getBackToOriginConfiguration(Configuration commonConfiguration, Boolean backToOrigin) {
        if (backToOrigin != null) {
            return backToOrigin;
        }

        return ObjectUtils.defaultIfNull(commonConfiguration.getBackToOrigin(), DefaultConfigurationValuesProvider.BACK_TO_ORIGIN);
    }


    private static LocalDateTime getPreferredDepartureTime(Configuration commonConfiguration, LocalDateTime preferredDepartureTime) {
        if (preferredDepartureTime != null) {
            return preferredDepartureTime;
        }

        return ObjectUtils.defaultIfNull(commonConfiguration.getVehicleDepartureTime(), null);
    }

}
