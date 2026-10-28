package com.co2digitaltwin.backend.service;

import com.co2digitaltwin.backend.dto.HotspotSummary;
import com.co2digitaltwin.backend.dto.MapMarker;
import com.co2digitaltwin.backend.service.HotspotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MapService {

    private final HotspotService hotspotService;

    public List<MapMarker> getMapMarkers(String city, Double lat, Double lng, String dataSource) {
        return getMapMarkers(city, lat, lng, dataSource, null);
    }

    public List<MapMarker> getMapMarkers(String city, Double lat, Double lng, String dataSource,
                                         Double baselineTonnesPerDay) {
        List<HotspotSummary> hotspots = hotspotService.getHotspots(city, lat, lng, dataSource, baselineTonnesPerDay);
        List<MapMarker> markers = new ArrayList<>();
        for (HotspotSummary h : hotspots) {
            boolean isModel = h.getDataSource() != null && h.getDataSource().toLowerCase().contains("model");
            // HotspotSummary carries co2Level already in kg/day (tonnes x 1000), so the
            // marker reuses that same value instead of scaling it a second time.
            int co2KgPerDay = h.getCo2Level();
            markers.add(MapMarker.builder()
                    .id(h.getId())
                    .area(h.getArea())
                    .lat(h.getLat())
                    .lng(h.getLng())
                    .co2(co2KgPerDay)
                    .risk(h.getRisk())
                    .traffic("Unknown")
                    .estimatedEmissions(String.format("%.2f tonnes/day", co2KgPerDay / 1000.0))
                    .isHotspot(!isModel)
                    .isModelEstimated(isModel)
                    .isCaptureLocation(co2KgPerDay > 3000)
                    .traffic_density_km2(h.getVehicleDensityKm2())
                    .zoneKind(h.getZoneKind())
                    .build());
        }
        return markers;
    }
}
