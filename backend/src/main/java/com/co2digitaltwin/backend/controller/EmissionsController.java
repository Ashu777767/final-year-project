package com.co2digitaltwin.backend.controller;

import com.co2digitaltwin.backend.dto.AreaEmission;
import com.co2digitaltwin.backend.dto.EmissionTrend;
import com.co2digitaltwin.backend.dto.SourceDistribution;
import com.co2digitaltwin.backend.service.EmissionsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emissions")
@CrossOrigin
@RequiredArgsConstructor
public class EmissionsController {

    private final EmissionsService emissionsService;

    @GetMapping("/trends")
    public List<EmissionTrend> getTrends(
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate) {
        return emissionsService.getEmissionTrends(city, startDate, endDate);
    }

    @GetMapping("/areas")
    public List<AreaEmission> getAreas(@RequestParam(value = "city", required = false) String city) {
        return emissionsService.getAreaEmissions(city);
    }

    @GetMapping("/sources")
    public List<SourceDistribution> getSources(
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate) {
        return emissionsService.getSourceDistribution(city, startDate, endDate);
    }
}
