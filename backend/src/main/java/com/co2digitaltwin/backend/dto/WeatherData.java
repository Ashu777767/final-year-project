package com.co2digitaltwin.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherData {
    private Double temperatureMean;
    private Double temperatureMax;
    private Double temperatureMin;
    private Double precipitationMm;
    private Double windSpeedMaxKmh;
}
