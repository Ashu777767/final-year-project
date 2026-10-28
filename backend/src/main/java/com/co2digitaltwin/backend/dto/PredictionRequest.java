package com.co2digitaltwin.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionRequest {
    private Double latitude;
    private Double longitude;
    private Integer dayOfWeek;
    private Integer month;
    private Integer dayOfYear;
    private Integer isWeekend;
    private Double population2011;
    private Double populationGrowthRate;
    private Double population2021Est;
    private Double areaKm2;
    private Double populationDensity2021;
    private Double stateVehiclesPer1000;
    private Double estimatedCityVehicles;
    private Double vehicleDensityKm2;
    private Double electricityKwhPerCapita;
    private Double estimatedCityElectricityKwh;
    private Double industrialElectricityKwhPerCapita;
    private Double temperatureMean;
    private Double temperatureMax;
    private Double temperatureMin;
    private Double precipitationMm;
    private Double windSpeedMaxKmh;
}

