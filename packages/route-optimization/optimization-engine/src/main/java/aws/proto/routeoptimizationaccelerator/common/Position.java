/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.common;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.Collection;

@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class Position {
    protected double latitude;

    protected double longitude;

    public static Position from(Position p) {
        return Position.builder()
                .longitude(p.getLongitude())
                .latitude(p.getLatitude())
                .build();
    }

    public static Position from(Double lon, Double lat) {
        return Position.builder()
                .longitude(lon)
                .latitude(lat)
                .build();
    }

    public static Position from(Collection<Double> coords) {
        return Position.builder()
                .longitude((Double) coords.toArray()[0])
                .latitude((Double) coords.toArray()[1])
                .build();
    }

    @JsonIgnore
    public double[] getPoint() {
        return new double[] {
                this.getLongitude(),
                this.getLatitude()
        };
    }
}

