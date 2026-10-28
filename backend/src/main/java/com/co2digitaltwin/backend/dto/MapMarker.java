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
public class MapMarker {
    private int id;
    private String area;
    private double lat;
    private double lng;
    private int co2;
    private String risk;
    private String traffic;
    private String estimatedEmissions;

    // Explicit wire names: Jackson would otherwise drop the "is" prefix from
    // boolean getters and emit "hotspot"/"modelEstimated"/"captureLocation",
    // which the map layer filters do not read.
    @JsonProperty("isHotspot")
    private boolean isHotspot;
    @JsonProperty("isModelEstimated")
    private boolean isModelEstimated;
    @JsonProperty("isCaptureLocation")
    private boolean isCaptureLocation;

    @JsonProperty("traffic_density_km2")
    private double traffic_density_km2;

    /** "sampled" for a real dataset point, "modelled" for a derived zone. */
    private String zoneKind;
}
