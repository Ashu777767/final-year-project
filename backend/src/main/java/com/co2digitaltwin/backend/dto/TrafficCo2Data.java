package com.co2digitaltwin.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrafficCo2Data {
    private String hour;
    /** Vehicles per km² at this bucket. */
    private int traffic;
    /**
     * Modelled CO2 for the sampled location, in tonnes/day - the same unit as the
     * model target. Kept as a double because point values are typically < 1 tonne/day
     * and would be truncated to zero as an integer.
     */
    private double co2;
}
