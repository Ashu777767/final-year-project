package com.co2digitaltwin.backend.service;

import com.co2digitaltwin.backend.data.DatasetRepository;
import com.co2digitaltwin.backend.dto.AreaEmission;
import com.co2digitaltwin.backend.dto.DatasetRow;
import com.co2digitaltwin.backend.dto.EmissionTrend;
import com.co2digitaltwin.backend.dto.SourceDistribution;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmissionsService {

    private final DatasetRepository datasetRepository;

    private static final String[] MONTH_LABELS =
            {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

    /** Fixed scenario assumption for the derived capture series (no measured data). */
    static final double CAPTURE_SCENARIO_RATE = 0.28;

    /**
     * Monthly trend for the active area.
     *
     * The metric is the MEAN modelled CO2 of all sampled locations in that month,
     * expressed in tonnes/day - matching the scope and unit of the headline
     * prediction. It is NOT a monthly total and NOT a city-wide inventory, and it is
     * never scaled to look larger.
     *
     * Falls back to a neutral 7-day shape for areas the dataset does not cover.
     */
    public List<EmissionTrend> getEmissionTrends(String city, String startDate, String endDate) {
        List<DatasetRow> rows = filteredRows(city, startDate, endDate);

        if (!rows.isEmpty()) {
            double[] monthlySum = new double[12];
            int[] monthlyCount = new int[12];

            for (DatasetRow row : rows) {
                Integer month = row.getMonth();
                if (month == null || month < 1 || month > 12) continue;
                monthlySum[month - 1] += row.getCo2Tonnes() != null ? row.getCo2Tonnes() : 0.0;
                monthlyCount[month - 1]++;
            }

            List<EmissionTrend> trends = new ArrayList<>();
            for (int m = 0; m < 12; m++) {
                if (monthlyCount[m] == 0) continue;
                double meanTonnesPerDay = monthlySum[m] / monthlyCount[m];
                // Derived scenario estimate only - the dataset has no capture column.
                double scenarioCapture = meanTonnesPerDay * CAPTURE_SCENARIO_RATE;
                trends.add(new EmissionTrend(MONTH_LABELS[m], round2(meanTonnesPerDay), round2(scenarioCapture)));
            }

            if (!trends.isEmpty()) {
                return trends;
            }
        }

        // Illustrative fallback shape for areas without dataset coverage (tonnes/day).
        return List.of(
                new EmissionTrend("Mon", 0.42, 0.12),
                new EmissionTrend("Tue", 0.45, 0.13),
                new EmissionTrend("Wed", 0.48, 0.13),
                new EmissionTrend("Thu", 0.47, 0.13),
                new EmissionTrend("Fri", 0.52, 0.15),
                new EmissionTrend("Sat", 0.38, 0.11),
                new EmissionTrend("Sun", 0.31, 0.09)
        );
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    /**
     * Modelled zone breakdown for the active area.
     *
     * The engineered dataset contains no locality names, so these zones are DERIVED
     * from the area's observed mean and must not be presented as real neighbourhoods
     * or administrative wards. They are labelled as modelled zones for that reason.
     */
    public List<AreaEmission> getAreaEmissions(String city) {
        double meanTonnes = datasetRepository.isCityInDataset(city)
                ? meanCo2Tonnes(datasetRepository.getAllRowsForCity(city))
                : datasetRepository.getAverageCo2Tonnes();
        int baseline = meanTonnes > 0 ? (int) Math.round(meanTonnes * 1000.0) : 842;

        return List.of(
                areaEmission("Modelled Zone 1", baseline, 1.00),
                areaEmission("Modelled Zone 2", baseline, 0.77),
                areaEmission("Modelled Zone 3", baseline, 0.69),
                areaEmission("Modelled Zone 4", baseline, 0.58),
                areaEmission("Modelled Zone 5", baseline, 0.51)
        );
    }

    private AreaEmission areaEmission(String area, int baseline, double factor) {
        int emissions = (int) Math.round(baseline * factor);
        return AreaEmission.builder()
                .area(area)
                .emissions(emissions)
                .risk(riskFor(emissions))
                .build();
    }

    /**
     * Sector split for the active area. The transport and industrial shares are
     * scaled by the area's own vehicle density and industrial electricity use, so
     * the split differs per city; residential/commercial take the remainder.
     */
    public List<SourceDistribution> getSourceDistribution(String city, String startDate, String endDate) {
        List<DatasetRow> rows = filteredRows(city, startDate, endDate);

        double transport = 42.0;
        double industrial = 28.0;

        if (!rows.isEmpty()) {
            DatasetRow first = rows.get(0);
            double vehicleDensity = first.getVehicleDensityKm2() != null ? first.getVehicleDensityKm2() : 3000.0;
            double industrialPerCapita = first.getIndustrialElectricityKwhPerCapita() != null
                    ? first.getIndustrialElectricityKwhPerCapita() : 150.0;

            transport = clamp(25.0 + (vehicleDensity / 400.0), 20.0, 60.0);
            industrial = clamp(12.0 + (industrialPerCapita / 20.0), 10.0, 45.0);

            double total = transport + industrial;
            if (total > 85.0) {
                double scale = 85.0 / total;
                transport *= scale;
                industrial *= scale;
            }
        }

        double residential = (100.0 - transport - industrial) * 0.62;
        double commercial = 100.0 - transport - industrial - residential;

        return List.of(
                new SourceDistribution("Traffic", roundInt(transport), "#3b82f6"),
                new SourceDistribution("Industrial", roundInt(industrial), "#ef4444"),
                new SourceDistribution("Residential", roundInt(residential), "#10b981"),
                new SourceDistribution("Commercial", roundInt(commercial), "#f59e0b")
        );
    }

    private List<DatasetRow> filteredRows(String city, String startDate, String endDate) {
        if (!datasetRepository.isCityInDataset(city)) {
            return List.of();
        }
        LocalDate start = parse(startDate);
        LocalDate end = parse(endDate);
        if (start == null && end == null) {
            return datasetRepository.getAllRowsForCity(city);
        }
        // Cap the scan so an open-ended range cannot walk all 10k rows per city.
        return datasetRepository.getRowsForCityInRange(city, start, end, 4000);
    }

    private static LocalDate parse(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDate.parse(value.trim());
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private static double meanCo2Tonnes(List<DatasetRow> rows) {
        return rows.stream()
                .map(DatasetRow::getCo2Tonnes)
                .filter(v -> v != null)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
    }

    private static String riskFor(int emissions) {
        if (emissions >= 4000) return "Critical";
        if (emissions >= 2500) return "High";
        if (emissions >= 1200) return "Medium";
        return "Low";
    }

    private static double clamp(double v, double min, double max) {
        return Math.max(min, Math.min(max, v));
    }

    private static int roundInt(double v) {
        return (int) Math.round(v);
    }

    /** Number of days covered by a range, used by the traffic view. */
    static long daysBetween(LocalDate start, LocalDate end) {
        if (start == null || end == null) return 0;
        return ChronoUnit.DAYS.between(start, end) + 1;
    }
}
