/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.solver;

import aws.proto.routeoptimizationaccelerator.common.Location;
import aws.proto.routeoptimizationaccelerator.common.Position;
import aws.proto.routeoptimizationaccelerator.data.input.*;
import aws.proto.routeoptimizationaccelerator.data.input.enums.DistanceMatrixType;
import aws.proto.routeoptimizationaccelerator.solver.domain.Customer;
import aws.proto.routeoptimizationaccelerator.solver.domain.Depot;
import aws.proto.routeoptimizationaccelerator.solver.domain.Vehicle;
import aws.proto.routeoptimizationaccelerator.solver.domain.Visit;
import aws.proto.routeoptimizationaccelerator.solver.solution.VehicleRoutingSolution;
import org.apache.commons.lang3.ObjectUtils;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.PrimitiveIterator;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Supplier;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class SolverRunnerTest {
    private final SolverRunner runner = new SolverRunner();
    private static final int[] SERVICE_DURATION_MINUTES = { 30, 45, 50, 60 };
    private static final double[] FLEET_CAPACITY = { 100, 150, 180 };
    private static final double[] ORDER_WEIGHT = { 20, 30, 50 };
    private static final double[] FLEET_VOLUME = { 4, 5, 6 };
    private static final double[] ORDER_VOLUME = { 0.5, 1, 2 };
    private static final LocalDate TOMORROW = LocalDate.now().plusDays(1);
    private static final LocalDateTime TOMORROW_AT_0700 =  LocalDateTime.of(TOMORROW, LocalTime.of(7, 0));
    private static final LocalDateTime TOMORROW_AT_1200 =  LocalDateTime.of(TOMORROW, LocalTime.of(12, 0));
    private static final LocalDateTime TOMORROW_AT_1800 =  LocalDateTime.of(TOMORROW, LocalTime.of(18, 0));

    private final Depot depot = Depot.fromLocation(Location
            .builder()
            .id("depot")
            .longitude(-122.24411681313705)
            .latitude(47.58758077964066)
            .build()
    );

    private record Boundaries(Position southWestCorner, Position northEastCorner) {}
    Boundaries area = new Boundaries(Position.from(-122.56410049480593, 47.168807602317), Position.from(-122.06134935613792, 47.67418458178844));
    private record RandomData(Fleet[] fleet, Order[] orders) {}
    private record RandomDataInitializer(int orderCount, int fleetCount, boolean backToOrigin, boolean useServiceWindow, boolean vehicleLimits, Integer orderLimit) {
        static RandomDataInitializer withServiceWindow(int orderCount, int fleetCount, int orderLimit) {
            return new RandomDataInitializer(orderCount, fleetCount, true, true, false, orderLimit);
        }

        static RandomDataInitializer withServiceWindowAndVehicleLimits(int orderCount, int fleetCount) {
            return new RandomDataInitializer(orderCount, fleetCount, true, true, true, null);
        }
    }
    private RandomData generateRandomData(RandomDataInitializer initializer) {
        Random random = new Random(0);
        PrimitiveIterator.OfDouble latitudes = random
                .doubles(area.southWestCorner.getLatitude(), area.northEastCorner.getLatitude()).iterator();
        PrimitiveIterator.OfDouble longitudes = random
                .doubles(area.southWestCorner.getLongitude(), area.northEastCorner.getLongitude()).iterator();

        AtomicLong vehicleSequence = new AtomicLong();
        Supplier<Fleet> vehicleSupplier = () -> {
            FleetLimits limits = null;

            if (ObjectUtils.defaultIfNull(initializer.orderLimit, 0)  > 0 || initializer.vehicleLimits) {
                double volume = FLEET_VOLUME[random.nextInt(FLEET_VOLUME.length)];
                double capacity = FLEET_CAPACITY[random.nextInt(FLEET_CAPACITY.length)];

                limits = FleetLimits.builder()
                        .maxOrders(initializer.orderLimit)
                        .maxVolume(initializer.vehicleLimits ? volume : null)
                        .maxCapacity(initializer.vehicleLimits ? capacity : null)
                        .build();
            }


            return Fleet.builder()
                    .id("fleet-" + vehicleSequence.incrementAndGet())
                    .backToOrigin(initializer.backToOrigin)
                    .startingLocation(depot)
                    .preferredDepartureTime(TOMORROW_AT_0700)
                    .limits(limits)
                    .build();
        };

        AtomicLong orderSequence = new AtomicLong();
        Supplier<Order> orderSupplier = () -> {
            boolean morningTimeWindow = random.nextBoolean();
            int serviceDurationMinutes = SERVICE_DURATION_MINUTES[random.nextInt(SERVICE_DURATION_MINUTES.length)];
            LocalDateTime readyTime = morningTimeWindow ? TOMORROW_AT_0700 : TOMORROW_AT_1200;
            LocalDateTime dueTime = morningTimeWindow ? TOMORROW_AT_1200 : TOMORROW_AT_1800;
            double volume = ORDER_VOLUME[random.nextInt(FLEET_VOLUME.length)];
            double weight = ORDER_WEIGHT[random.nextInt(FLEET_CAPACITY.length)];
            OrderAttributes attributes = null;

            if (initializer.vehicleLimits) {
                attributes = OrderAttributes.builder()
                        .volume(volume)
                        .weight(weight)
                        .build();
            }

            long increment = orderSequence.incrementAndGet();
            return Order.builder()
                    .id("order-" + increment)
                    .origin(depot)
                    .destination(Visit.fromLocation(
                                    Location.builder()
                                            .id("customer-" + increment)
                                            .longitude(longitudes.nextDouble())
                                            .latitude(latitudes.nextDouble())
                                            .build()
                            )
                    )
                    .serviceTime(60 * serviceDurationMinutes)
                    .serviceWindow(TimeWindow.builder().from(readyTime).to(dueTime).build())
                    .attributes(attributes)
                    .build();
        };

        Fleet[] vehicles = Stream.generate(vehicleSupplier).limit(initializer.fleetCount).toArray(Fleet[]::new);
        Order[] orders = Stream.generate(orderSupplier).limit(initializer.orderCount).toArray(Order[]::new);

        return new RandomData(vehicles, orders);
    }

    @Test
    public void shouldRunTheTravelingSalesmanWithServiceWindowSolver() throws Exception {
        RandomData data = generateRandomData(RandomDataInitializer.withServiceWindow(4, 1, 0));
        OptimizationRequest message = OptimizationRequest.builder()
                .config(Configuration.builder().distanceMatrixType(DistanceMatrixType.AIR_DISTANCE).build())
                .orders(data.orders)
                .fleet(data.fleet)
                .build();

        VehicleRoutingSolution solution = runner.processMessage(message).solution();

        assertEquals(solution.getScore().hardScore(), 0);
        assertEquals(solution.getVehicles().get(0).getCustomers().size(), 4);

        for (Vehicle v: solution.getVehicles()) {
            assertEquals(v.getPreferredDepartureTime(), TOMORROW_AT_0700);
            Customer previusCustomer = null;

            for (Customer c: v.getCustomers()) {
                assertTrue(c.getArrivalTime().isAfter(v.getPreferredDepartureTime()));
                if (previusCustomer != null) {
                    assertTrue(previusCustomer.getArrivalTime().isBefore(c.getArrivalTime()));
                }

                previusCustomer = c;
            }
        }
    }

    @Test
    public void shouldRunTheTravelingSalesmanWithServiceWindowAndRequirementsSolver() throws Exception {
        RandomData data = generateRandomData(RandomDataInitializer.withServiceWindow(4, 2, 0));

        data.fleet[0].setAttributes(new String[]{ "electrician" });
        data.fleet[1].setAttributes(new String[]{ "plumber" });

        data.orders[0].setRequirements(new String[]{ "electrician" });
        data.orders[1].setRequirements(new String[]{ "electrician" });
        data.orders[2].setRequirements(new String[]{ "plumber" });
        data.orders[3].setRequirements(new String[]{ "plumber" });

        OptimizationRequest message = OptimizationRequest.builder()
                .config(Configuration.builder().distanceMatrixType(DistanceMatrixType.AIR_DISTANCE).build())
                .orders(data.orders)
                .fleet(data.fleet)
                .build();

        VehicleRoutingSolution solution = runner.processMessage(message).solution();

        for (var v: solution.getVehicles()) {
            for (var o: v.getCustomers()) {
                // all order requirements should be satisfied by the vehicle attributes
                o.getRequirements().forEach(r -> assertTrue(v.getAttributes().contains(r)));
            }
        }

        assertEquals(solution.getScore().hardScore(), 0);
        assertEquals(solution.getVehicles().get(0).getCustomers().size(), 2);
        assertEquals(solution.getVehicles().get(1).getCustomers().size(), 2);
    }
    @Test
    public void shouldRunTheTravelingSalesmanWithOrderLimitSolver() throws Exception {
        RandomData data = generateRandomData(RandomDataInitializer.withServiceWindow(10, 2, 5));
        OptimizationRequest message = OptimizationRequest.builder()
                .config(Configuration.builder().distanceMatrixType(DistanceMatrixType.AIR_DISTANCE).build())
                .orders(data.orders)
                .fleet(data.fleet)
                .build();

        VehicleRoutingSolution solution = runner.processMessage(message).solution();

        assertEquals(solution.getScore().hardScore(), 0);
        assertEquals(solution.getVehicles().get(0).getCustomers().size(), 5);
        assertEquals(solution.getVehicles().get(1).getCustomers().size(), 5);
    }

    @Test
    public void shouldRunTheVehicleRoutingWithFleetLimits() throws Exception {
        RandomData data = generateRandomData(RandomDataInitializer.withServiceWindowAndVehicleLimits(10, 3));
        OptimizationRequest message = OptimizationRequest.builder()
                .config(Configuration.builder().distanceMatrixType(DistanceMatrixType.AIR_DISTANCE).build())
                .orders(data.orders)
                .fleet(data.fleet)
                .build();

        VehicleRoutingSolution solution = runner.processMessage(message).solution();

        assertEquals(solution.getScore().hardScore(), 0);
    }

    @Test
    public void shouldRunTheVehicleRoutingWithFleetAndVirtualVehiclesLimits() throws Exception {
        RandomData data = generateRandomData(RandomDataInitializer.withServiceWindowAndVehicleLimits(25, 1));
        OptimizationRequest message = OptimizationRequest.builder()
                .config(Configuration.builder()
                        .explain(true)
                        .distanceMatrixType(DistanceMatrixType.AIR_DISTANCE)
                        .virtualFleet(
                                new VirtualFleet[]{
                                        VirtualFleet.builder()
                                                .startingLocation(depot)
                                                .preferredDepartureTime(TOMORROW_AT_0700)
                                                .size(10)
                                                .groupId("g-1")
                                                .backToOrigin(true)
                                                .limits(FleetLimits.builder().maxVolume(10D).maxCapacity(120D).build())
                                                .build()
                                }
                        )
                        .build()
                )
                .orders(data.orders)
                .fleet(data.fleet)
                .build();

        VehicleRoutingSolution solution = runner.processMessage(message).solution();

        assertEquals(solution.getScore().hardScore(), 0);
    }

    @Test
    public void shouldRunTheVehicleRoutingWithFleetLimitsAndRequirements() throws Exception {
        RandomData data = generateRandomData(RandomDataInitializer.withServiceWindowAndVehicleLimits(10, 4));
        // set attributes to have half
        data.fleet[0].setAttributes(new String[]{ "frozen"});
        data.fleet[1].setAttributes(new String[]{ "frozen"});
        data.fleet[2].setAttributes(new String[]{ "chill" });
        data.fleet[3].setAttributes(new String[]{ "chill"});

        for (int i = 0; i < 5; i++) {
            data.orders[i].setRequirements(new String[]{ "frozen" });
        }

        for (int i = 5; i < 10; i++) {
            data.orders[i].setRequirements(new String[]{ "chill" });
        }

        OptimizationRequest message = OptimizationRequest.builder()
                .config(Configuration.builder().distanceMatrixType(DistanceMatrixType.AIR_DISTANCE).build())
                .orders(data.orders)
                .fleet(data.fleet)
                .build();

        VehicleRoutingSolution solution = runner.processMessage(message).solution();

        for (var v: solution.getVehicles()) {
            for (var o: v.getCustomers()) {
                // all order requirements should be satisfied by the vehicle attributes
                o.getRequirements().forEach(r -> assertTrue(v.getAttributes().contains(r)));
            }
        }

        assertEquals(solution.getScore().hardScore(), 0);
    }

    @Test
    public void shouldRunConsideringWithMaximumDistance() throws Exception {
        int maxTravelDistanceMeters = 10 * 1000;
        // write it again to force static position due to distance comparison
        Fleet fleet1 = Fleet.builder().id("f-1").backToOrigin(true).preferredDepartureTime(TOMORROW_AT_0700).startingLocation(depot).build();
        Fleet fleet2 = Fleet.builder().id("f-2").backToOrigin(true).preferredDepartureTime(TOMORROW_AT_0700).startingLocation(depot).build();

        Visit v1 = Visit.fromLocation(Location.builder().id("v-1").latitude(47.59338774117188).longitude(-122.29313726917279).build());
        Visit v2 = Visit.fromLocation(Location.builder().id("v-2").latitude(47.579783230841144).longitude(-122.29374593376701).build());
        Visit v3 = Visit.fromLocation(Location.builder().id("v-3").latitude(47.59517145091249).longitude(-122.30555048763311).build());
        Visit v4 = Visit.fromLocation(Location.builder().id("v-4").latitude(47.588993143919).longitude(-122.30107828728701).build());
        TimeWindow window = TimeWindow.builder().from(TOMORROW_AT_0700).to(TOMORROW_AT_1800).build();

        Order order1 = Order.builder().id("o-1").origin(depot).destination(v1).serviceWindow(window).serviceTime(30).build();
        Order order2 = Order.builder().id("o-2").origin(depot).destination(v2).serviceWindow(window).serviceTime(30).build();
        Order order3 = Order.builder().id("o-3").origin(depot).destination(v3).serviceWindow(window).serviceTime(30).build();
        Order order4 = Order.builder().id("o-4").origin(depot).destination(v4).serviceWindow(window).serviceTime(30).build();

        OptimizationRequest message = OptimizationRequest.builder()
                .config(
                    Configuration.builder()
                        .distanceMatrixType(DistanceMatrixType.AIR_DISTANCE)
                        .maxDistance(maxTravelDistanceMeters)
                        .build()
                )
                .orders(new Order[] { order1, order2, order3, order4 })
                .fleet(new Fleet[] { fleet1, fleet2 })
                .build();

        VehicleRoutingSolution solution = runner.processMessage(message).solution();

        assertEquals(solution.getScore().hardScore(), 0);

        for (Vehicle f : solution.getVehicles()) {
            assertTrue(f.getTotalDrivingDistance() < maxTravelDistanceMeters);
        }
    }

    @Test
    public void shouldRunConsideringWithMaximumDuration() throws Exception {
        // maximum 75 minutes (1 hour and 15 minutes)
        // service time is 30 minutes each and driving is approximately
        // 10 minutes back and forth from any point
        // each driver should get 2 orders
        int maxDuration = 60 * 75;
        // write it again to force static position due to distance comparison
        Fleet fleet1 = Fleet.builder().id("f-1").backToOrigin(true).preferredDepartureTime(TOMORROW_AT_0700).startingLocation(depot).build();
        Fleet fleet2 = Fleet.builder().id("f-2").backToOrigin(true).preferredDepartureTime(TOMORROW_AT_0700).startingLocation(depot).build();

        Visit v1 = Visit.fromLocation(Location.builder().id("v-1").latitude(47.59338774117188).longitude(-122.29313726917279).build());
        Visit v2 = Visit.fromLocation(Location.builder().id("v-2").latitude(47.579783230841144).longitude(-122.29374593376701).build());
        Visit v3 = Visit.fromLocation(Location.builder().id("v-3").latitude(47.59517145091249).longitude(-122.30555048763311).build());
        Visit v4 = Visit.fromLocation(Location.builder().id("v-4").latitude(47.588993143919).longitude(-122.30107828728701).build());
        TimeWindow window = TimeWindow.builder().from(TOMORROW_AT_0700).to(TOMORROW_AT_1800).build();

        Order order1 = Order.builder().id("o-1").origin(depot).destination(v1).serviceWindow(window).serviceTime(30 * 60).build();
        Order order2 = Order.builder().id("o-2").origin(depot).destination(v2).serviceWindow(window).serviceTime(30 * 60).build();
        Order order3 = Order.builder().id("o-3").origin(depot).destination(v3).serviceWindow(window).serviceTime(30 * 60).build();
        Order order4 = Order.builder().id("o-4").origin(depot).destination(v4).serviceWindow(window).serviceTime(30 * 60).build();

        OptimizationRequest message = OptimizationRequest.builder()
                .config(
                        Configuration.builder()
                                .distanceMatrixType(DistanceMatrixType.AIR_DISTANCE)
                                .maxTime(maxDuration)
                                .build()
                )
                .orders(new Order[] { order1, order2, order3, order4 })
                .fleet(new Fleet[] { fleet1, fleet2 })
                .build();

        VehicleRoutingSolution solution = runner.processMessage(message).solution();

        assertEquals(solution.getScore().hardScore(), 0);

        for (Vehicle f : solution.getVehicles()) {
            assertTrue(f.getTotalTime() < maxDuration);
        }
    }

    @Test
    public void shouldResolveWithoutUsingTimeWindow() throws Exception {
        // write it again to force static position due to distance comparison
        Fleet fleet1 = Fleet.builder().id("f-1").backToOrigin(false).startingLocation(depot).limits(FleetLimits.builder().maxOrders(1).build()).build();
        Fleet fleet2 = Fleet.builder().id("f-2").backToOrigin(false).startingLocation(depot).limits(FleetLimits.builder().maxOrders(3).build()).build();

        Visit v1 = Visit.fromLocation(Location.builder().id("v-1").latitude(47.59338774117188).longitude(-122.29313726917279).build());
        Visit v2 = Visit.fromLocation(Location.builder().id("v-2").latitude(47.579783230841144).longitude(-122.29374593376701).build());
        Visit v3 = Visit.fromLocation(Location.builder().id("v-3").latitude(47.59517145091249).longitude(-122.30555048763311).build());
        Visit v4 = Visit.fromLocation(Location.builder().id("v-4").latitude(47.588993143919).longitude(-122.30107828728701).build());

        Order order1 = Order.builder().id("o-1").origin(depot).destination(v1).build();
        Order order2 = Order.builder().id("o-2").origin(depot).destination(v2).build();
        Order order3 = Order.builder().id("o-3").origin(depot).destination(v3).build();
        Order order4 = Order.builder().id("o-4").origin(depot).destination(v4).build();

        OptimizationRequest message = OptimizationRequest.builder()
                .config(
                        Configuration.builder()
                                .distanceMatrixType(DistanceMatrixType.AIR_DISTANCE)
                                .build()
                )
                .orders(new Order[] { order1, order2, order3, order4 })
                .fleet(new Fleet[] { fleet1, fleet2 })
                .build();

        LocalDateTime time = LocalDateTime.now();
        VehicleRoutingSolution solution = runner.processMessage(message).solution();

        assertEquals(solution.getScore().hardScore(), 0);
        assertEquals(solution.getVehicles().get(0).getCustomers().size(), 1);
        assertEquals(solution.getVehicles().get(1).getCustomers().size(), 3);

        for (Vehicle v: solution.getVehicles()) {
            assertTrue(time.isBefore(v.getPreferredDepartureTime()));
            Customer previusCustomer = null;

            for (Customer c: v.getCustomers()) {
                assertTrue(c.getArrivalTime().isAfter(v.getPreferredDepartureTime()));
                if (previusCustomer != null) {
                    assertTrue(previusCustomer.getArrivalTime().isBefore(c.getArrivalTime()));
                }

                previusCustomer = c;
            }
        }
    }
}
