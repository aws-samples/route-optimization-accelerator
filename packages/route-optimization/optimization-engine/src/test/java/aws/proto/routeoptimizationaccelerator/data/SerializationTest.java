/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.data;

import aws.proto.routeoptimizationaccelerator.common.Location;
import aws.proto.routeoptimizationaccelerator.data.input.*;
import aws.proto.routeoptimizationaccelerator.data.input.enums.DistanceMatrixType;
import aws.proto.routeoptimizationaccelerator.data.mapper.CustomObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

public class SerializationTest {
  private final CustomObjectMapper json = new CustomObjectMapper();

  @Test
  public void shouldParsePartialMessage() throws JsonProcessingException {
    String jsonObject = """
            {
              "problemId": "abc",
              "orders": [
                {
                  "id": "order-1",
                  "origin": {
                    "id": "origin-1",
                    "latitude": 20.1,
                    "longitude": 10.1
                  },
                  "destination": {
                    "id": "destination-1",
                    "latitude": 22.1,
                    "longitude": 12.1
                  },
                  "serviceTime": 100,
                  "serviceWindow": {
                    "from": "2024-01-01T11:30:00",
                    "to": "2024-01-01T14:00:00"
                  },
                  "attributes": {
                    "weight": 100,
                    "volume": 2.1
                  },
                  "requirements": ["cold-chain"]
                }
              ]
            }""";
    OptimizationRequest request = json.readValue(jsonObject, OptimizationRequest.class);

    assertEquals(request.getOrders().length, 1);

    Order order = request.getOrders()[0];

    assertEquals(order.getId(), "order-1");
    assertEquals(order.getOrigin(), Location.builder().id("origin-1").longitude(10.1).latitude(20.1).build());
    assertEquals(order.getDestination(), Location.builder().id("destination-1").longitude(12.1).latitude(22.1).build());
    assertEquals(order.getServiceTime(), 100);
    assertEquals(order.getServiceWindow(), TimeWindow.builder()
            .from(LocalDateTime.of(2024, 1, 1, 11, 30, 0))
            .to(LocalDateTime.of(2024, 1, 1, 14, 0, 0))
            .build()
    );
    assertEquals(order.getAttributes(), OrderAttributes.builder().weight(100.0).volume(2.1).build());
    assertNull(request.getConfig());
    assertNull(request.getFleet());
  }

  @Test
  public void shouldParseTheEntireMessage() throws JsonProcessingException {
    String jsonObject = """
            {
              "problemId": "abc",
              "fleet": [
                {
                  "id": "f-1",
                  "startingLocation": {
                    "id": "origin-1",
                    "latitude": 20.1,
                    "longitude": 10.1
                  },
                  "preferredDepartureTime": "2024-01-01T10:00:00",
                  "backToOrigin": false,
                  "limits": {
                    "maxOrders": 1,
                    "maxDistance": 2,
                    "maxTime": 3,
                    "maxCapacity": 200.2,
                    "maxVolume": 100.1
                  },
                  "attributes": ["fridge", "freezer"]
                },
                {
                  "id": "f-2",
                  "startingLocation": {
                    "id": "origin-1",
                    "latitude": 20.1,
                    "longitude": 10.1
                  },
                  "preferredDepartureTime": "2024-01-01T11:00:00",
                  "backToOrigin": true,
                  "limits": {
                    "maxOrders": 10,
                    "maxDistance": 20,
                    "maxTime": 30,
                    "maxCapacity": 200.3,
                    "maxVolume": 100.4
                  },
                  "attributes": ["fridge"]
                }
              ],
              "orders": [
                {
                  "id": "order-1",
                  "origin": {
                    "id": "origin-1",
                    "latitude": 20.1,
                    "longitude": 10.1
                  },
                  "destination": {
                    "id": "destination-1",
                    "latitude": 22.1,
                    "longitude": 12.1
                  },
                  "serviceTime": 100,
                  "serviceWindow": {
                    "from": "2024-01-01T11:30:00",
                    "to": "2024-01-01T14:00:00"
                  },
                  "attributes": {
                    "weight": 100,
                    "volume": 2.1
                  },
                  "requirements": ["fridge"]
                },
                {
                  "id": "order-2",
                  "origin": {
                    "id": "origin-1",
                    "latitude": 20.1,
                    "longitude": 10.1
                  },
                  "destination": {
                    "id": "destination-2",
                    "latitude": 25.1,
                    "longitude": 15.1
                  },
                  "serviceTime": 100,
                  "serviceWindow": {
                    "from": "2024-01-01T12:30:00",
                    "to": "2024-01-01T15:30:00"
                  },
                  "attributes": {
                    "weight": 10.3,
                    "volume": 2.1
                  },
                  "requirements": ["freezer"]
                }
              ],
              "config": {
                "distanceMatrixType": "AIR_DISTANCE",
                "maxOrders": 11,
                "maxDistance": 22,
                "maxTime": 33,
                "avoidTolls": true,
                "explain": true,
                "backToOrigin": false,
                "vehicleDepartureTime": "2024-01-01T10:00:00",
                "virtualFleet": [{
                  "groupId": "g1",
                  "size": 5,
                  "startingLocation": {
                    "id": "origin-x",
                    "latitude": 11.1,
                    "longitude": 22.2
                  },
                  "preferredDepartureTime": "2024-01-01T12:01:00",
                  "backToOrigin": false,
                  "limits": {
                    "maxOrders": 5,
                    "maxDistance": 6,
                    "maxTime": 7,
                    "maxCapacity": 50.5,
                    "maxVolume": 60.6
                  }
                }],
                "constraints": {
                  "travelTime": { "weight": 66 },
                  "travelDistance": { "weight":  77 },
                  "maxTime": { "weight":  11 },
                  "maxDistance": { "weight":  22 },
                  "earlyArrival": { "weight":  33 },
                  "lateArrival": { "weight":  44 },
                  "lateDeparture": { "weight":  55 },
                  "orderCount": { "weight":  88 },
                  "virtualVehicle": { "weight":  99 },
                  "vehicleWeight": { "weight":  111 },
                  "vehicleVolume": { "weight":  222 },
                  "orderRequirements": { "weight":  333 }
                }
              }
            }""";
    OptimizationRequest request = json.readValue(jsonObject, OptimizationRequest.class);

    assertEquals(request.getOrders().length, 2);
    assertEquals(request.getFleet().length, 2);

    Order order1 = request.getOrders()[0];
    Order order2 = request.getOrders()[1];

    Fleet fleet1 = request.getFleet()[0];
    Fleet fleet2 = request.getFleet()[1];

    Configuration conf = request.getConfig();

    assertEquals(order1.getId(), "order-1");
    assertEquals(order1.getOrigin(), Location.builder().id("origin-1").longitude(10.1).latitude(20.1).build());
    assertEquals(order1.getDestination(), Location.builder().id("destination-1").longitude(12.1).latitude(22.1).build());
    assertEquals(order1.getServiceTime(), 100);
    assertEquals(order1.getServiceWindow(), TimeWindow.builder()
            .from(LocalDateTime.of(2024, 1, 1, 11, 30, 0))
            .to(LocalDateTime.of(2024, 1, 1, 14, 0, 0))
            .build()
    );
    assertEquals(order1.getAttributes(), OrderAttributes.builder().weight(100.0).volume(2.1).build());

    assertEquals(order2.getId(), "order-2");
    assertEquals(order2.getOrigin(), Location.builder().id("origin-1").longitude(10.1).latitude(20.1).build());
    assertEquals(order2.getDestination(), Location.builder().id("destination-2").longitude(15.1).latitude(25.1).build());
    assertEquals(order2.getServiceTime(), 100);
    assertEquals(order2.getServiceWindow(), TimeWindow.builder()
            .from(LocalDateTime.of(2024, 1, 1, 12, 30, 0))
            .to(LocalDateTime.of(2024, 1, 1, 15, 30, 0))
            .build()
    );
    assertEquals(order2.getAttributes(), OrderAttributes.builder().weight(10.3).volume(2.1).build());

    assertEquals(fleet1.getId(), "f-1");
    assertEquals(fleet1.getStartingLocation(), Location.builder().id("origin-1").longitude(10.1).latitude(20.1).build());
    assertEquals(fleet1.getPreferredDepartureTime(), LocalDateTime.of(2024, 1, 1, 10, 0, 0));
    assertEquals(fleet1.getBackToOrigin(), false);
    assertEquals(fleet1.getLimits(), FleetLimits.builder().maxOrders(1).maxDistance(2).maxTime(3).maxCapacity(200.2).maxVolume(100.1).build());
    assertEquals(fleet1.getAttributes().length, 2);
    assertEquals(fleet1.getAttributes()[0], "fridge");
    assertEquals(fleet1.getAttributes()[1], "freezer");


    assertEquals(fleet2.getId(), "f-2");
    assertEquals(fleet2.getStartingLocation(), Location.builder().id("origin-1").longitude(10.1).latitude(20.1).build());
    assertEquals(fleet2.getPreferredDepartureTime(), LocalDateTime.of(2024, 1, 1, 11, 0, 0));
    assertEquals(fleet2.getBackToOrigin(), true);
    assertEquals(fleet2.getLimits(), FleetLimits.builder().maxOrders(10).maxDistance(20).maxTime(30).maxCapacity(200.3).maxVolume(100.4).build());
    assertEquals(fleet2.getAttributes().length, 1);
    assertEquals(fleet2.getAttributes()[0], "fridge");

    assertEquals(conf.getDistanceMatrixType(), DistanceMatrixType.AIR_DISTANCE);
    assertEquals(conf.getMaxOrders(), 11);
    assertEquals(conf.getMaxDistance(), 22);
    assertEquals(conf.getMaxTime(), 33);
    assertEquals(conf.getBackToOrigin(), false);
    assertEquals(conf.getAvoidTolls(), true);
    assertEquals(conf.getExplain(), true);
    assertEquals(conf.getVehicleDepartureTime(), LocalDateTime.of(2024, 1, 1, 10, 0, 0));
    assertEquals(conf.getVirtualFleet()[0], VirtualFleet.
            builder()
            .size(5)
            .startingLocation(Location.builder()
                    .latitude(11.1)
                    .longitude(22.2)
                    .id("origin-x")
                    .build()
            )
            .preferredDepartureTime(LocalDateTime.of(2024, 1, 1, 12, 1, 0))
            .backToOrigin(false)
            .groupId("g1")
            .limits(FleetLimits.builder()
                    .maxOrders(5)
                    .maxDistance(6)
                    .maxTime(7)
                    .maxCapacity(50.5)
                    .maxVolume(60.6)
                    .build()
            )
            .build()
    );
    assertEquals(conf.getConstraints(), ConstraintsConfiguration.builder()
            .travelDistance(ConstraintData.builder().weight(77).build())
            .travelTime(ConstraintData.builder().weight(66).build())
            .maxTime(ConstraintData.builder().weight(11).build())
            .maxDistance(ConstraintData.builder().weight(22).build())
            .earlyArrival(ConstraintData.builder().weight(33).build())
            .lateArrival(ConstraintData.builder().weight(44).build())
            .lateDeparture(ConstraintData.builder().weight(55).build())
            .orderCount(ConstraintData.builder().weight(88).build())
            .virtualVehicle(ConstraintData.builder().weight(99).build())
            .vehicleWeight(ConstraintData.builder().weight(111).build())
            .vehicleVolume(ConstraintData.builder().weight(222).build())
            .orderRequirements(ConstraintData.builder().weight(333).build())
            .build());
  }
}