package com.co2digitaltwin.backend.controller;

import com.co2digitaltwin.backend.dto.TrafficCo2Data;
import com.co2digitaltwin.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/traffic")
    public List<TrafficCo2Data> getTrafficVsCo2(
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate) {
        return analyticsService.getTrafficVsCo2(city, startDate, endDate);
    }
}
