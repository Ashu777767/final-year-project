package com.co2digitaltwin.backend.controller;

import com.co2digitaltwin.backend.dto.ErrorResponse;
import com.co2digitaltwin.backend.dto.SimulationRequest;
import com.co2digitaltwin.backend.dto.SimulationResponse;
import com.co2digitaltwin.backend.service.SimulationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/simulation")
@RequiredArgsConstructor
public class SimulationController {

    private final SimulationService simulationService;

    @PostMapping("/run")
    public ResponseEntity<?> runSimulation(@RequestBody SimulationRequest request) {
        if (request.getArea() == null || request.getArea().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.builder()
                            .status(400)
                            .message("'area' is required")
                            .timestamp(Instant.now().toString())
                            .build());
        }
        if (request.getInterventionType() == null || request.getInterventionType().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.builder()
                            .status(400)
                            .message("'interventionType' is required")
                            .timestamp(Instant.now().toString())
                            .build());
        }
        try {
            SimulationResponse result = simulationService.runSimulation(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.builder()
                            .status(500)
                            .message("Simulation failed: " + e.getMessage())
                            .timestamp(Instant.now().toString())
                            .build());
        }
    }
}
