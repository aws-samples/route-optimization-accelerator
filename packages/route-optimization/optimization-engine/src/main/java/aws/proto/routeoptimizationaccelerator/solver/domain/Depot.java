/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.solver.domain;

import aws.proto.routeoptimizationaccelerator.common.Location;

public class Depot extends Visit {
    public static Depot fromLocation(Location l) {
        Depot d = new Depot();

        d.setId(l.getId());
        d.setLongitude(l.getLongitude());
        d.setLatitude(l.getLatitude());

        return d;
    }
}
