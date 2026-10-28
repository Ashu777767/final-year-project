package com.co2digitaltwin.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SurveyRequest {
    private String city;
    private String state;
    private Double lat;
    private Double lng;
    /** How the coordinates were obtained, echoed back on the response. */
    private String resolution;
    
    // Categorical variables: Low, Medium, High, Very High
    private String population;
    private String traffic;
    private String industry;
    private String electricity;

    // Optional numeric area reported by the user (km²), sent as "area_km2"
    @JsonProperty("area_km2")
    private Double areaKm2;

    private WeatherData weather;
}
