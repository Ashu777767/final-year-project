package com.co2digitaltwin.backend.controller;

import com.co2digitaltwin.backend.dto.KpiResponse;
import com.co2digitaltwin.backend.service.KpiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin
@RequiredArgsConstructor
public class KpiController {

    private final KpiService kpiService;

    @GetMapping("/kpi")
    public KpiResponse getKpiData(
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "baseline", required = false) Double baseline) {
        return kpiService.getKpiData(city, baseline);
    }
}
