/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.data.input;

import aws.proto.routeoptimizationaccelerator.common.Location;
import aws.proto.routeoptimizationaccelerator.data.input.base.BaseFleet;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@EqualsAndHashCode
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class Fleet implements BaseFleet {
    private String id;

    private Location startingLocation;

    private LocalDateTime preferredDepartureTime;

    private Boolean backToOrigin;

    private FleetLimits limits;

    private String[] attributes;
}
