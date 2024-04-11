/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.utils;

import java.util.Map;

public class EnvVariables {
    private static final Map<String, String> env = System.getenv();

    public static String getRegion() {
        return env.get("REGION") != null ? env.get("REGION") : "us-east-1";
    }

    public static String getRouteCalculatorName() {
        return env.get("ROUTE_CALCULATOR");
    }

    public static String optimizationQueue() {
        return env.get("OPTIMIZATION_QUEUE_URL");
    }

    public static String serviceName() {
        return env.get("SERVICE_NAME");
    }

    public static String eventBusName() {
        return env.get("EVENT_BUS_NAME");
    }
}
