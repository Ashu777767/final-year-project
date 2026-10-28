package com.co2digitaltwin.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetRow {
    private String city;
    private String date;
    private Double latitude;
    private Double longitude;
    private Double co2Tonnes;
    private Integer dayOfWeek;
    private Integer month;
    private Integer dayOfYear;
    private Integer isWeekend;
    private Double population2011;
    private Double populationGrowthRate;
    private Double population2021Est;
    private Double areaKm2;
    private String state;
    private Double stateRegisteredVehicles;
    private Double statePopulation2021;
    private Double electricityKwhPerCapita;
    private Double populationDensity2021;
    private Double stateVehiclesPer1000;
    private Double estimatedCityVehicles;
    private Double vehicleDensityKm2;
    private Double estimatedCityElectricityKwh;
    private Double industrialElectricityKwhPerCapita;
    private Double temperatureMean;
    private Double temperatureMax;
    private Double temperatureMin;
    private Double precipitationMm;
    private Double windSpeedMaxKmh;

    public MlPredictionRequest toMlPredictionRequest() {
        return MlPredictionRequest.builder()
                .latitude(latitude)
                .longitude(longitude)
                .dayOfWeek(dayOfWeek)
                .month(month)
                .dayOfYear(dayOfYear)
                .isWeekend(isWeekend)
                .population2011(population2011)
                .populationGrowthRate(populationGrowthRate)
                .population2021Est(population2021Est)
                .areaKm2(areaKm2)
                .populationDensity2021(populationDensity2021)
                .stateVehiclesPer1000(stateVehiclesPer1000)
                .estimatedCityVehicles(estimatedCityVehicles)
                .vehicleDensityKm2(vehicleDensityKm2)
                .electricityKwhPerCapita(electricityKwhPerCapita)
                .estimatedCityElectricityKwh(estimatedCityElectricityKwh)
                .industrialElectricityKwhPerCapita(industrialElectricityKwhPerCapita)
                .temperatureMean(temperatureMean)
                .temperatureMax(temperatureMax)
                .temperatureMin(temperatureMin)
                .precipitationMm(precipitationMm)
                .windSpeedMaxKmh(windSpeedMaxKmh)
                .build();
    }
}
