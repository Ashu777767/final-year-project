package com.co2digitaltwin.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A proposed residential society to be planned.
 *
 * Every numeric field is nullable on purpose: the service must be able to tell
 * "the user did not tell us" apart from "the user told us zero", so it can ask for
 * the missing input or state a limitation instead of substituting a silent default.
 * All values are per DAY unless the field name says otherwise.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SocietyPlanRequest {

    // ------------------------------------------------------------------ identity

    private String societyName;

    /** Free-text place the user typed (locality, city or PIN code). Never trusted for maths. */
    private String locationQuery;
    private String city;
    private String state;

    /** Coordinates. Required: there is no 0,0 fallback anywhere in this flow. */
    private Double latitude;
    private Double longitude;
    /** How the coordinates were obtained: exact | pincode | address | locality | landmark | manual. */
    private String resolution;

    // ----------------------------------------------------------------- population

    /** Planned resident population. Required. */
    private Integer population;

    /** Number of houses / flats. Required. */
    private Integer households;

    // ----------------------------------------------------------------------- area

    /** Total land area, in the unit named by {@link #areaUnit}. Required. */
    private Double area;
    /** "acres" | "hectares" | "km2". Required. */
    private String areaUnit;

    // ----------------------------------------------------------------- transport

    private Integer petrolVehicles;
    private Integer dieselVehicles;
    private Integer electricVehicles;

    /** Daily distance travelled per vehicle, km. Null => the labelled default is used. */
    private Double kmPerVehiclePerDay;

    /** Fuel economy overrides, km/litre. Null => the labelled default is used. */
    private Double petrolKmPerLitre;
    private Double dieselKmPerLitre;
    /** EV consumption override, kWh/km. Null => the labelled default is used. */
    private Double electricKwhPerKm;

    // ----------------------------------------------------------------- electricity

    /** Daily electricity consumption of the society, kWh/day. Required. */
    private Double electricityKwhPerDay;

    /** Daily electricity for common facilities / industry, kWh/day. Optional. */
    private Double commonFacilityElectricityKwhPerDay;

    /** Rooftop solar generation, kWh/day. Optional; offsets grid draw only. */
    private Double solarGenerationKwhPerDay;

    // ------------------------------------------------------------- green cover

    private Integer treeCount;
    /** Green cover area in the same unit as {@link #areaUnit}. Optional. */
    private Double greenCoverArea;

    /**
     * Optional user-supplied carbon sequestration factor, kg CO2 per tree per year.
     * Left null unless the user explicitly provides one and its source, because the
     * project deliberately ships no invented sequestration coefficient.
     */
    private Double treeSequestrationKgPerTreePerYear;
    /** Where the user's sequestration factor came from, recorded verbatim. */
    private String treeSequestrationSource;

    // -------------------------------------------------------- optional extra fuel

    /** Optional additional fuel consumption, litres/day (e.g. DG sets). */
    private Double additionalFuelLitresPerDay;
    /** "petrol" | "diesel". Defaults to diesel when fuel is supplied. */
    private String additionalFuelType;

    /**
     * When true the service also calls the existing Random Forest model and returns its
     * output separately, clearly flagged as experimental and not validated at society scale.
     */
    private Boolean includeModelEstimate;
}
