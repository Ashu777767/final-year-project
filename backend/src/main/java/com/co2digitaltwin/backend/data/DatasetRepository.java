package com.co2digitaltwin.backend.data;

import com.co2digitaltwin.backend.dto.DatasetRow;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Repository;

import jakarta.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@Slf4j
public class DatasetRepository {

    // Index by lowercased city name -> Map of Date string -> DatasetRow
    // We also keep a list of all rows for a city for hotspot calculation
    private final Map<String, List<DatasetRow>> cityToRows = new ConcurrentHashMap<>();

    // Dataset-wide mean of co2_tonnes, computed once at load time.
    private volatile double averageCo2Tonnes = 0.0;

    @PostConstruct
    public void init() {
        log.info("Loading CHETNA_CO2_Final_Engineered_Dataset.csv into memory...");
        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                new ClassPathResource("CHETNA_CO2_Final_Engineered_Dataset.csv").getInputStream()))) {
            
            String header = br.readLine(); // skip header
            String line;
            int count = 0;
            while ((line = br.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                String[] cols = line.split(",");
                if (cols.length < 28) continue;
                
                try {
                    DatasetRow row = DatasetRow.builder()
                            .city(cols[0])
                            .date(cols[1])
                            .latitude(Double.parseDouble(cols[2]))
                            .longitude(Double.parseDouble(cols[3]))
                            .co2Tonnes(Double.parseDouble(cols[4]))
                            .dayOfWeek(Integer.parseInt(cols[5]))
                            .month(Integer.parseInt(cols[6]))
                            .dayOfYear(Integer.parseInt(cols[7]))
                            .isWeekend(Integer.parseInt(cols[8]))
                            .population2011(Double.parseDouble(cols[9]))
                            .populationGrowthRate(Double.parseDouble(cols[10]))
                            .population2021Est(Double.parseDouble(cols[11]))
                            .areaKm2(Double.parseDouble(cols[12]))
                            .state(cols[13])
                            .stateRegisteredVehicles(Double.parseDouble(cols[14]))
                            .statePopulation2021(Double.parseDouble(cols[15]))
                            .electricityKwhPerCapita(Double.parseDouble(cols[16]))
                            .populationDensity2021(Double.parseDouble(cols[17]))
                            .stateVehiclesPer1000(Double.parseDouble(cols[18]))
                            .estimatedCityVehicles(Double.parseDouble(cols[19]))
                            .vehicleDensityKm2(Double.parseDouble(cols[20]))
                            .estimatedCityElectricityKwh(Double.parseDouble(cols[21]))
                            .industrialElectricityKwhPerCapita(Double.parseDouble(cols[22]))
                            .temperatureMean(Double.parseDouble(cols[23]))
                            .temperatureMax(Double.parseDouble(cols[24]))
                            .temperatureMin(Double.parseDouble(cols[25]))
                            .precipitationMm(Double.parseDouble(cols[26]))
                            .windSpeedMaxKmh(Double.parseDouble(cols[27]))
                            .build();
                    
                    String cityKey = row.getCity().toLowerCase();
                    cityToRows.computeIfAbsent(cityKey, k -> new ArrayList<>()).add(row);
                    count++;
                } catch (Exception e) {
                    log.warn("Failed to parse row: {}", line, e);
                }
            }
            log.info("Successfully loaded {} rows into memory. Indexed {} cities.", count, cityToRows.size());
            computeAverageCo2Tonnes();
        } catch (Exception e) {
            log.error("Failed to load dataset!", e);
        }
    }

    private void computeAverageCo2Tonnes() {
        double sum = 0.0;
        long n = 0;
        for (List<DatasetRow> rows : cityToRows.values()) {
            for (DatasetRow row : rows) {
                if (row.getCo2Tonnes() != null) {
                    sum += row.getCo2Tonnes();
                    n++;
                }
            }
        }
        averageCo2Tonnes = n > 0 ? (sum / n) : 0.0;
        log.info("Dataset mean co2_tonnes = {}", averageCo2Tonnes);
    }

    /** Mean observed CO2 (tonnes) across the whole engineered dataset. */
    public double getAverageCo2Tonnes() {
        return averageCo2Tonnes;
    }

    public boolean isCityInDataset(String city) {
        if (city == null) return false;
        return cityToRows.containsKey(city.toLowerCase());
    }

    public Optional<DatasetRow> getRowForCity(String city) {
        if (!isCityInDataset(city)) return Optional.empty();
        List<DatasetRow> rows = cityToRows.get(city.toLowerCase());
        if (rows.isEmpty()) return Optional.empty();
        // Return the first row as the default representative row for that city for now
        // In a real system we'd match the date, but for the digital twin we just need any valid real row.
        return Optional.of(rows.get(0));
    }

    public List<DatasetRow> getAllRowsForCity(String city) {
        if (!isCityInDataset(city)) return Collections.emptyList();
        return cityToRows.get(city.toLowerCase());
    }

    /**
     * Rows for a city whose date falls inside [start, end]. A null bound is open.
     * Date strings in the dataset are ISO yyyy-MM-dd, so lexicographic comparison
     * is equivalent to chronological comparison.
     *
     * @param limit maximum number of rows to return (guards against huge scans)
     */
    public List<DatasetRow> getRowsForCityInRange(String city, LocalDate start, LocalDate end, int limit) {
        if (!isCityInDataset(city)) return Collections.emptyList();

        String startStr = start != null ? start.toString() : null;
        String endStr = end != null ? end.toString() : null;

        List<DatasetRow> matches = new ArrayList<>();
        for (DatasetRow row : cityToRows.get(city.toLowerCase())) {
            String date = row.getDate();
            if (date == null) continue;
            if (startStr != null && date.compareTo(startStr) < 0) continue;
            if (endStr != null && date.compareTo(endStr) > 0) continue;
            matches.add(row);
            if (matches.size() >= limit) break;
        }
        return matches;
    }
}
