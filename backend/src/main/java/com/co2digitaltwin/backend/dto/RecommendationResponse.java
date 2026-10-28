package com.co2digitaltwin.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {
    private int id;
    private String hotspot;
    private int co2Level;
    private String traffic;
    private String risk;
    private String recommended;
    private String expectedImpact;
    private String reasoning;
    private String expectedReduction;
    private String difficulty;
    private String estimatedCost;
    private String timeframe;
}
