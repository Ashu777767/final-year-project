package com.co2digitaltwin.backend.controller;

import com.co2digitaltwin.backend.dto.ScenarioResponse;
import com.co2digitaltwin.backend.service.ScenarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ScenarioController {

    private final ScenarioService scenarioService;

    @GetMapping("/scenarios")
    public List<ScenarioResponse> getScenarios(@RequestParam(value = "city", required = false) String city) {
        return scenarioService.getScenarios(city);
    }
}
