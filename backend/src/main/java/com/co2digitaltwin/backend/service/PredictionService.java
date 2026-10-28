package com.co2digitaltwin.backend.service;

import com.co2digitaltwin.backend.client.MlServiceClient;
import com.co2digitaltwin.backend.dto.MlPredictionRequest;
import com.co2digitaltwin.backend.dto.MlPredictionResponse;
import com.co2digitaltwin.backend.dto.PredictionRequest;
import com.co2digitaltwin.backend.dto.PredictionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PredictionService {

    private final MlServiceClient mlServiceClient;

    public PredictionResponse predict(PredictionRequest request) {
        MlPredictionRequest mlRequest = MlPredictionRequest.builder()
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .dayOfWeek(request.getDayOfWeek())
                .month(request.getMonth())
                .dayOfYear(request.getDayOfYear())
                .isWeekend(request.getIsWeekend())
                .population2011(request.getPopulation2011())
                .populationGrowthRate(request.getPopulationGrowthRate())
                .population2021Est(request.getPopulation2021Est())
                .areaKm2(request.getAreaKm2())
                .populationDensity2021(request.getPopulationDensity2021())
                .stateVehiclesPer1000(request.getStateVehiclesPer1000())
                .estimatedCityVehicles(request.getEstimatedCityVehicles())
                .vehicleDensityKm2(request.getVehicleDensityKm2())
                .electricityKwhPerCapita(request.getElectricityKwhPerCapita())
                .estimatedCityElectricityKwh(request.getEstimatedCityElectricityKwh())
                .industrialElectricityKwhPerCapita(request.getIndustrialElectricityKwhPerCapita())
                .temperatureMean(request.getTemperatureMean())
                .temperatureMax(request.getTemperatureMax())
                .temperatureMin(request.getTemperatureMin())
                .precipitationMm(request.getPrecipitationMm())
                .windSpeedMaxKmh(request.getWindSpeedMaxKmh())
                .build();

        MlPredictionResponse mlResponse = mlServiceClient.predict(mlRequest);

        return PredictionResponse.builder()
                .predictedCo2Tonnes(mlResponse.getPredictedCo2Tonnes())
                .build();
    }
}
