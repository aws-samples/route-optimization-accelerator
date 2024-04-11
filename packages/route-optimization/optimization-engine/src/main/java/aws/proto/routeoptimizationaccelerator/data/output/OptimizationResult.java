/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.data.output;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
public class OptimizationResult {

    private String problemId;

    //solver score
    private ScoreDetails score;

    // in seconds
    private long solverDuration;

    private ErrorResult error;

    private AssignmentResult[] assignments;

    // TODO: explainability output

    @JsonIgnore
    public static OptimizationResult ofError(String problemId, Exception e) {
        return OptimizationResult.builder()
                .problemId(problemId)
                .error(ErrorResult.builder()
                        .errorMessage(e.getMessage())
                        .errorDetails(e.toString())
                        .build())
                .build();
    }

    @JsonIgnore
    public static OptimizationResult ofInProgress(String problemId) {
        return OptimizationResult.builder()
                .problemId(problemId)
                .build();
    }
}
