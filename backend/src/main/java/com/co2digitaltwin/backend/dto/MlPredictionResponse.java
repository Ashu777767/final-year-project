package com.co2digitaltwin.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MlPredictionResponse {
    @JsonProperty("predicted_co2_tonnes")
    private double predictedCo2Tonnes;
}
