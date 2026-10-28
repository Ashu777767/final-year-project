package com.co2digitaltwin.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A what-if planning scenario for a proposed society. It carries the same design inputs
 * as {@link SocietyPlanRequest} plus explicit, editable adjustments, so every scenario is
 * recalculated by the exact same method as the baseline - never by scaling the result.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SocietyScenarioRequest {

    /** The society design to use as the baseline for this comparison. */
    private SocietyPlanRequest design;

    /** Reduce society electricity consumption by this percentage (0-100). */
    private Double electricityReductionPercent;

    /** Multiply rooftop solar generation by this factor (>= 1 to add capacity). */
    private Double solarMultiplier;

    /** Share of petrol + diesel vehicles switched to electric, 0-100 percent. */
    private Double evShiftPercent;

    /** Reduce total vehicle distance travelled by this percentage (0-100). */
    private Double travelReductionPercent;

    /** Additional trees planted (planning input; no invented sequestration is applied). */
    private Integer additionalTrees;
}
