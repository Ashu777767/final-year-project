package com.co2digitaltwin.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationResponse {
    private int before;
    private int after;
    private int reduction;
    private String reductionPercent;
    private String area;
    private String intervention;
}
