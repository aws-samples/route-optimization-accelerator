/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.data.output;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import software.amazon.awssdk.services.sqs.endpoints.internal.Value;

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
public class AssignmentResult {

    private String fleetId;

    private OrderResult[] orders;

    private LocalDateTime departureTime;

    @JsonProperty("isVirtual")
    private boolean isVirtual;

    private String virtualGroupId;

    // in KMs
    private double totalTravelDistance;

    // in seconds
    private long totalTimeDuration;

    private double totalWeight;

    private double totalVolume;
}
