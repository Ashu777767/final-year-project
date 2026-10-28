package com.co2digitaltwin.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiResponse {
    private KpiMetric totalEmissions;
    private KpiMetric averageCo2;
    private KpiMetric activeHotspots;
    private KpiMetric capturePotential;
}
