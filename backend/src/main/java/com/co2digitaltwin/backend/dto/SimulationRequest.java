package com.co2digitaltwin.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationRequest {
    private String area;
    private String interventionType;
    private int intensity;
    private Double baselineCo2;
    private Double parameterValue;
}
