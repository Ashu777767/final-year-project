package com.co2digitaltwin.backend.controller;

import com.co2digitaltwin.backend.client.MlServiceClient;
import com.co2digitaltwin.backend.dto.LocationDetailsResponse;
import com.co2digitaltwin.backend.dto.MlPredictionRequest;
import com.co2digitaltwin.backend.dto.SurveyRequest;
import com.co2digitaltwin.backend.service.GeocodingService;
import com.co2digitaltwin.backend.service.SurveyFeatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/survey")
@CrossOrigin
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyFeatureService surveyFeatureService;
    private final MlServiceClient mlServiceClient;

    @PostMapping("/predict")
    public LocationDetailsResponse predictFromSurvey(@RequestBody SurveyRequest request) {
        MlPredictionRequest features = surveyFeatureService.buildFeaturesFromSurvey(request);
        requirePredictableFeatures(features, request);
        Double baseline = mlServiceClient.predict(features).getPredictedCo2Tonnes();

        return LocationDetailsResponse.builder()
                .status("READY")
                .dataSource("Survey-based estimate")
                .lat(request.getLat())
                .lng(request.getLng())
                .city(request.getCity())
                .state(request.getState())
                .resolution(request.getResolution())
                .features(features)
                .baselineCo2(baseline)
                .build();
    }

    /**
     * Rejects a survey that cannot be turned into the full 22-feature model input.
     * The trained model has no notion of a missing feature and the ML contract is
     * fixed, so a blank or unusable answer is reported to the caller as a 400 naming
     * the field - never as "Internal server error", and never by inventing a value.
     */
    private void requirePredictableFeatures(MlPredictionRequest features, SurveyRequest request) {
        String area = request.getCity() != null && !request.getCity().isBlank() ? request.getCity() : "this area";

        if (features.getLatitude() == null || features.getLongitude() == null) {
            throw new IllegalArgumentException(
                    "The area profile for " + area + " is incomplete: the area has no coordinates.");
        }
        if (!GeocodingService.isValidCoordinate(features.getLatitude(), features.getLongitude())) {
            throw new IllegalArgumentException(
                    "The area profile for " + area + " has invalid coordinates ("
                            + features.getLatitude() + ", " + features.getLongitude()
                            + "). Re-select the area or enter valid coordinates.");
        }

        List<String> missing = new ArrayList<>();
        // Required because the model's population, density and electricity features are
        // all derived from it, and the backend must not substitute a city size the user
        // never supplied just to make a request succeed.
        if (isBlankAnswer(request.getPopulation())) {
            missing.add("estimated population in people (greater than zero)");
        }
        if (features.getAreaKm2() == null || features.getAreaKm2() <= 0) {
            missing.add("area size in km² (greater than zero)");
        }
        if (features.getElectricityKwhPerCapita() == null || features.getEstimatedCityElectricityKwh() == null) {
            missing.add("total electricity consumption in kWh/day (greater than zero)");
        }
        if (!missing.isEmpty()) {
            throw new IllegalArgumentException(
                    "The area profile for " + area + " is incomplete: please provide "
                            + String.join(", ", missing) + ".");
        }
    }

    /** True when the answer carries no usable figure of its own. */
    private boolean isBlankAnswer(String answer) {
        if (answer == null || answer.isBlank()) {
            return true;
        }
        try {
            return Double.parseDouble(answer.trim()) <= 0;
        } catch (NumberFormatException e) {
            // Not numeric: a qualitative level is a legitimately supplied answer.
            return false;
        }
    }
}
