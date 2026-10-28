package com.co2digitaltwin.backend.service;

import com.co2digitaltwin.backend.data.DatasetRepository;
import com.co2digitaltwin.backend.dto.DatasetRow;
import com.co2digitaltwin.backend.dto.ScenarioResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScenarioService {

    private final DatasetRepository datasetRepository;

    /**
     * Intervention scenarios for the active area.
     *
     * Every value uses the same scope and unit: modelled area CO2 in TONNES PER DAY,
     * derived from the area's observed mean. Baseline and projected values are
     * therefore directly comparable, and no city-total claim is made.
     */
    public List<ScenarioResponse> getScenarios(String city) {
        double baselineTonnesPerDay = resolveBaselineTonnesPerDay(city);
        String area = (city == null || city.isBlank()) ? "Current State" : city + " — Current State";

        return List.of(
                scenario(area, baselineTonnesPerDay, 0.0, "—", "—", "Baseline"),
                scenario("Tree Plantation", baselineTonnesPerDay, 0.08, "₹15 L", "8.0%", "Moderate"),
                scenario("Green Corridor", baselineTonnesPerDay, 0.12, "₹28 L", "12.0%", "High"),
                scenario("Traffic Reduction", baselineTonnesPerDay, 0.15, "₹42 L", "15.0%", "High"),
                scenario("CO₂ Capture Units", baselineTonnesPerDay, 0.20, "₹65 L", "20.0%", "Very High")
        );
    }

    private ScenarioResponse scenario(String label, double baselineTonnesPerDay, double reductionRate,
                                      String cost, String efficiency, String status) {
        double co2 = baselineTonnesPerDay * (1.0 - reductionRate);
        double reduction = baselineTonnesPerDay * reductionRate;
        return ScenarioResponse.builder()
                .scenario(label)
                .co2(round2(co2))
                .reduction(round2(reduction))
                .cost(cost)
                .efficiency(efficiency)
                .status(status)
                .build();
    }

    /**
     * Mean observed modelled CO2 (tonnes/day) for the active area when the dataset
     * covers it, otherwise the dataset-wide mean. Same scope as the ML prediction.
     */
    private double resolveBaselineTonnesPerDay(String city) {
        if (city != null && !city.isBlank() && datasetRepository.isCityInDataset(city)) {
            double averageTonnes = datasetRepository.getAllRowsForCity(city).stream()
                    .map(DatasetRow::getCo2Tonnes)
                    .filter(v -> v != null)
                    .mapToDouble(Double::doubleValue)
                    .average()
                    .orElse(0.0);
            if (averageTonnes > 0) {
                return averageTonnes;
            }
        }
        return datasetRepository.getAverageCo2Tonnes();
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
