package com.co2digitaltwin.backend.service;

import com.co2digitaltwin.backend.dto.KpiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KpiService {

    /**
     * Scope note (see README / dataset semantics):
     * The Random Forest predicts `co2_tonnes` for a single sampled location, i.e. a
     * modelled local CO2 emission rate in tonnes per day. It is NOT a city-wide
     * emissions inventory, so the headline metric below is deliberately labelled as
     * a modelled area value rather than "total emissions".
     */
    public KpiResponse getKpiData(String city, Double baseline) {
        String areaLabel = (city == null || city.isBlank()) ? "selected area" : city;

        if (baseline == null) {
            // No prediction available yet for this area.
            return KpiResponse.builder()
                    .totalEmissions(new com.co2digitaltwin.backend.dto.KpiMetric(0.0, "tonnes/day", 0.0, "Modelled CO₂ — " + areaLabel))
                    .averageCo2(new com.co2digitaltwin.backend.dto.KpiMetric(0.0, "kg/day", 0.0, "Modelled CO₂ (kg)"))
                    .activeHotspots(new com.co2digitaltwin.backend.dto.KpiMetric(0, "areas", 0.0, "Monitored Sample Areas"))
                    .capturePotential(new com.co2digitaltwin.backend.dto.KpiMetric(0, "%", 0.0, "Capture Potential"))
                    .build();
        }

        // Same quantity expressed in both units, converted correctly (x1000).
        double tonnesPerDay = baseline;
        double kgPerDay = baseline * 1000.0;

        return KpiResponse.builder()
                .totalEmissions(new com.co2digitaltwin.backend.dto.KpiMetric(
                        round2(tonnesPerDay), "tonnes/day", 2.4, "Modelled CO₂ — " + areaLabel))
                .averageCo2(new com.co2digitaltwin.backend.dto.KpiMetric(
                        round2(kgPerDay), "kg/day", -1.2, "Same value in kg/day"))
                .activeHotspots(new com.co2digitaltwin.backend.dto.KpiMetric(3, "areas", 0.0, "Monitored Sample Areas"))
                .capturePotential(new com.co2digitaltwin.backend.dto.KpiMetric(15, "%", 5.0, "Capture Potential"))
                .build();
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
