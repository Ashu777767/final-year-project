package com.co2digitaltwin.backend.service;

import com.co2digitaltwin.backend.data.DatasetRepository;
import com.co2digitaltwin.backend.dto.DatasetRow;
import com.co2digitaltwin.backend.dto.TrafficCo2Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final DatasetRepository datasetRepository;

    /** Buckets used when the requested window is too wide to plot per record. */
    private static final String[] MONTH_LABELS =
            {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

    private static final int MAX_POINTS = 12;

    /**
     * Traffic volume against CO2 for the active area, honouring the selected date
     * window. Narrow windows are plotted per record; wide windows are aggregated
     * into monthly buckets so the chart stays readable.
     */
    public List<TrafficCo2Data> getTrafficVsCo2(String city, String startDate, String endDate) {
        if (!datasetRepository.isCityInDataset(city)) {
            // Areas without dataset coverage keep the illustrative shape.
            return List.of(
                    new TrafficCo2Data("8:00 AM", 8000, 3100),
                    new TrafficCo2Data("12:00 PM", 6500, 2400),
                    new TrafficCo2Data("5:00 PM", 9500, 3800),
                    new TrafficCo2Data("9:00 PM", 4000, 1800)
            );
        }

        List<DatasetRow> rows = datasetRepository.getRowsForCityInRange(city, parse(startDate), parse(endDate), 4000);
        if (rows.isEmpty()) {
            rows = datasetRepository.getAllRowsForCity(city);
        }

        if (rows.size() <= MAX_POINTS) {
            List<TrafficCo2Data> perRecord = new ArrayList<>();
            int index = 1;
            for (DatasetRow row : rows) {
                double density = row.getVehicleDensityKm2() != null ? row.getVehicleDensityKm2() : 0.0;
                double co2 = row.getCo2Tonnes() != null ? row.getCo2Tonnes() : 0.0;
                // Reported in tonnes/day, the same unit as the model target and the
                // headline prediction (no x1000 conversion here).
                perRecord.add(new TrafficCo2Data(
                        row.getDate() != null ? row.getDate() : ("Record " + index),
                        (int) Math.round(density),
                        round2(co2)));
                index++;
            }
            return perRecord;
        }

        double[] densitySum = new double[12];
        double[] co2Sum = new double[12];
        int[] count = new int[12];
        for (DatasetRow row : rows) {
            Integer month = row.getMonth();
            if (month == null || month < 1 || month > 12) continue;
            densitySum[month - 1] += row.getVehicleDensityKm2() != null ? row.getVehicleDensityKm2() : 0.0;
            co2Sum[month - 1] += row.getCo2Tonnes() != null ? row.getCo2Tonnes() : 0.0;
            count[month - 1]++;
        }

        List<TrafficCo2Data> monthly = new ArrayList<>();
        for (int m = 0; m < 12; m++) {
            if (count[m] == 0) continue;
            monthly.add(new TrafficCo2Data(
                    MONTH_LABELS[m],
                    (int) Math.round(densitySum[m] / count[m]),
                    round2(co2Sum[m] / count[m])));
        }

        return monthly.isEmpty() ? List.of() : monthly;
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private static LocalDate parse(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDate.parse(value.trim());
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}
