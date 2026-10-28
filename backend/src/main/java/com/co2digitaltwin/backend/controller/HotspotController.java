package com.co2digitaltwin.backend.controller;

import com.co2digitaltwin.backend.dto.ErrorResponse;
import com.co2digitaltwin.backend.dto.HotspotDetail;
import com.co2digitaltwin.backend.dto.HotspotSummary;
import com.co2digitaltwin.backend.service.HotspotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/hotspots")
@CrossOrigin
@RequiredArgsConstructor
public class HotspotController {

    private final HotspotService hotspotService;

    /**
     * Default viewing area used when the client has not selected a location yet.
     * Matches the map's default centre so markers are always placed on real land.
     */
    private static final String DEFAULT_CITY = "Bengaluru";
    private static final double DEFAULT_LAT = 12.9141;
    private static final double DEFAULT_LNG = 77.6370;

    @GetMapping
    public List<HotspotSummary> getHotspots(
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "lat", required = false) Double lat,
            @RequestParam(value = "lng", required = false) Double lng,
            @RequestParam(value = "dataSource", required = false) String dataSource,
            @RequestParam(value = "baseline", required = false) Double baseline) {
        String resolvedCity = (city == null || city.isBlank()) ? DEFAULT_CITY : city;
        Double resolvedLat = lat != null ? lat : DEFAULT_LAT;
        Double resolvedLng = lng != null ? lng : DEFAULT_LNG;
        return hotspotService.getHotspots(resolvedCity, resolvedLat, resolvedLng, dataSource, baseline);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getHotspotDetail(
            @PathVariable int id,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "lat", required = false) Double lat,
            @RequestParam(value = "lng", required = false) Double lng,
            @RequestParam(value = "dataSource", required = false) String dataSource,
            @RequestParam(value = "baseline", required = false) Double baseline) {
        String resolvedCity = (city == null || city.isBlank()) ? DEFAULT_CITY : city;
        Double resolvedLat = lat != null ? lat : DEFAULT_LAT;
        Double resolvedLng = lng != null ? lng : DEFAULT_LNG;

        HotspotDetail detail = hotspotService.getHotspotDetail(id, resolvedCity, resolvedLat, resolvedLng, dataSource, baseline);
        if (detail == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ErrorResponse.builder()
                            .status(404)
                            .message("Hotspot not found with id: " + id)
                            .timestamp(Instant.now().toString())
                            .build());
        }
        return ResponseEntity.ok(detail);
    }
}
