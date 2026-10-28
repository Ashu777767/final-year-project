package com.co2digitaltwin.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MlPredictionRequest {
    private Double latitude;
    private Double longitude;
    @JsonProperty("day_of_week")
    private Integer dayOfWeek;
    private Integer month;
    @JsonProperty("day_of_year")
    private Integer dayOfYear;
    @JsonProperty("is_weekend")
    private Integer isWeekend;
    @JsonProperty("population_2011")
    private Double population2011;
    @JsonProperty("population_growth_rate")
    private Double populationGrowthRate;
    @JsonProperty("population_2021_est")
    private Double population2021Est;
    @JsonProperty("area_km2")
    private Double areaKm2;
    @JsonProperty("population_density_2021")
    private Double populationDensity2021;
    @JsonProperty("state_vehicles_per_1000")
    private Double stateVehiclesPer1000;
    @JsonProperty("estimated_city_vehicles")
    private Double estimatedCityVehicles;
    @JsonProperty("vehicle_density_km2")
    private Double vehicleDensityKm2;
    @JsonProperty("electricity_kwh_per_capita")
    private Double electricityKwhPerCapita;
    @JsonProperty("estimated_city_electricity_kwh")
    private Double estimatedCityElectricityKwh;
    @JsonProperty("industrial_electricity_kwh_per_capita")
    private Double industrialElectricityKwhPerCapita;
    @JsonProperty("temperature_mean")
    private Double temperatureMean;
    @JsonProperty("temperature_max")
    private Double temperatureMax;
    @JsonProperty("temperature_min")
    private Double temperatureMin;
    @JsonProperty("precipitation_mm")
    private Double precipitationMm;
    @JsonProperty("wind_speed_max_kmh")
    private Double windSpeedMaxKmh;
}
