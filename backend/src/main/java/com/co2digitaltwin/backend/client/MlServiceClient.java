package com.co2digitaltwin.backend.client;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.co2digitaltwin.backend.dto.MlPredictionRequest;
import com.co2digitaltwin.backend.dto.MlPredictionResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class MlServiceClient {

    private final RestClient mlRestClient;

    public MlPredictionResponse predict(MlPredictionRequest request) {
        log.info("Sending prediction request to ML service for lat={}, lng={}", request.getLatitude(), request.getLongitude());
        try {
            MlPredictionResponse response = mlRestClient.post()
                    .uri("/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(MlPredictionResponse.class);
            log.info("ML service returned prediction: {}", response.getPredictedCo2Tonnes());
            return response;
        } catch (Exception e) {
            log.error("Failed to get prediction from ML service: {}", e.getMessage());
            throw new RuntimeException("ML service unavailable: " + e.getMessage(), e);
        }
    }
}
