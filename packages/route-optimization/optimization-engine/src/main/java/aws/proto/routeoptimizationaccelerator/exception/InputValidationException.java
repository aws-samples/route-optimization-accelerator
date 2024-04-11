/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.exception;

public class InputValidationException extends Exception {
    public InputValidationException(String errorMessage) {
        super(errorMessage);
    }
}
