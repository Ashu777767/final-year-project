package com.co2digitaltwin.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotspotDetail {
    private String area;
    private int co2Level;
    private String severity;
    private String mainFactor;
    private String trafficLevel;
    private String industrialActivity;
    private String greenCover;
    private List<Integer> trend;
    private List<String> factors;
    private String recommendedIntervention;
    /** "sampled" (real dataset point) or "modelled" (derived zone). */
    private String zoneKind;
    /**
     * True when the trend series is a deterministic illustration around the observed
     * level rather than a recorded history for that location.
     */
    private boolean trendIsDerived;
}
