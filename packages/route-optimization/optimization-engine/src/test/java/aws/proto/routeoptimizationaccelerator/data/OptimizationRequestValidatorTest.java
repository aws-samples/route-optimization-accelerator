/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.data;

import aws.proto.routeoptimizationaccelerator.data.input.OptimizationRequest;
import aws.proto.routeoptimizationaccelerator.data.mapper.CustomObjectMapper;
import aws.proto.routeoptimizationaccelerator.exception.InputValidationException;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class OptimizationRequestValidatorTest {
    private final CustomObjectMapper json = new CustomObjectMapper();

    @Test
    public void shouldThrowIfProblemIdIsEmpty() throws JsonProcessingException {
        String jsonObject = """
            {
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
              ],
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
                }
              ]
            }""";
        OptimizationRequest request = json.readValue(jsonObject, OptimizationRequest.class);

        Exception exception = assertThrows(InputValidationException.class, () -> new OptimizationRequestValidator(request).isValid(), "should throw if no fleet is provided");
        assertEquals(exception.getMessage(), "'problemId' it's a required field");
    }

    @Test
    public void shouldThrowIfEmptyFleet() throws JsonProcessingException {
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

        Exception exception = assertThrows(InputValidationException.class, () -> new OptimizationRequestValidator(request).isValid(), "should throw if no fleet is provided");
        assertEquals(exception.getMessage(), "At least one fleet member must be provided");
    }

    @Test
    public void shouldThrowIfEmptyOrders() throws JsonProcessingException {
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
                }
              ]
            }""";
        OptimizationRequest request = json.readValue(jsonObject, OptimizationRequest.class);

        Exception exception = assertThrows(InputValidationException.class, () -> new OptimizationRequestValidator(request).isValid(), "should throw if no orders is provided");
        assertEquals(exception.getMessage(), "At least one order must be provided");
    }

    @Test
    public void shouldThrowIfOrderIdIsEmpty() throws JsonProcessingException {
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
                }
              ],
              "orders": [
                {
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
                }
              ]
            }""";
        OptimizationRequest request = json.readValue(jsonObject, OptimizationRequest.class);

        Exception exception = assertThrows(InputValidationException.class, () -> new OptimizationRequestValidator(request).isValid(), "should throw if no fleet is provided");

        assertEquals(exception.getMessage(), "'id' it's a required field for all orders");
    }

    @Test
    public void shouldThrowIfOrderOriginIsEmpty() throws JsonProcessingException {
        String jsonObject = """
            {
              "problemId": "abc",
              "fleet": [
                {
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
                }
              ],
              "orders": [
                {
                  "id": "order-1",
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
                }
              ]
            }""";
        OptimizationRequest request = json.readValue(jsonObject, OptimizationRequest.class);

        Exception exception = assertThrows(InputValidationException.class, () -> new OptimizationRequestValidator(request).isValid(), "should throw if no fleet is provided");

        assertEquals(exception.getMessage(), "'origin' and it's respective fields are required for all orders");
    }

    @Test
    public void shouldThrowIfOrderDestinationIsEmpty() throws JsonProcessingException {
        String jsonObject = """
            {
              "problemId": "abc",
              "fleet": [
                {
                  "id": "fleet-1",
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
                }
              ]
            }""";
        OptimizationRequest request = json.readValue(jsonObject, OptimizationRequest.class);

        Exception exception = assertThrows(InputValidationException.class, () -> new OptimizationRequestValidator(request).isValid(), "should throw if no fleet is provided");

        assertEquals(exception.getMessage(), "'destination' and it's respective fields are required for all orders");
    }

    @Test
    public void shouldThrowIfFleetIdIsEmpty() throws JsonProcessingException {
        String jsonObject = """
            {
              "problemId": "abc",
              "fleet": [
                {
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
                }
              ]
            }""";
        OptimizationRequest request = json.readValue(jsonObject, OptimizationRequest.class);

        Exception exception = assertThrows(InputValidationException.class, () -> new OptimizationRequestValidator(request).isValid(), "should throw if no fleet is provided");

        assertEquals(exception.getMessage(), "'id' it's a required field for all fleet members");
    }

    @Test
    public void shouldThrowIfFleetStartingPositionIsEmpty() throws JsonProcessingException {
        String jsonObject = """
            {
              "problemId": "abc",
              "fleet": [
                {
                  "id": "fleet-1",
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
                }
              ]
            }""";
        OptimizationRequest request = json.readValue(jsonObject, OptimizationRequest.class);

        Exception exception = assertThrows(InputValidationException.class, () -> new OptimizationRequestValidator(request).isValid(), "should throw if no fleet is provided");

        assertEquals(exception.getMessage(), "'startingLocation' and it's respective fields are required for all fleet members");
    }

    @Test
    public void shouldThrowIfOrdersServiceWindowIsMissing() throws JsonProcessingException {
        String jsonObject = """
            {
              "problemId": "abc",
              "fleet": [
                {
                  "id": "fleet-1",
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
                  "attributes": {
                    "weight": 100,
                    "volume": 2.1
                  },
                  "requirements": ["fridge"]
                }
              ]
            }""";
        OptimizationRequest request = json.readValue(jsonObject, OptimizationRequest.class);

        Exception exception = assertThrows(InputValidationException.class, () -> new OptimizationRequestValidator(request).isValid(), "should throw if no fleet is provided");

        assertEquals(exception.getMessage(), "'serviceWindow' must be either defined or empty for every order");
    }

    @Test
    public void shouldThrowIfFleetHasNotEnoughCapacity() throws JsonProcessingException {
        String jsonObject = """
            {
              "problemId": "abc",
              "fleet": [
                {
                  "id": "fleet-1",
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
                    "maxCapacity": 1,
                    "maxVolume": 1
                  },
                  "attributes": ["fridge", "freezer"]
                },
                {
                  "id": "fleet-2",
                  "startingLocation": {
                    "id": "origin-1",
                    "latitude": 20.1,
                    "longitude": 10.1
                  },
                  "preferredDepartureTime": "2024-01-01T10:00:00",
                  "backToOrigin": false,
                  "limits": {
                    "maxCapacity": 1,
                    "maxVolume": 1
                  }
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
                    "volume": 0.5
                  },
                  "requirements": ["fridge"]
                }
              ]
            }""";
        OptimizationRequest request = json.readValue(jsonObject, OptimizationRequest.class);

        Exception exception = assertThrows(InputValidationException.class, () -> new OptimizationRequestValidator(request).isValid(), "should throw if no fleet is provided");

        assertEquals(exception.getMessage(), "Total fleet capacity (2) is not enough to cover total order request (100). You can augment it with virtual vehicles");
    }

    @Test
    public void shouldThrowIfFleetHasNotEnoughVolume() throws JsonProcessingException {
        String jsonObject = """
            {
              "problemId": "abc",
              "fleet": [
                {
                  "id": "fleet-1",
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
                    "maxCapacity": 1,
                    "maxVolume": 1
                  },
                  "attributes": ["fridge", "freezer"]
                },
                {
                  "id": "fleet-2",
                  "startingLocation": {
                    "id": "origin-1",
                    "latitude": 20.1,
                    "longitude": 10.1
                  },
                  "preferredDepartureTime": "2024-01-01T10:00:00",
                  "backToOrigin": false,
                  "limits": {
                    "maxCapacity": 1,
                    "maxVolume": 1
                  }
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
                    "weight": 1,
                    "volume": 10
                  },
                  "requirements": ["fridge"]
                }
              ]
            }""";
        OptimizationRequest request = json.readValue(jsonObject, OptimizationRequest.class);

        Exception exception = assertThrows(InputValidationException.class, () -> new OptimizationRequestValidator(request).isValid(), "should throw if no fleet is provided");

        assertEquals(exception.getMessage(), "Total fleet volume (2) is not enough to cover total order request (10). You can augment it with virtual vehicles");
    }

    @Test
    public void shouldThrowIfFleetPlusVirtualFleetHasNotEnoughCapacity() throws JsonProcessingException {
        String jsonObject = """
            {
              "problemId": "abc",
              "fleet": [
                {
                  "id": "fleet-1",
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
                    "maxCapacity": 1,
                    "maxVolume": 1
                  },
                  "attributes": ["fridge", "freezer"]
                },
                {
                  "id": "fleet-2",
                  "startingLocation": {
                    "id": "origin-1",
                    "latitude": 20.1,
                    "longitude": 10.1
                  },
                  "preferredDepartureTime": "2024-01-01T10:00:00",
                  "backToOrigin": false,
                  "limits": {
                    "maxCapacity": 1,
                    "maxVolume": 1
                  }
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
                    "volume": 0.5
                  },
                  "requirements": ["fridge"]
                }
              ],
              "config": {
                "maxOrders": 11,
                "maxDistance": 22,
                "maxTime": 33,
                "avoidTolls": true,
                "explain": true,
                "virtualFleet": [{
                  "groupId": "g1",
                  "size": 5,
                  "startingLocation": {
                    "id": "origin-1",
                    "latitude": 20.1,
                    "longitude": 10.1
                  },
                  "preferredDepartureTime": "2024-01-01T10:00:00",
                  "backToOrigin": false,
                  "limits": {
                    "maxOrders": 5,
                    "maxDistance": 6,
                    "maxTime": 7,
                    "maxCapacity": 1,
                    "maxVolume": 1
                  }
                }],
                "constraints": {
                  "time": { "value": 66 },
                  "distance": { "value": 77 }
                }
              }
            }""";
        OptimizationRequest request = json.readValue(jsonObject, OptimizationRequest.class);

        Exception exception = assertThrows(InputValidationException.class, () -> new OptimizationRequestValidator(request).isValid(), "should throw if no fleet is provided");

        assertEquals(exception.getMessage(), "Total fleet capacity (7) is not enough to cover total order request (100). You can augment it with virtual vehicles");
    }

    @Test
    public void shouldThrowIfFleetPlusVirtualFleetHasNotEnoughVolume() throws JsonProcessingException {
        String jsonObject = """
            {
              "problemId": "abc",
              "fleet": [
                {
                  "id": "fleet-1",
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
                    "maxCapacity": 1,
                    "maxVolume": 1
                  },
                  "attributes": ["fridge", "freezer"]
                },
                {
                  "id": "fleet-2",
                  "startingLocation": {
                    "id": "origin-1",
                    "latitude": 20.1,
                    "longitude": 10.1
                  },
                  "preferredDepartureTime": "2024-01-01T10:00:00",
                  "backToOrigin": false,
                  "limits": {
                    "maxCapacity": 1,
                    "maxVolume": 1
                  }
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
                    "weight": 2,
                    "volume": 10
                  },
                  "requirements": ["fridge"]
                }
              ],
              "config": {
                "maxOrders": 11,
                "maxDistance": 22,
                "maxTime": 33,
                "avoidTolls": true,
                "explain": true,
                "virtualFleet": [{
                  "groupId": "g1",
                  "size": 5,
                  "startingLocation": {
                    "id": "origin-1",
                    "latitude": 20.1,
                    "longitude": 10.1
                  },
                  "preferredDepartureTime": "2024-01-01T10:00:00",
                  "backToOrigin": false,
                  "limits": {
                    "maxOrders": 5,
                    "maxDistance": 6,
                    "maxTime": 7,
                    "maxCapacity": 1,
                    "maxVolume": 1
                  }
                }],
                "constraints": {
                  "time": { "value": 66 },
                  "distance": { "value": 77 }
                }
              }
            }""";
        OptimizationRequest request = json.readValue(jsonObject, OptimizationRequest.class);

        Exception exception = assertThrows(InputValidationException.class, () -> new OptimizationRequestValidator(request).isValid(), "should throw if no fleet is provided");

        assertEquals(exception.getMessage(), "Total fleet volume (7) is not enough to cover total order request (10). You can augment it with virtual vehicles");
    }

    @Test
    public void shouldNotThrowIfEverythingIsCorrect() throws JsonProcessingException, InputValidationException {
        String jsonObject = """
            {
              "problemId": "abc",
              "fleet": [
                {
                  "id": "fleet-1",
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
                    "maxCapacity": 1,
                    "maxVolume": 10
                  },
                  "attributes": ["fridge", "freezer"]
                },
                {
                  "id": "fleet-2",
                  "startingLocation": {
                    "id": "origin-1",
                    "latitude": 20.1,
                    "longitude": 10.1
                  },
                  "preferredDepartureTime": "2024-01-01T10:00:00",
                  "backToOrigin": false,
                  "limits": {
                    "maxCapacity": 1,
                    "maxVolume": 10
                  }
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
                    "weight": 2,
                    "volume": 10
                  },
                  "requirements": ["fridge"]
                }
              ],
              "config": {
                "maxOrders": 11,
                "maxDistance": 22,
                "maxTime": 33,
                "avoidTolls": true,
                "explain": true,
                "virtualFleet": [{
                  "groupId": "g1",
                  "size": 5,
                  "startingLocation": {
                    "id": "origin-1",
                    "latitude": 20.1,
                    "longitude": 10.1
                  },
                  "preferredDepartureTime": "2024-01-01T10:00:00",
                  "backToOrigin": false,
                  "limits": {
                    "maxOrders": 5,
                    "maxDistance": 6,
                    "maxTime": 7,
                    "maxCapacity": 1,
                    "maxVolume": 1
                  }
                }],
                "constraints": {
                  "time": { "value": 66 },
                  "distance": { "value": 77 }
                }
              }
            }""";
        OptimizationRequest request = json.readValue(jsonObject, OptimizationRequest.class);

        new OptimizationRequestValidator(request).isValid();
    }
}
