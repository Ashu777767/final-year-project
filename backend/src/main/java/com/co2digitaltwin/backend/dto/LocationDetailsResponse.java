package com.co2digitaltwin.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationDetailsResponse {
    private String status; // "READY" or "INSUFFICIENT_DATA"
    private String dataSource; // "Dataset-backed", "API-backed", "Survey-based"
    private Double lat;
    private Double lng;
    private String city;
    private String state; // Administrative state of the selected area, when known
    private WeatherData weather; // Populated if INSUFFICIENT_DATA
    private MlPredictionRequest features; // Populated if READY
    private Double baselineCo2; // Populated if READY
    /** How the coordinates were obtained: exact | pincode | address | locality | landmark | manual. */
    private String resolution;
}
