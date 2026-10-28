package com.co2digitaltwin.backend.controller;

import com.co2digitaltwin.backend.dto.ErrorResponse;
import com.co2digitaltwin.backend.dto.PredictionRequest;
import com.co2digitaltwin.backend.dto.PredictionResponse;
import com.co2digitaltwin.backend.service.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;

    @PostMapping("/prediction")
    public ResponseEntity<?> predict(@RequestBody PredictionRequest request) {
        List<String> errors = validatePredictionRequest(request);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.builder()
                            .status(400)
                            .message("Validation failed: " + String.join(", ", errors))
                            .timestamp(Instant.now().toString())
                            .build());
        }

        try {
            PredictionResponse response = predictionService.predict(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ErrorResponse.builder()
                            .status(503)
                            .message("ML service unavailable: " + e.getMessage())
                            .timestamp(Instant.now().toString())
                            .build());
        }
    }

    private List<String> validatePredictionRequest(PredictionRequest r) {
        List<String> errors = new ArrayList<>();
        if (r.getLatitude() == null) errors.add("latitude is required");
        if (r.getLongitude() == null) errors.add("longitude is required");
        if (r.getDayOfWeek() == null) errors.add("dayOfWeek is required");
        if (r.getMonth() == null) errors.add("month is required");
        if (r.getDayOfYear() == null) errors.add("dayOfYear is required");
        if (r.getIsWeekend() == null) errors.add("isWeekend is required");
        if (r.getPopulation2011() == null) errors.add("population2011 is required");
        if (r.getPopulationGrowthRate() == null) errors.add("populationGrowthRate is required");
        if (r.getPopulation2021Est() == null) errors.add("population2021Est is required");
        if (r.getAreaKm2() == null) errors.add("areaKm2 is required");
        if (r.getPopulationDensity2021() == null) errors.add("populationDensity2021 is required");
        if (r.getStateVehiclesPer1000() == null) errors.add("stateVehiclesPer1000 is required");
        if (r.getEstimatedCityVehicles() == null) errors.add("estimatedCityVehicles is required");
        if (r.getVehicleDensityKm2() == null) errors.add("vehicleDensityKm2 is required");
        if (r.getElectricityKwhPerCapita() == null) errors.add("electricityKwhPerCapita is required");
        if (r.getEstimatedCityElectricityKwh() == null) errors.add("estimatedCityElectricityKwh is required");
        if (r.getIndustrialElectricityKwhPerCapita() == null) errors.add("industrialElectricityKwhPerCapita is required");
        if (r.getTemperatureMean() == null) errors.add("temperatureMean is required");
        if (r.getTemperatureMax() == null) errors.add("temperatureMax is required");
        if (r.getTemperatureMin() == null) errors.add("temperatureMin is required");
        if (r.getPrecipitationMm() == null) errors.add("precipitationMm is required");
        if (r.getWindSpeedMaxKmh() == null) errors.add("windSpeedMaxKmh is required");
        return errors;
    }
}
