package com.co2digitaltwin.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotspotSummary {
    private int id;
    private String area;
    private int co2Level;
    private String risk;
    private String trend;
    private double lat;
    private double lng;
    private String dataSource;
    private double vehicleDensityKm2;
    /**
     * "sampled"  - real dataset sample point for this area
     * "modelled" - derived zone around the selected area (no dataset coverage)
     */
    private String zoneKind;
}
