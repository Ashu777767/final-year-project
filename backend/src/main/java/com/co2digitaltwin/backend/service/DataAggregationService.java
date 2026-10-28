package com.co2digitaltwin.backend.service;

import com.co2digitaltwin.backend.client.MlServiceClient;
import com.co2digitaltwin.backend.data.DatasetRepository;
import com.co2digitaltwin.backend.dto.DatasetRow;
import com.co2digitaltwin.backend.dto.LocationDetailsResponse;
import com.co2digitaltwin.backend.dto.WeatherData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataAggregationService {

    private final DatasetRepository datasetRepository;
    private final WeatherService weatherService;
    private final MlServiceClient mlServiceClient;

    public LocationDetailsResponse getLocationDetails(String city, String state, Double lat, Double lng) {
        log.info("Fetching details for city: {}, state: {}, lat: {}, lng: {}", city, state, lat, lng);
        
        Optional<DatasetRow> datasetRow = datasetRepository.getRowForCity(city);
        
        if (datasetRow.isPresent()) {
            log.info("City {} found in dataset.", city);
            Double baseline = null;
            try {
                baseline = mlServiceClient.predict(datasetRow.get().toMlPredictionRequest()).getPredictedCo2Tonnes();
            } catch (Exception e) {
                log.warn("ML prediction failed for city {}: {}. Proceeding without baseline.", city, e.getMessage());
            }
            return LocationDetailsResponse.builder()
                    .city(city)
                    .state(resolveState(state, datasetRow.get().getState()))
                    .lat(datasetRow.get().getLatitude()) 
                    .lng(datasetRow.get().getLongitude())
                    .status("READY")
                    .dataSource("Dataset-backed")
                    .features(datasetRow.get().toMlPredictionRequest())
                    .baselineCo2(baseline)
                    .build();
        }
        
        log.info("City {} not in dataset. Falling back to external APIs.", city);
        WeatherData weather = weatherService.getWeather(lat, lng);
        
        return LocationDetailsResponse.builder()
                .city(city)
                .state(state)
                .lat(lat)
                .lng(lng)
                .status("INSUFFICIENT_DATA")
                .dataSource("Survey Required")
                .weather(weather)
                .build();
    }

    private String resolveState(String requestedState, String datasetState) {
        if (requestedState != null && !requestedState.isBlank()) {
            return requestedState;
        }
        return datasetState;
    }
}
