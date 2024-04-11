/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.data.input;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@Builder
@EqualsAndHashCode
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class ConstraintsConfiguration {
    private ConstraintData travelTime;

    private ConstraintData travelDistance;

    private ConstraintData maxTime;

    private ConstraintData maxDistance;

    private ConstraintData earlyArrival;

    private ConstraintData lateArrival;

    private ConstraintData lateDeparture;

    private ConstraintData orderCount;

    private ConstraintData virtualVehicle;

    private ConstraintData vehicleWeight;

    private ConstraintData vehicleVolume;

    private ConstraintData orderRequirements;
}
