package com.co2digitaltwin.backend.controller;

import com.co2digitaltwin.backend.dto.MapMarker;
import com.co2digitaltwin.backend.service.MapService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/map")
@CrossOrigin
@RequiredArgsConstructor
public class MapController {

    private final MapService mapService;

    /**
     * Default viewing area used when the client has not selected a location yet.
     * Matches the map's default centre so markers never land at 0,0 (open ocean).
     */
    private static final String DEFAULT_CITY = "Bengaluru";
    private static final double DEFAULT_LAT = 12.9141;
    private static final double DEFAULT_LNG = 77.6370;

    @GetMapping("/markers")
    public List<MapMarker> getMarkers(
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "lat", required = false) Double lat,
            @RequestParam(value = "lng", required = false) Double lng,
            @RequestParam(value = "dataSource", required = false) String dataSource,
            @RequestParam(value = "baseline", required = false) Double baseline) {

        String resolvedCity = (city == null || city.isBlank()) ? DEFAULT_CITY : city;
        Double resolvedLat = lat != null ? lat : DEFAULT_LAT;
        Double resolvedLng = lng != null ? lng : DEFAULT_LNG;
        return mapService.getMapMarkers(resolvedCity, resolvedLat, resolvedLng, dataSource, baseline);
    }
}
