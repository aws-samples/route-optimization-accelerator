/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class OptimizationEngineTest {
    @Test
    public void shouldExtractTheProblemId() {
        String message = "{\n" +
                "  \"problemId\": \"my-p-id\",\n" +
                "  \"any-other-prop\": \"any\"\n" +
                "}";

        assertEquals("my-p-id", OptimizationEngine.tryExtractProblemId(message));
    }

    @Test
    public void shouldExtractTheProblemIdWithoutWhiteSpaces() {
        String message = "{\n" +
                "  \"problemId\":\"my-p-id\",\n" +
                "  \"any-other-prop\": \"any\"\n" +
                "}";

        assertEquals("my-p-id", OptimizationEngine.tryExtractProblemId(message));
    }

    @Test
    public void shouldExtractTheProblemIdIfNotFirst() {
        String message = "{\n" +
                "  \"propX\":\"valZ\",\n" +
                "  \"problemId\":\"my-p-id\",\n" +
                "  \"any-other-prop\": \"any\"\n" +
                "}";

        assertEquals("my-p-id", OptimizationEngine.tryExtractProblemId(message));
    }

    @Test
    public void shouldReturnNullIfNotPresent() {
        String message = "{\n" +
                "  \"custom-prop-name\":\"my-p-id\",\n" +
                "  \"any-other-prop\": \"any\"\n" +
                "}";

        assertNull(OptimizationEngine.tryExtractProblemId(message));
    }
}
