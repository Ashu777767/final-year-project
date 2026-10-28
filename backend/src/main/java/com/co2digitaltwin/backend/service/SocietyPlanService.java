package com.co2digitaltwin.backend.service;

import com.co2digitaltwin.backend.client.MlServiceClient;
import com.co2digitaltwin.backend.config.SocietyEmissionFactors;
import com.co2digitaltwin.backend.dto.MlPredictionRequest;
import com.co2digitaltwin.backend.dto.SocietyPlanRequest;
import com.co2digitaltwin.backend.dto.SocietyPlanResponse;
import com.co2digitaltwin.backend.dto.SocietyScenarioRequest;
import com.co2digitaltwin.backend.dto.SocietyScenarioResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import static com.co2digitaltwin.backend.config.SocietyEmissionFactors.ACRES_TO_KM2;
import static com.co2digitaltwin.backend.config.SocietyEmissionFactors.DAYS_PER_YEAR;
import static com.co2digitaltwin.backend.config.SocietyEmissionFactors.DEFAULT_DIESEL_KM_PER_LITRE;
import static com.co2digitaltwin.backend.config.SocietyEmissionFactors.DEFAULT_EV_KWH_PER_KM;
import static com.co2digitaltwin.backend.config.SocietyEmissionFactors.DEFAULT_KM_PER_VEHICLE_PER_DAY;
import static com.co2digitaltwin.backend.config.SocietyEmissionFactors.DEFAULT_PETROL_KM_PER_LITRE;
import static com.co2digitaltwin.backend.config.SocietyEmissionFactors.DIESEL_KG_CO2_PER_LITRE;
import static com.co2digitaltwin.backend.config.SocietyEmissionFactors.GRID_KG_CO2_PER_KWH;
import static com.co2digitaltwin.backend.config.SocietyEmissionFactors.HECTARES_TO_KM2;
import static com.co2digitaltwin.backend.config.SocietyEmissionFactors.PETROL_KG_CO2_PER_LITRE;

/**
 * Activity-based CO2 planning for a proposed residential society.
 *
 * <p><b>Why this is not the Random Forest.</b> The trained model was fitted on 15 Indian
 * cities at city scale - its target is a modelled CO2 rate for ONE sampled location, and
 * its features are city-population, city-area and state-level quantities. Feeding it a
 * 600-flat society and calling the output "society emissions" would be an extrapolation
 * several orders of magnitude outside its training distribution, so the model is NOT the
 * basis of this estimate. It can be requested separately and is returned under
 * {@code modelEstimate}, explicitly labelled experimental.
 *
 * <p><b>How the estimate is produced.</b> Every figure is activity x published factor:
 * <ul>
 *   <li>electricity drawn from the grid x CEA grid intensity (kg CO2/kWh)</li>
 *   <li>petrol litres x IPCC gasoline factor, diesel litres x IPCC diesel factor</li>
 *   <li>EV km x kWh/km x the same grid intensity</li>
 *   <li>optional DG/other fuel litres x the matching IPCC factor</li>
 * </ul>
 * One kWh is therefore never counted twice: solar only reduces grid draw, and EV charging
 * is the only place grid intensity is applied to transport.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SocietyPlanService {

    private final MlServiceClient mlServiceClient;

    // ------------------------------------------------------------------ public API

    /** Full, explainable estimate for the proposed society. */
    public SocietyPlanResponse plan(SocietyPlanRequest request) {
        Design design = resolve(request);
        Calculation calc = calculate(design);
        return toResponse(design, calc);
    }

    /** The same calculation re-run under each requested adjustment, compared to the baseline. */
    public List<SocietyScenarioResponse> scenarios(SocietyScenarioRequest request) {
        if (request == null || request.getDesign() == null) {
            throw new IllegalArgumentException(
                    "A society design is required. Fill in the society details first, then run scenarios.");
        }
        Design baselineDesign = resolve(request.getDesign());
        Calculation baseline = calculate(baselineDesign);
        double baselineTonnes = baseline.totalTonnesPerDay();

        List<SocietyScenarioResponse> out = new ArrayList<>();
        out.add(scenario("Current proposed design", "The society as entered, with no changes.",
                baseline, baselineTonnes, List.of("No changes applied."), null));

        // ---- reduced electricity consumption -------------------------------------
        double elecReduction = clampPercent(defaultZero(request.getElectricityReductionPercent()));
        if (elecReduction > 0) {
            Design d = copy(baselineDesign);
            d.electricityKwhPerDay *= (1 - elecReduction / 100.0);
            d.commonFacilityKwhPerDay *= (1 - elecReduction / 100.0);
            Calculation c = calculate(d);
            out.add(scenario("Reduced electricity consumption",
                    String.format(Locale.ROOT, "Society electricity demand cut by %.0f%%.", elecReduction),
                    c, baselineTonnes,
                    List.of(String.format(Locale.ROOT, "Electricity and common-facility demand reduced %.0f%%", elecReduction)),
                    null));
        }

        // ---- increased rooftop solar ---------------------------------------------
        double solarMultiplier = request.getSolarMultiplier() != null && request.getSolarMultiplier() > 0
                ? request.getSolarMultiplier() : 0.0;
        if (solarMultiplier > 1.0) {
            Design d = copy(baselineDesign);
            double existing = d.solarKwhPerDay;
            // When the design has no solar yet, size the new array from the grid demand.
            double base = existing > 0 ? existing : Math.max(d.electricityKwhPerDay * 0.1, 1.0);
            d.solarKwhPerDay = base * solarMultiplier;
            Calculation c = calculate(d);
            out.add(scenario("Increased rooftop solar",
                    String.format(Locale.ROOT, "Rooftop solar generation scaled x%.1f.", solarMultiplier),
                    c, baselineTonnes,
                    List.of(String.format(Locale.ROOT, "Solar generation x%.1f (displaces grid draw only)", solarMultiplier)),
                    null));
        }

        // ---- EV shift + reduced travel -------------------------------------------
        double evShift = clampPercent(defaultZero(request.getEvShiftPercent()));
        double travelReduction = clampPercent(defaultZero(request.getTravelReductionPercent()));
        if (evShift > 0 || travelReduction > 0) {
            Design d = copy(baselineDesign);
            if (travelReduction > 0) {
                d.kmPerVehiclePerDay *= (1 - travelReduction / 100.0);
            }
            if (evShift > 0) {
                int shiftPetrol = (int) Math.round(d.petrolVehicles * evShift / 100.0);
                int shiftDiesel = (int) Math.round(d.dieselVehicles * evShift / 100.0);
                d.petrolVehicles -= shiftPetrol;
                d.dieselVehicles -= shiftDiesel;
                d.electricVehicles += shiftPetrol + shiftDiesel;
            }
            Calculation c = calculate(d);
            List<String> adjustments = new ArrayList<>();
            if (evShift > 0) {
                adjustments.add(String.format(Locale.ROOT, "%.0f%% of petrol/diesel vehicles switched to electric", evShift));
            }
            if (travelReduction > 0) {
                adjustments.add(String.format(Locale.ROOT, "Distance travelled per vehicle reduced %.0f%%", travelReduction));
            }
            out.add(scenario("Lower-emission transport",
                    "Fewer vehicle-kilometres and a shift to electric vehicles.", c, baselineTonnes,
                    adjustments, null));
        }

        // ---- more trees / green cover --------------------------------------------
        int extraTrees = request.getAdditionalTrees() != null ? Math.max(request.getAdditionalTrees(), 0) : 0;
        if (extraTrees > 0) {
            Design d = copy(baselineDesign);
            d.treeCount += extraTrees;
            Calculation c = calculate(d);
            out.add(scenario("Increased green cover",
                    String.format(Locale.ROOT, "%d additional trees planted.", extraTrees),
                    c, baselineTonnes,
                    List.of(String.format(Locale.ROOT, "Tree count +%d", extraTrees)),
                    "Trees are recorded as a planning input. No carbon reduction is claimed for them, "
                            + "because this project ships no tree-sequestration factor. Emissions are unchanged; "
                            + "supply a cited factor in the form if you want trees counted."));
        }

        return out;
    }

    // ------------------------------------------------------------------- validation

    /**
     * Turns the raw request into a fully-resolved design, rejecting anything unusable.
     * No field is silently defaulted: where a default is legitimate (travel distance,
     * fuel economy) it is recorded in {@code assumptions} so the UI can show it as editable.
     */
    private Design resolve(SocietyPlanRequest r) {
        if (r == null) {
            throw new IllegalArgumentException("A society design is required.");
        }
        List<String> missing = new ArrayList<>();

        String name = trimToNull(r.getSocietyName());
        if (name == null) {
            name = "Proposed society";
        }

        // Location: coordinates are mandatory and must be real. There is no 0,0 fallback.
        if (r.getLatitude() == null || r.getLongitude() == null) {
            missing.add("latitude and longitude (use the location lookup, or enter coordinates manually)");
        } else if (!GeocodingService.isValidCoordinate(r.getLatitude(), r.getLongitude())) {
            throw new IllegalArgumentException(String.format(Locale.ROOT,
                    "The coordinates %.4f, %.4f are outside India (latitude 6-38, longitude 68-98). "
                            + "Re-resolve the location or enter valid coordinates.",
                    r.getLatitude(), r.getLongitude()));
        }

        if (r.getPopulation() == null || r.getPopulation() <= 0) {
            missing.add("planned resident population (greater than zero)");
        }
        if (r.getHouseholds() == null || r.getHouseholds() <= 0) {
            missing.add("number of houses/flats (greater than zero)");
        }
        if (r.getElectricityKwhPerDay() == null || r.getElectricityKwhPerDay() < 0) {
            missing.add("daily electricity consumption in kWh/day (zero is allowed)");
        }

        Double areaKm2 = toAreaKm2(r.getArea(), r.getAreaUnit(), missing);

        if (!missing.isEmpty()) {
            throw new IllegalArgumentException("The society plan is incomplete — please provide "
                    + String.join(", ", missing) + ".");
        }

        Design d = new Design();
        d.societyName = name;
        d.locationLabel = buildLocationLabel(r);
        d.latitude = r.getLatitude();
        d.longitude = r.getLongitude();
        d.resolution = r.getResolution() != null ? r.getResolution() : "manual";
        d.population = r.getPopulation();
        d.households = r.getHouseholds();
        d.areaKm2 = areaKm2;
        d.areaUnit = normaliseUnit(r.getAreaUnit());

        d.petrolVehicles = nonNegative(r.getPetrolVehicles());
        d.dieselVehicles = nonNegative(r.getDieselVehicles());
        d.electricVehicles = nonNegative(r.getElectricVehicles());

        // Labelled, editable defaults.
        d.assumptions = new ArrayList<>();
        if (r.getKmPerVehiclePerDay() != null) {
            requirePositive(r.getKmPerVehiclePerDay(), "average daily distance per vehicle (km)");
            d.kmPerVehiclePerDay = r.getKmPerVehiclePerDay();
        } else {
            d.kmPerVehiclePerDay = DEFAULT_KM_PER_VEHICLE_PER_DAY;
            d.assumptions.add(assumption("Average daily distance per vehicle",
                    fmt(DEFAULT_KM_PER_VEHICLE_PER_DAY) + " km/day",
                    "Editable assumption — typical urban daily vehicle use. Change it to match the site's travel survey."));
        }
        if (r.getPetrolKmPerLitre() != null) {
            requirePositive(r.getPetrolKmPerLitre(), "petrol mileage (km/litre)");
            d.petrolKmPerLitre = r.getPetrolKmPerLitre();
        } else {
            d.petrolKmPerLitre = DEFAULT_PETROL_KM_PER_LITRE;
            d.assumptions.add(assumption("Petrol vehicle mileage",
                    fmt(DEFAULT_PETROL_KM_PER_LITRE) + " km/litre",
                    "Editable assumption — typical Indian passenger car. Change it to the fleet's real figure."));
        }
        if (r.getDieselKmPerLitre() != null) {
            requirePositive(r.getDieselKmPerLitre(), "diesel mileage (km/litre)");
            d.dieselKmPerLitre = r.getDieselKmPerLitre();
        } else {
            d.dieselKmPerLitre = DEFAULT_DIESEL_KM_PER_LITRE;
            d.assumptions.add(assumption("Diesel vehicle mileage",
                    fmt(DEFAULT_DIESEL_KM_PER_LITRE) + " km/litre",
                    "Editable assumption — typical Indian passenger car. Change it to the fleet's real figure."));
        }
        if (r.getElectricKwhPerKm() != null) {
            requirePositive(r.getElectricKwhPerKm(), "EV consumption (kWh/km)");
            d.electricKwhPerKm = r.getElectricKwhPerKm();
        } else {
            d.electricKwhPerKm = DEFAULT_EV_KWH_PER_KM;
            d.assumptions.add(assumption("Electric vehicle consumption",
                    fmt(DEFAULT_EV_KWH_PER_KM) + " kWh/km",
                    "Editable assumption — typical small Indian EV. Change it to the model's real figure."));
        }

        d.electricityKwhPerDay = r.getElectricityKwhPerDay();
        d.commonFacilityKwhPerDay = r.getCommonFacilityElectricityKwhPerDay() != null
                ? Math.max(r.getCommonFacilityElectricityKwhPerDay(), 0) : 0.0;
        d.solarKwhPerDay = r.getSolarGenerationKwhPerDay() != null
                ? Math.max(r.getSolarGenerationKwhPerDay(), 0) : 0.0;

        d.treeCount = nonNegative(r.getTreeCount());
        d.greenCoverArea = r.getGreenCoverArea() != null && r.getGreenCoverArea() >= 0 ? r.getGreenCoverArea() : null;
        d.greenCoverAreaToKm2Factor = switch (d.areaUnit) {
            case "acres" -> ACRES_TO_KM2;
            case "hectares" -> HECTARES_TO_KM2;
            default -> 1.0;
        };

        if (r.getTreeSequestrationKgPerTreePerYear() != null) {
            requirePositive(r.getTreeSequestrationKgPerTreePerYear(), "tree sequestration factor (kg CO2/tree/year)");
            d.treeSequestrationKgPerTreePerYear = r.getTreeSequestrationKgPerTreePerYear();
            d.treeSequestrationSource = trimToNull(r.getTreeSequestrationSource()) != null
                    ? r.getTreeSequestrationSource()
                    : "User-supplied (no source given)";
        }

        d.additionalFuelLitresPerDay = r.getAdditionalFuelLitresPerDay() != null
                ? Math.max(r.getAdditionalFuelLitresPerDay(), 0) : 0.0;
        d.additionalFuelType = r.getAdditionalFuelType() != null
                && r.getAdditionalFuelType().trim().equalsIgnoreCase("petrol") ? "petrol" : "diesel";

        d.includeModelEstimate = Boolean.TRUE.equals(r.getIncludeModelEstimate());
        return d;
    }

    private Double toAreaKm2(Double area, String unit, List<String> missing) {
        if (area == null) {
            missing.add("total land area");
            return null;
        }
        if (area <= 0) {
            throw new IllegalArgumentException("The total land area must be greater than zero.");
        }
        String u = normaliseUnit(unit);
        if (u == null) {
            throw new IllegalArgumentException(
                    "The land area unit must be one of: acres, hectares, km2. Received: " + unit);
        }
        return switch (u) {
            case "acres" -> area * ACRES_TO_KM2;
            case "hectares" -> area * HECTARES_TO_KM2;
            default -> area;
        };
    }

    private String normaliseUnit(String unit) {
        if (unit == null) return null;
        return switch (unit.trim().toLowerCase(Locale.ROOT)) {
            case "acres", "acre", "ac" -> "acres";
            case "hectares", "hectare", "ha" -> "hectares";
            case "km2", "km²", "sqkm", "square kilometers", "square kilometres" -> "km2";
            default -> null;
        };
    }

    private String buildLocationLabel(SocietyPlanRequest r) {
        String city = trimToNull(r.getCity());
        String state = trimToNull(r.getState());
        if (city != null && state != null) return city + ", " + state;
        if (city != null) return city;
        return trimToNull(r.getLocationQuery()) != null ? r.getLocationQuery() : "Coordinates provided";
    }

    // ---------------------------------------------------------------- the arithmetic

    private Calculation calculate(Design d) {
        // ---- electricity ---------------------------------------------------------
        double totalKwh = d.electricityKwhPerDay + d.commonFacilityKwhPerDay;
        // Solar displaces grid draw only, capped at the draw: surplus generation is NOT
        // credited as an emission reduction here.
        double solarCredit = Math.min(d.solarKwhPerDay, totalKwh);
        double gridKwh = Math.max(totalKwh - solarCredit, 0.0);
        double excessSolar = Math.max(d.solarKwhPerDay - totalKwh, 0.0);
        double electricityTonnes = gridKwh * GRID_KG_CO2_PER_KWH / 1000.0;

        // ---- transport -----------------------------------------------------------
        double km = d.kmPerVehiclePerDay;
        double petrolKm = d.petrolVehicles * km;
        double dieselKm = d.dieselVehicles * km;
        double evKm = d.electricVehicles * km;

        double petrolLitres = d.petrolKmPerLitre > 0 ? petrolKm / d.petrolKmPerLitre : 0.0;
        double dieselLitres = d.dieselKmPerLitre > 0 ? dieselKm / d.dieselKmPerLitre : 0.0;
        double evKwh = evKm * d.electricKwhPerKm;

        double petrolTonnes = petrolLitres * PETROL_KG_CO2_PER_LITRE / 1000.0;
        double dieselTonnes = dieselLitres * DIESEL_KG_CO2_PER_LITRE / 1000.0;
        double evTonnes = evKwh * GRID_KG_CO2_PER_KWH / 1000.0;
        double transportTonnes = petrolTonnes + dieselTonnes + evTonnes;

        // ---- optional additional fuel -------------------------------------------
        double fuelFactor = "petrol".equals(d.additionalFuelType)
                ? PETROL_KG_CO2_PER_LITRE : DIESEL_KG_CO2_PER_LITRE;
        double additionalTonnes = d.additionalFuelLitresPerDay * fuelFactor / 1000.0;

        Calculation c = new Calculation();
        c.d = d;
        c.totalKwh = totalKwh;
        c.gridKwh = gridKwh;
        c.solarCredit = solarCredit;
        c.excessSolar = excessSolar;
        c.electricityTonnes = electricityTonnes;
        c.petrolLitres = petrolLitres;
        c.dieselLitres = dieselLitres;
        c.evKwh = evKwh;
        c.petrolTonnes = petrolTonnes;
        c.dieselTonnes = dieselTonnes;
        c.evTonnes = evTonnes;
        c.transportTonnes = transportTonnes;
        c.additionalTonnes = additionalTonnes;
        c.vehicleKmPerDay = petrolKm + dieselKm + evKm;
        return c;
    }

    // ------------------------------------------------------------------ the response

    private SocietyPlanResponse toResponse(Design d, Calculation c) {
        double gross = c.totalTonnesPerDay();

        SocietyPlanResponse.Component electricity = SocietyPlanResponse.Component.builder()
                .label("Electricity (grid draw)")
                .tonnesPerDay(round4(c.electricityTonnes))
                .sharePercent(share(c.electricityTonnes, gross))
                .activity(String.format(Locale.ROOT,
                        "%s kWh/day demand (%s society + %s common facility) − %s kWh/day solar = %s kWh/day from grid",
                        fmt(c.totalKwh), fmt(d.electricityKwhPerDay),
                        fmt(d.commonFacilityKwhPerDay), fmt(c.solarCredit),
                        fmt(c.gridKwh)))
                .method("Grid kWh × " + GRID_KG_CO2_PER_KWH + " kg CO2/kWh (CEA national grid factor) ÷ 1000")
                .build();

        SocietyPlanResponse.Component transport = SocietyPlanResponse.Component.builder()
                .label("Transport (resident vehicles)")
                .tonnesPerDay(round4(c.transportTonnes))
                .sharePercent(share(c.transportTonnes, gross))
                .activity(String.format(Locale.ROOT,
                        "%s petrol + %s diesel + %s electric vehicles at %s km/day = %s vehicle-km/day",
                        d.petrolVehicles, d.dieselVehicles, d.electricVehicles,
                        fmt(d.kmPerVehiclePerDay), fmt(c.vehicleKmPerDay)))
                .method("Petrol litres × " + PETROL_KG_CO2_PER_LITRE + ", diesel litres × " + DIESEL_KG_CO2_PER_LITRE
                        + " (IPCC default factors); EV kWh × " + GRID_KG_CO2_PER_KWH + " kg CO2/kWh")
                .build();

        SocietyPlanResponse.Component additional = c.additionalTonnes > 0
                ? SocietyPlanResponse.Component.builder()
                    .label("Additional fuel (e.g. DG sets)")
                    .tonnesPerDay(round4(c.additionalTonnes))
                    .sharePercent(share(c.additionalTonnes, gross))
                    .activity(fmt(d.additionalFuelLitresPerDay) + " litres/day of " + d.additionalFuelType)
                    .method("Litres × IPCC " + d.additionalFuelType + " factor ("
                            + ("petrol".equals(d.additionalFuelType) ? PETROL_KG_CO2_PER_LITRE : DIESEL_KG_CO2_PER_LITRE)
                            + " kg CO2/litre) ÷ 1000")
                    .build()
                : null;

        // ---- green cover ---------------------------------------------------------
        // Both areas are converted to km² once. Reporting the raw figure back through the
        // unit conversion would convert it a second time (10 acres became 0.0101 km²).
        Double greenKm2 = d.greenCoverArea != null ? d.greenCoverArea * d.greenCoverAreaToKm2Factor : null;
        boolean sequestrationApplied = d.treeSequestrationKgPerTreePerYear != null && d.treeCount > 0;
        Double offsetTonnes = sequestrationApplied
                ? d.treeCount * d.treeSequestrationKgPerTreePerYear / 1000.0 / DAYS_PER_YEAR : null;

        SocietyPlanResponse.GreenCover greenCover = SocietyPlanResponse.GreenCover.builder()
                .treeCount(d.treeCount)
                .greenCoverKm2(greenKm2 != null ? round4(greenKm2) : null)
                .greenCoverPercent(greenKm2 != null && d.areaKm2 > 0 ? round2(greenKm2 / d.areaKm2 * 100.0) : null)
                .treesPerAcre(d.treeCount > 0 && d.areaKm2 > 0
                        ? round2(d.treeCount / (d.areaKm2 / ACRES_TO_KM2)) : null)
                .sequestrationApplied(sequestrationApplied)
                .appliedKgPerTreePerYear(d.treeSequestrationKgPerTreePerYear)
                .source(d.treeSequestrationSource)
                .note(sequestrationApplied
                        ? "Applied using the factor you supplied. This is your figure, not a project default."
                        : "Trees and green cover are recorded as planning inputs. No carbon reduction is claimed for "
                          + "them, because this project ships no tree-sequestration coefficient. Supply a cited factor "
                          + "to include one.")
                .build();

        // ---- solar ---------------------------------------------------------------
        SocietyPlanResponse.SolarContribution solar = SocietyPlanResponse.SolarContribution.builder()
                .generationKwhPerDay(round2(d.solarKwhPerDay))
                .displacedGridKwhPerDay(round2(c.solarCredit))
                .avoidedTonnesPerDay(round4(c.solarCredit * GRID_KG_CO2_PER_KWH / 1000.0))
                .excessKwhPerDay(round2(c.excessSolar))
                .method("Solar offsets grid draw only, capped at the society's own consumption, so no kWh is "
                        + "counted twice. Any surplus is reported but not credited.")
                .build();

        // ---- lines / factors / assumptions --------------------------------------
        List<SocietyPlanResponse.EmissionLine> lines = new ArrayList<>();
        lines.add(line("Electricity", fmt(c.gridKwh) + " kWh/day grid",
                GRID_KG_CO2_PER_KWH + " kg CO2/kWh", c.electricityTonnes));
        if (d.petrolVehicles > 0) {
            lines.add(line("Petrol vehicles", fmt(c.petrolLitres) + " litres/day",
                    PETROL_KG_CO2_PER_LITRE + " kg CO2/litre", c.petrolTonnes));
        }
        if (d.dieselVehicles > 0) {
            lines.add(line("Diesel vehicles", fmt(c.dieselLitres) + " litres/day",
                    DIESEL_KG_CO2_PER_LITRE + " kg CO2/litre", c.dieselTonnes));
        }
        if (d.electricVehicles > 0) {
            lines.add(line("Electric vehicles", fmt(c.evKwh) + " kWh/day",
                    GRID_KG_CO2_PER_KWH + " kg CO2/kWh", c.evTonnes));
        }
        if (c.additionalTonnes > 0) {
            lines.add(line("Additional fuel", fmt(d.additionalFuelLitresPerDay) + " litres/day " + d.additionalFuelType,
                    ("petrol".equals(d.additionalFuelType) ? PETROL_KG_CO2_PER_LITRE : DIESEL_KG_CO2_PER_LITRE) + " kg CO2/litre",
                    c.additionalTonnes));
        }

        List<SocietyPlanResponse.Assumption> assumptions = new ArrayList<>(d.assumptions);
        if (d.treeCount > 0 && !sequestrationApplied) {
            assumptions.add(assumption("Tree carbon sequestration", "not applied",
                    "No sequestration coefficient is shipped with this project. Trees are shown as a planning input only."));
        }

        List<SocietyPlanResponse.Assumption> limitations = new ArrayList<>();
        limitations.add(assumption("Estimate basis", "operational emissions only",
                "Construction-phase embodied carbon (cement, steel, transport of materials) is NOT included."));
        limitations.add(assumption("Grid factor", GRID_KG_CO2_PER_KWH + " kg CO2/kWh",
                "National average. A state or time-of-day specific factor would change the electricity result."));
        limitations.add(assumption("Vehicle use", "tailpipe/charging only",
                "Vehicle manufacturing, maintenance and road wear are excluded."));
        limitations.add(assumption("Indirect energy", "not included",
                "Water supply, waste processing and food/consumables consumed by residents are outside this estimate."));

        List<SocietyPlanResponse.FactorReference> factors = List.of(
                factor("Grid electricity intensity", GRID_KG_CO2_PER_KWH + " kg CO2/kWh",
                        "CEA CO2 Baseline Database for the Indian Power Sector (national weighted average)"),
                factor("Petrol combustion", PETROL_KG_CO2_PER_LITRE + " kg CO2/litre",
                        "IPCC 2006 Guidelines, Vol. 2 (Energy) — motor gasoline"),
                factor("Diesel combustion", DIESEL_KG_CO2_PER_LITRE + " kg CO2/litre",
                        "IPCC 2006 Guidelines, Vol. 2 (Energy) — diesel"),
                factor("Area units", "1 acre = 4046.8564224 m², 1 ha = 10000 m²", "Exact unit definitions")
        );

        double perResidentKg = d.population > 0 ? gross * 1000.0 / d.population : 0.0;
        double perHouseholdKg = d.households > 0 ? gross * 1000.0 / d.households : 0.0;

        return SocietyPlanResponse.builder()
                .societyName(d.societyName)
                .locationLabel(d.locationLabel)
                .latitude(d.latitude)
                .longitude(d.longitude)
                .resolution(d.resolution)
                .grossOperationalTonnesPerDay(round4(gross))
                .grossOperationalTonnesPerYear(round2(gross * DAYS_PER_YEAR))
                .netAfterUserOffsetTonnesPerDay(offsetTonnes != null ? round4(Math.max(gross - offsetTonnes, 0.0)) : null)
                .netAfterUserOffsetTonnesPerYear(offsetTonnes != null ? round2(Math.max(gross - offsetTonnes, 0.0) * DAYS_PER_YEAR) : null)
                .perResidentKgPerDay(round2(perResidentKg))
                .perHouseholdKgPerDay(round2(perHouseholdKg))
                .electricity(electricity)
                .transport(transport)
                .additionalFuel(additional)
                .solar(solar)
                .greenCover(greenCover)
                .lines(lines)
                .assumptions(assumptions)
                .limitations(limitations)
                .factors(factors)
                .modelEstimate(buildModelEstimate(d))
                .scopeNote("Preliminary Society CO₂ Estimate — an activity-based operational estimate for the proposed "
                        + "society, calculated from the consumption and activity figures you entered and the published "
                        + "emission factors listed below. It is not a measured inventory and not a compliance figure; "
                        + "it depends entirely on the input data and the documented assumptions.")
                .build();
    }

    /**
     * Optional Random Forest call. Kept strictly separate from the activity-based estimate:
     * the model's 22-feature contract is city-scale, so the result is labelled experimental
     * and is never presented as the society's emissions.
     */
    private SocietyPlanResponse.ModelEstimate buildModelEstimate(Design d) {
        if (!d.includeModelEstimate) {
            return null;
        }
        MlPredictionRequest features = toModelFeatures(d);
        try {
            Double predicted = mlServiceClient.predict(features).getPredictedCo2Tonnes();
            return SocietyPlanResponse.ModelEstimate.builder()
                    .predictedTonnesPerDay(predicted)
                    .status("OK")
                    .scope("Modelled CO₂ for one sampled location, tonnes/day — the same quantity the rest of the app shows.")
                    .warning("Experimental comparison only. The model was trained on 15 Indian CITIES at city scale; a "
                            + "single society sits far outside its training range, so this value must not be read as the "
                            + "society's emissions. The activity-based estimate above is the society figure.")
                    .features(features)
                    .build();
        } catch (Exception e) {
            log.warn("Optional model estimate for society planning failed: {}", e.getMessage());
            return SocietyPlanResponse.ModelEstimate.builder()
                    .status("UNAVAILABLE")
                    .scope("Modelled CO₂ for one sampled location, tonnes/day.")
                    .warning("The model estimate could not be produced right now (" + e.getMessage()
                            + "). The activity-based estimate is unaffected.")
                    .features(features)
                    .build();
        }
    }

    /**
     * Maps the society onto the model's fixed 22-feature contract.
     * City-scale quantities (state vehicles per 1000, estimated city vehicles/electricity)
     * are extrapolated from the society's own per-capita intensities - which is exactly why
     * the result is labelled experimental rather than validated.
     */
    private MlPredictionRequest toModelFeatures(Design d) {
        java.time.LocalDate now = java.time.LocalDate.now();
        double population = Math.max(d.population, 1);
        double areaKm2 = d.areaKm2 > 0 ? d.areaKm2 : 1.0;

        double gridKwh = Math.max(d.electricityKwhPerDay + d.commonFacilityKwhPerDay - d.solarKwhPerDay, 0.0);
        double annualElectricityPerCapita = gridKwh * DAYS_PER_YEAR / population;
        double vehicles = d.petrolVehicles + d.dieselVehicles + d.electricVehicles;
        double vehiclesPer1000 = vehicles * 1000.0 / population;

        // The model's population/location features describe a city, not a society. A
        // representative population is supplied so the feature vector is well formed, and
        // the call is flagged experimental in the response.
        double referencePopulation = 1_000_000.0;

        return MlPredictionRequest.builder()
                .latitude(d.latitude)
                .longitude(d.longitude)
                .dayOfWeek(now.getDayOfWeek().getValue())
                .month(now.getMonthValue())
                .dayOfYear(now.getDayOfYear())
                .isWeekend(now.getDayOfWeek().getValue() >= 6 ? 1 : 0)
                .population2011(referencePopulation * 0.85)
                .populationGrowthRate(1.5)
                .population2021Est(referencePopulation)
                .areaKm2(areaKm2)
                .populationDensity2021(referencePopulation / areaKm2)
                .stateVehiclesPer1000(vehiclesPer1000)
                .estimatedCityVehicles(vehiclesPer1000 * referencePopulation / 1000.0)
                .vehicleDensityKm2(vehicles / areaKm2)
                .electricityKwhPerCapita(annualElectricityPerCapita)
                .estimatedCityElectricityKwh(annualElectricityPerCapita * referencePopulation)
                .industrialElectricityKwhPerCapita(0.0)
                .temperatureMean(25.0)
                .temperatureMax(30.0)
                .temperatureMin(20.0)
                .precipitationMm(0.0)
                .windSpeedMaxKmh(10.0)
                .build();
    }

    // -------------------------------------------------------------------- small helpers

    private SocietyScenarioResponse scenario(String name, String description, Calculation c,
                                             double baselineTonnes, List<String> adjustments, String treeNote) {
        double gross = c.totalTonnesPerDay();
        double change = gross - baselineTonnes;
        Double changePercent = baselineTonnes > 0 ? round2(change / baselineTonnes * 100.0) : null;
        return SocietyScenarioResponse.builder()
                .scenario(name)
                .description(description)
                .grossOperationalTonnesPerDay(round4(gross))
                .grossOperationalTonnesPerYear(round2(gross * DAYS_PER_YEAR))
                .changeTonnesPerDay(round4(change))
                .changePercent(changePercent)
                .electricityTonnesPerDay(round4(c.electricityTonnes))
                .transportTonnesPerDay(round4(c.transportTonnes))
                .additionalFuelTonnesPerDay(c.additionalTonnes > 0 ? round4(c.additionalTonnes) : null)
                .gridElectricityKwhPerDay(round2(c.gridKwh))
                .solarKwhPerDay(round2(c.d.solarKwhPerDay))
                .vehicleKmPerDay(round2(c.vehicleKmPerDay))
                .adjustments(adjustments)
                .treeNote(treeNote)
                .build();
    }

    private Design copy(Design s) {
        Design d = new Design();
        d.societyName = s.societyName;
        d.locationLabel = s.locationLabel;
        d.latitude = s.latitude;
        d.longitude = s.longitude;
        d.resolution = s.resolution;
        d.population = s.population;
        d.households = s.households;
        d.areaKm2 = s.areaKm2;
        d.areaUnit = s.areaUnit;
        d.greenCoverAreaToKm2Factor = s.greenCoverAreaToKm2Factor;
        d.petrolVehicles = s.petrolVehicles;
        d.dieselVehicles = s.dieselVehicles;
        d.electricVehicles = s.electricVehicles;
        d.kmPerVehiclePerDay = s.kmPerVehiclePerDay;
        d.petrolKmPerLitre = s.petrolKmPerLitre;
        d.dieselKmPerLitre = s.dieselKmPerLitre;
        d.electricKwhPerKm = s.electricKwhPerKm;
        d.electricityKwhPerDay = s.electricityKwhPerDay;
        d.commonFacilityKwhPerDay = s.commonFacilityKwhPerDay;
        d.solarKwhPerDay = s.solarKwhPerDay;
        d.treeCount = s.treeCount;
        d.greenCoverArea = s.greenCoverArea;
        d.treeSequestrationKgPerTreePerYear = s.treeSequestrationKgPerTreePerYear;
        d.treeSequestrationSource = s.treeSequestrationSource;
        d.additionalFuelLitresPerDay = s.additionalFuelLitresPerDay;
        d.additionalFuelType = s.additionalFuelType;
        d.includeModelEstimate = s.includeModelEstimate;
        d.assumptions = new ArrayList<>(s.assumptions);
        return d;
    }

    private SocietyPlanResponse.EmissionLine line(String source, String activity, String factor, double tonnes) {
        return SocietyPlanResponse.EmissionLine.builder()
                .source(source).activity(activity).factor(factor).tonnesPerDay(round4(tonnes)).build();
    }

    private SocietyPlanResponse.Assumption assumption(String field, String value, String source) {
        return SocietyPlanResponse.Assumption.builder()
                .field(field).value(value).source(source).userEditable(true).build();
    }

    private SocietyPlanResponse.FactorReference factor(String name, String value, String source) {
        return SocietyPlanResponse.FactorReference.builder().factor(name).value(value).source(source).build();
    }

    private static double share(double part, double total) {
        return total > 0 ? round2(part / total * 100.0) : 0.0;
    }

    private static double round2(double v) { return Math.round(v * 100.0) / 100.0; }
    private static double round4(double v) { return Math.round(v * 10000.0) / 10000.0; }

    private static double defaultZero(Double v) { return v == null ? 0.0 : v; }

    private static double clampPercent(double v) {
        if (v < 0) return 0;
        return Math.min(v, 100.0);
    }

    private static int nonNegative(Integer v) { return v == null ? 0 : Math.max(v, 0); }

    private static void requirePositive(Double v, String label) {
        if (v == null || v <= 0) {
            throw new IllegalArgumentException("The " + label + " must be greater than zero.");
        }
    }

    private static String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    /** Formats a number for display inside an explanation string. */
    private static String fmt(double v) {
        if (v == Math.rint(v)) return String.format(Locale.ROOT, "%,.0f", v);
        return String.format(Locale.ROOT, "%,.2f", v);
    }

    // ------------------------------------------------------------------ inner types

    /** Fully-resolved, validated design. */
    private static final class Design {
        String societyName;
        String locationLabel;
        Double latitude;
        Double longitude;
        String resolution;
        int population;
        int households;
        double areaKm2;
        String areaUnit;
        /** Multiplier turning green-cover figures in {@link #areaUnit} into km². */
        double greenCoverAreaToKm2Factor = 1.0;
        int petrolVehicles;
        int dieselVehicles;
        int electricVehicles;
        double kmPerVehiclePerDay;
        double petrolKmPerLitre;
        double dieselKmPerLitre;
        double electricKwhPerKm;
        double electricityKwhPerDay;
        double commonFacilityKwhPerDay;
        double solarKwhPerDay;
        int treeCount;
        Double greenCoverArea;
        Double treeSequestrationKgPerTreePerYear;
        String treeSequestrationSource;
        double additionalFuelLitresPerDay;
        String additionalFuelType = "diesel";
        boolean includeModelEstimate;
        List<SocietyPlanResponse.Assumption> assumptions = new ArrayList<>();
    }

    /** Intermediate arithmetic, kept so every response field comes from one calculation. */
    private static final class Calculation {
        Design d;
        double totalKwh;
        double gridKwh;
        double solarCredit;
        double excessSolar;
        double electricityTonnes;
        double petrolLitres;
        double dieselLitres;
        double evKwh;
        double petrolTonnes;
        double dieselTonnes;
        double evTonnes;
        double transportTonnes;
        double additionalTonnes;
        double vehicleKmPerDay;

        double totalTonnesPerDay() {
            return electricityTonnes + transportTonnes + additionalTonnes;
        }
    }
}
