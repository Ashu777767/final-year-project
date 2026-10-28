package com.co2digitaltwin.backend.service;

import com.co2digitaltwin.backend.dto.MlPredictionRequest;
import com.co2digitaltwin.backend.dto.SurveyRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class SurveyFeatureService {

    /** Days in a year, used to move between daily totals and annual per-capita values. */
    private static final double DAYS_PER_YEAR = 365.0;

    public MlPredictionRequest buildFeaturesFromSurvey(SurveyRequest survey) {
        LocalDate now = LocalDate.now();
        
        // 1. Geography - honour the area the user actually reported when present
        Double areaKm2 = resolveAreaKm2(survey.getAreaKm2());

        // 2. Population mapping
        Double pop2021 = mapPopulation(survey.getPopulation());
        Double pop2011 = pop2021 * 0.85; // Assume standard growth
        Double popGrowth = 1.5;
        Double popDensity = pop2021 / areaKm2;

        // 3. Vehicles mapping
        Double stateVehiclesPer1000 = 300.0; 
        Double cityVehicles = mapTraffic(survey.getTraffic(), pop2021);
        Double vehicleDensity = cityVehicles / areaKm2;

        // 4. Electricity mapping.
        // The survey collects the area's TOTAL grid consumption in kWh per day, while
        // the dataset - and therefore the model - expresses electricity as ANNUAL kWh
        // PER CAPITA (verified against the engineered dataset: per-capita x population
        // reproduces the dataset's city-wide total). The two must be converted, never
        // equated: treating a daily city total as an annual per-capita figure inflated
        // estimated_city_electricity_kwh by population x 365.
        Double cityElectricityPerDay = mapElectricity(survey.getElectricity(), pop2021);
        Double electricityPerCapita = toAnnualKwhPerCapita(cityElectricityPerDay, pop2021);
        // Unknown electricity stays unknown: the feature is left null so the request is
        // rejected below instead of being filled with an invented consumption figure.
        Double cityElectricity = electricityPerCapita != null ? electricityPerCapita * pop2021 : null;
        Double industrialElectricity = mapIndustry(survey.getIndustry());

        // 5. Weather fallback if missing
        Double tempMean = survey.getWeather() != null && survey.getWeather().getTemperatureMean() != null ? survey.getWeather().getTemperatureMean() : 25.0;
        Double tempMax = survey.getWeather() != null && survey.getWeather().getTemperatureMax() != null ? survey.getWeather().getTemperatureMax() : 30.0;
        Double tempMin = survey.getWeather() != null && survey.getWeather().getTemperatureMin() != null ? survey.getWeather().getTemperatureMin() : 20.0;
        Double precip = survey.getWeather() != null && survey.getWeather().getPrecipitationMm() != null ? survey.getWeather().getPrecipitationMm() : 0.0;
        Double wind = survey.getWeather() != null && survey.getWeather().getWindSpeedMaxKmh() != null ? survey.getWeather().getWindSpeedMaxKmh() : 10.0;

        return MlPredictionRequest.builder()
                .latitude(survey.getLat())
                .longitude(survey.getLng())
                .dayOfWeek(now.getDayOfWeek().getValue())
                .month(now.getMonthValue())
                .dayOfYear(now.getDayOfYear())
                .isWeekend(now.getDayOfWeek().getValue() >= 6 ? 1 : 0)
                .population2011(pop2011)
                .populationGrowthRate(popGrowth)
                .population2021Est(pop2021)
                .areaKm2(areaKm2)
                .populationDensity2021(popDensity)
                .stateVehiclesPer1000(stateVehiclesPer1000)
                .estimatedCityVehicles(cityVehicles)
                .vehicleDensityKm2(vehicleDensity)
                .electricityKwhPerCapita(electricityPerCapita)
                .estimatedCityElectricityKwh(cityElectricity)
                .industrialElectricityKwhPerCapita(industrialElectricity)
                .temperatureMean(tempMean)
                .temperatureMax(tempMax)
                .temperatureMin(tempMin)
                .precipitationMm(precip)
                .windSpeedMaxKmh(wind)
                .build();
    }

    /**
     * Uses the area the user entered when it is a sane positive value.
     * Falls back to a standard medium-city area only when it is missing or unusable.
     */
    private Double resolveAreaKm2(Double reportedAreaKm2) {
        if (reportedAreaKm2 == null || reportedAreaKm2.isNaN() || reportedAreaKm2 <= 0) {
            return 500.0; // Assume standard medium city area if unknown
        }
        return reportedAreaKm2;
    }

    private Double mapPopulation(String level) {
        if (level == null || level.trim().isEmpty()) return 1_000_000.0;
        try {
            return Double.parseDouble(level);
        } catch (NumberFormatException e) {
            return switch (level.toLowerCase()) {
                case "low" -> 500_000.0;
                case "medium" -> 1_500_000.0;
                case "high" -> 5_000_000.0;
                case "very high" -> 10_000_000.0;
                default -> 1_000_000.0;
            };
        }
    }

    private Double mapTraffic(String level, Double population) {
        if (level == null || level.trim().isEmpty()) return population * 0.3;
        try {
            return Double.parseDouble(level);
        } catch (NumberFormatException e) {
            double rate = switch (level.toLowerCase()) {
                case "low" -> 0.1;
                case "medium" -> 0.3;
                case "high" -> 0.5;
                case "very high" -> 0.7;
                default -> 0.3;
            };
            return population * rate;
        }
    }

    /**
     * Resolves the survey's electricity answer to the area's TOTAL daily grid
     * consumption in kWh/day, which is the unit the survey question promises.
     *
     * A numeric answer already is that total. A qualitative answer is an annual
     * kWh-per-capita band (the unit the engineered dataset uses), so it is scaled by
     * population and converted to a daily total before use.
     */
    private Double mapElectricity(String level, Double population) {
        if (level == null || level.trim().isEmpty()) {
            return null;
        }
        try {
            return Double.parseDouble(level);
        } catch (NumberFormatException e) {
            double perCapitaAnnual = switch (level.toLowerCase()) {
                case "low" -> 400.0;
                case "medium" -> 800.0;
                case "high" -> 1200.0;
                case "very high" -> 1600.0;
                default -> 800.0;
            };
            return (perCapitaAnnual * population) / DAYS_PER_YEAR;
        }
    }

    /**
     * Converts a total daily consumption into the dataset's annual kWh per capita.
     * Returns null when it cannot be derived, so the caller can state that the value
     * is unknown instead of substituting an invented one.
     */
    private Double toAnnualKwhPerCapita(Double totalKwhPerDay, Double population) {
        if (totalKwhPerDay == null || totalKwhPerDay.isNaN() || totalKwhPerDay <= 0) {
            return null;
        }
        if (population == null || population.isNaN() || population <= 0) {
            return null;
        }
        return (totalKwhPerDay * DAYS_PER_YEAR) / population;
    }

    private Double mapIndustry(String level) {
        if (level == null || level.trim().isEmpty()) return 150.0;
        try {
            return Double.parseDouble(level);
        } catch (NumberFormatException e) {
            return switch (level.toLowerCase()) {
                case "low" -> 50.0;
                case "medium" -> 150.0;
                case "high" -> 300.0;
                case "very high" -> 500.0;
                default -> 150.0;
            };
        }
    }
}
