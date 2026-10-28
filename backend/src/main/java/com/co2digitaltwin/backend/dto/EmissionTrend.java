package com.co2digitaltwin.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One point on the modelled CO2 trend.
 *
 * Semantics: `emissions` is the MEAN modelled CO2 of all sampled locations for the
 * area within that month, in TONNES PER DAY. It is not a monthly sum and not a
 * city-wide inventory - see the dataset scope note in EmissionsService.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmissionTrend {
    private String month;
    /** Mean modelled CO2 for the month, tonnes/day. */
    private double emissions;
    /**
     * Derived scenario capture estimate for the same value, tonnes/day.
     * There is no measured capture column in the dataset, so this is an assumption.
     */
    private double captured;
}
