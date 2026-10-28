package com.co2digitaltwin.backend.controller;

import com.co2digitaltwin.backend.dto.SocietyPlanRequest;
import com.co2digitaltwin.backend.dto.SocietyPlanResponse;
import com.co2digitaltwin.backend.dto.SocietyScenarioRequest;
import com.co2digitaltwin.backend.dto.SocietyScenarioResponse;
import com.co2digitaltwin.backend.service.SocietyPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Planning API for a proposed residential society.
 *
 * Separate from /api/survey and /api/prediction on purpose: those produce the model's
 * city-scale "modelled area CO2" for one sampled location, whereas this endpoint returns
 * an activity-based operational estimate for the society itself.
 */
@RestController
@RequestMapping("/api/society")
@CrossOrigin
@RequiredArgsConstructor
public class SocietyPlanController {

    private final SocietyPlanService societyPlanService;

    /** Preliminary activity-based CO2 estimate for the proposed society. */
    @PostMapping("/plan")
    public SocietyPlanResponse plan(@RequestBody SocietyPlanRequest request) {
        return societyPlanService.plan(request);
    }

    /** The same calculation under each requested what-if adjustment, compared to the design. */
    @PostMapping("/scenarios")
    public List<SocietyScenarioResponse> scenarios(@RequestBody SocietyScenarioRequest request) {
        return societyPlanService.scenarios(request);
    }
}
