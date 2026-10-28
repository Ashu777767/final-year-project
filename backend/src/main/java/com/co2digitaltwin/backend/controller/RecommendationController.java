package com.co2digitaltwin.backend.controller;

import com.co2digitaltwin.backend.dto.MlPredictionRequest;
import com.co2digitaltwin.backend.dto.RecommendationResponse;
import com.co2digitaltwin.backend.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @PostMapping
    public List<RecommendationResponse> getRecommendations(
            @RequestBody(required = false) MlPredictionRequest features,
            @RequestParam(value = "city", required = false) String city) {
        return recommendationService.generateRecommendations(features, city);
    }
}
