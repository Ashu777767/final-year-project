package com.co2digitaltwin.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Result of planning a proposed society.
 *
 * Scope: {@code grossOperationalTonnesPerDay} is an ACTIVITY-BASED estimate for the
 * proposed society itself, built from the user's own consumption and travel figures and
 * published emission factors. It is a different quantity from the modelled-area value
 * the Random Forest predicts, and the two are never added together or presented as one.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocietyPlanResponse {

    private String societyName;
    private String locationLabel;
    private Double latitude;
    private Double longitude;
    private String resolution;

    // ------------------------------------------------------------------ headline

    /** Gross operational CO2 for the proposed society, tonnes/day. */
    private double grossOperationalTonnesPerDay;
    /** Same value annualised (x 365), tonnes/year. */
    private double grossOperationalTonnesPerYear;

    /** Net of the user's own tree factor, when one was supplied. Null otherwise. */
    private Double netAfterUserOffsetTonnesPerDay;
    private Double netAfterUserOffsetTonnesPerYear;

    /** Gross emissions per resident per day, kg. Null when population is unknown. */
    private Double perResidentKgPerDay;
    /** Gross emissions per household per day, kg. Null when households are unknown. */
    private Double perHouseholdKgPerDay;

    // ----------------------------------------------------------------- components

    private Component electricity;
    private Component transport;
    private Component additionalFuel;

    /** Rooftop solar: what it offsets, without double counting. */
    private SolarContribution solar;

    /** Green cover and trees, reported as planning inputs. */
    private GreenCover greenCover;

    // --------------------------------------------------------------- explanation

    private List<EmissionLine> lines;
    private List<Assumption> assumptions;
    private List<Assumption> limitations;
    private List<FactorReference> factors;

    /** Present only when the user asked for it; experimental, not validated at society scale. */
    private ModelEstimate modelEstimate;

    /** Plain-language statement of what this number is. */
    private String scopeNote;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Component {
        private String label;
        /** CO2 from this component, tonnes/day. */
        private double tonnesPerDay;
        /** Share of gross operational emissions, percent. */
        private double sharePercent;
        /** The activity that produced it, already formatted with units. */
        private String activity;
        /** One-line explanation of the arithmetic. */
        private String method;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SolarContribution {
        private double generationKwhPerDay;
        /** Grid electricity the solar actually displaces, kWh/day (capped at grid draw). */
        private double displacedGridKwhPerDay;
        /** CO2 avoided by that displacement, tonnes/day. */
        private double avoidedTonnesPerDay;
        /** Generation that exceeds the grid draw and is therefore not credited here. */
        private double excessKwhPerDay;
        private String method;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GreenCover {
        private Integer treeCount;
        private Double greenCoverKm2;
        private Double greenCoverPercent;
        private Double treesPerAcre;
        /** False when no sequestration factor is applied - which is the default. */
        private boolean sequestrationApplied;
        private Double appliedKgPerTreePerYear;
        private String source;
        private String note;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmissionLine {
        private String source;
        private String activity;
        private String factor;
        /** tonnes/day */
        private double tonnesPerDay;
    }

    /** A value used by the calculation that the user did not supply, or that came from outside. */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Assumption {
        private String field;
        private String value;
        private String source;
        /** True when the user can change this in the form. */
        private boolean userEditable;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FactorReference {
        private String factor;
        private String value;
        private String source;
    }

    /** The existing Random Forest output, kept deliberately separate from the estimate above. */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModelEstimate {
        /** Model output for one sampled location, tonnes/day. */
        private Double predictedTonnesPerDay;
        private String status;
        private String scope;
        private String warning;
        private MlPredictionRequest features;
    }
}
