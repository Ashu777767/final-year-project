package com.co2digitaltwin.backend.service;

import com.co2digitaltwin.backend.dto.MlPredictionRequest;
import com.co2digitaltwin.backend.dto.RecommendationResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RecommendationService {

    /** Fallback area name when the client has not selected a location. */
    private static final String GENERIC_AREA = "General Urban Area";

    public List<RecommendationResponse> generateRecommendations(MlPredictionRequest features, String city) {
        List<RecommendationResponse> responses = new ArrayList<>();
        int id = 1;
        String area = (city == null || city.isBlank()) ? GENERIC_AREA : city;
        String modelledArea = area + " (modelled area)";

        if (features == null) {
            return getDefaultRecommendations(city);
        }

        if (features.getVehicleDensityKm2() != null && features.getVehicleDensityKm2() > 5000) {
            responses.add(RecommendationResponse.builder()
                    .id(id++)
                    .hotspot(modelledArea + " — high vehicle density")
                    .co2Level(4500)
                    .traffic("Very High")
                    .risk("Critical")
                    .recommended("Traffic Optimization")
                    .expectedImpact("High (model-based estimate)")
                    .expectedReduction("-15% CO2 (estimated)")
                    .difficulty("Medium")
                    .estimatedCost("₹1.0 Cr")
                    .timeframe("6-12 months")
                    .reasoning("The modelled vehicle density for this area exceeds 5,000 per km2. Smart traffic signalling and public transit incentives are estimated to reduce idling emissions; this estimate is model-derived, not a measured outcome.")
                    .build());
        }

        if (features.getIndustrialElectricityKwhPerCapita() != null && features.getIndustrialElectricityKwhPerCapita() > 200) {
            responses.add(RecommendationResponse.builder()
                    .id(id++)
                    .hotspot(modelledArea + " — industrial activity")
                    .co2Level(5200)
                    .traffic("Medium")
                    .risk("High")
                    .recommended("CO2 Capture Unit")
                    .expectedImpact("Very High (model-based estimate)")
                    .expectedReduction("-25% CO2 (estimated)")
                    .difficulty("Hard")
                    .estimatedCost("₹3.75 Cr")
                    .timeframe("1-2 years")
                    .reasoning("The modelled industrial electricity use for this area indicates point-source emissions. Localised capture scrubbers are estimated to deliver the largest reduction; this estimate is model-derived, not a measured outcome.")
                    .build());
        }

        if (features.getPrecipitationMm() != null && features.getPrecipitationMm() > 1.0) {
             responses.add(RecommendationResponse.builder()
                    .id(id++)
                    .hotspot(modelledArea + " — urban vegetation potential")
                    .co2Level(2800)
                    .traffic("Medium")
                    .risk("Medium")
                    .recommended("Tree Plantation / Green Corridor")
                    .expectedImpact("Medium (model-based estimate)")
                    .expectedReduction("-5% CO2 (estimated)")
                    .difficulty("Low")
                    .estimatedCost("₹42 L")
                    .timeframe("3-6 months")
                    .reasoning("The recorded precipitation for this area is sufficient to support new green corridors, which act as natural carbon sinks. The reduction is an estimate, not a measured outcome.")
                    .build());
        }

        // Add a default if nothing triggers
        if (responses.isEmpty()) {
            responses = getDefaultRecommendations(city);
        }

        return responses;
    }

    public List<RecommendationResponse> getDefaultRecommendations(String city) {
        String area = (city == null || city.isBlank()) ? GENERIC_AREA : city;
        return List.of(
            RecommendationResponse.builder()
                .id(1)
                .hotspot(area + " (modelled area)")
                .co2Level(3000)
                .traffic("Medium")
                .risk("Medium")
                .recommended("Tree Plantation")
                .expectedImpact("Medium (model-based estimate)")
                .expectedReduction("-5% CO2 (estimated)")
                .difficulty("Low")
                .estimatedCost("₹8.5 L")
                .timeframe("6 months")
                .reasoning("Baseline recommendation derived from the modelled area value for this location. The impact is an estimate, not a measured outcome.")
                .build()
        );
    }
}
