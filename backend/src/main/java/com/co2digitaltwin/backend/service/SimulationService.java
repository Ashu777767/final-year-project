package com.co2digitaltwin.backend.service;

import com.co2digitaltwin.backend.dto.SimulationRequest;
import com.co2digitaltwin.backend.dto.SimulationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class SimulationService {

    public SimulationResponse runSimulation(SimulationRequest request) {
        double baseCo2 = request.getBaselineCo2() != null ? request.getBaselineCo2() : 3.0;
        double reduction = 0.0;
        double param = request.getParameterValue() != null ? request.getParameterValue() : request.getIntensity();

        String type = request.getInterventionType() != null ? request.getInterventionType() : "";
        
        switch (type) {
            case "Traffic Reduction":
                // param is % reduction. Assuming traffic is ~60% of emissions
                reduction = baseCo2 * 0.6 * (param / 100.0);
                break;
            case "CO2 Capture Unit":
                // param is number of units, assume each unit captures 0.05 tonnes (50kg) per day
                reduction = param * 0.05;
                break;
            case "Biofilter":
                // param is area in m2, assume 0.0001 tonnes per m2
                reduction = param * 0.0001;
                break;
            case "Tree Plantation":
                // param is number of trees, assume 0.00006 tonnes per tree per day
                reduction = param * 0.00006;
                break;
            case "Green Corridor":
                // param is km2. assume 0.5 tonnes per km2
                reduction = param * 0.5;
                break;
            case "Energy Efficiency":
                // param is % reduction. Assume electricity is 30% of emissions
                reduction = baseCo2 * 0.3 * (param / 100.0);
                break;
            default:
                // fallback to old intensity math
                reduction = baseCo2 * (request.getIntensity() / 100.0) * 0.1;
                break;
        }

        // limit reduction so it doesn't exceed baseline
        if (reduction > baseCo2) reduction = baseCo2;
        if (reduction < 0) reduction = 0;

        double afterCo2 = baseCo2 - reduction;
        double reductionPercent = (reduction / baseCo2);

        return SimulationResponse.builder()
                .before((int) Math.round(baseCo2 * 1000.0))
                .after((int) Math.round(afterCo2 * 1000.0))
                .reduction((int) Math.round(reduction * 1000.0))
                .reductionPercent(String.format("%.1f", (reductionPercent * 100.0)))
                .area(request.getArea())
                .intervention(request.getInterventionType())
                .build();
    }
}
