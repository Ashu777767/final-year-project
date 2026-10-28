package com.co2digitaltwin.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One intervention scenario.
 *
 * Scope: `co2` and `reduction` are modelled area CO2 in TONNES PER DAY - the same
 * scope and unit as the headline prediction. They are not city-wide inventories.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScenarioResponse {
    private String scenario;
    /** Modelled area CO2 under this scenario, tonnes/day. */
    private double co2;
    /** Reduction against the baseline, tonnes/day. */
    private double reduction;
    private String cost;
    private String efficiency;
    private String status;
}
