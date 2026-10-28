package com.co2digitaltwin.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * One planning scenario for a proposed society, always recalculated from its inputs.
 *
 * {@code changeTonnesPerDay} / {@code changePercent} are signed: negative means the
 * scenario emits LESS than the baseline design. They are only populated when both
 * values are computable - never inferred.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocietyScenarioResponse {

    private String scenario;
    private String description;

    private double grossOperationalTonnesPerDay;
    private double grossOperationalTonnesPerYear;

    /** Scenario minus baseline, tonnes/day (negative = improvement). */
    private Double changeTonnesPerDay;
    /** Same change as a percentage of the baseline. */
    private Double changePercent;

    private double electricityTonnesPerDay;
    private double transportTonnesPerDay;
    private Double additionalFuelTonnesPerDay;

    private double gridElectricityKwhPerDay;
    private double solarKwhPerDay;
    private double vehicleKmPerDay;

    /** What changed for this scenario, in words. */
    private List<String> adjustments;

    /** Applied when a tree-related scenario is chosen, so trees are never credited silently. */
    private String treeNote;
}
