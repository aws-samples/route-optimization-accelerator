/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.common;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.apache.commons.lang3.StringUtils;

import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Location extends Position {
    private String id;

    @JsonIgnore
    public boolean isEmpty() {
        return StringUtils.isBlank(this.id) || this.latitude == 0 || this.longitude == 0;
    }

    @Override
    public String toString() {
        return "[id="+ this.id +", lat="+ this.latitude +", lon="+ this.longitude +"]";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Location loc = (Location) o;

        return Objects.equals(this.id, loc.getId()) &&
                Objects.equals(this.latitude, loc.getLatitude()) &&
                Objects.equals(this.longitude, loc.getLongitude());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(this.getId());
    }

}
