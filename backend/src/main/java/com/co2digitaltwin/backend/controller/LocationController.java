package com.co2digitaltwin.backend.controller;

import com.co2digitaltwin.backend.dto.LocationDetailsResponse;
import com.co2digitaltwin.backend.dto.LocationResolveRequest;
import com.co2digitaltwin.backend.dto.LocationResolveResponse;
import com.co2digitaltwin.backend.dto.LocationSearchResult;
import com.co2digitaltwin.backend.service.DataAggregationService;
import com.co2digitaltwin.backend.service.GeocodingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin
@RequiredArgsConstructor
public class LocationController {

    private final GeocodingService geocodingService;
    private final DataAggregationService dataAggregationService;

    @GetMapping("/search")
    public List<LocationSearchResult> search(@RequestParam("q") String query) {
        List<LocationSearchResult> results = geocodingService.search(query);
        // A failed lookup must never surface as a 500; the client treats an empty
        // list as "no match" for this query.
        return results != null ? results : List.of();
    }

    /**
     * Assisted location lookup for areas that cannot be found by name (societies,
     * colonies, campuses, small businesses). Coordinates are never fabricated: an
     * unresolved response is returned when the supplied information is insufficient.
     */
    @PostMapping("/resolve")
    public LocationResolveResponse resolve(@RequestBody LocationResolveRequest request) {
        return geocodingService.resolve(request);
    }

    @GetMapping("/details")
    public LocationDetailsResponse getDetails(
            @RequestParam("city") String city,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam("lat") Double lat,
            @RequestParam("lng") Double lng) {
        return dataAggregationService.getLocationDetails(city, state, lat, lng);
    }
}
