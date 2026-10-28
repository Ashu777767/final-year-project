package com.co2digitaltwin.backend.config;

import org.springframework.stereotype.Component;

/**
 * Emission factors used by the society planning module.
 *
 * All factors are published, citable figures kept in ONE place so they can be
 * reviewed and updated without touching the calculation. Factors are expressed so
 * that the arithmetic stays dimensionally obvious:
 *
 *   kg CO2 = (activity in the stated unit) x (factor in the stated unit)
 *
 * Nothing here is derived from the project's Random Forest model, the engineered
 * dataset, or any other internal estimate - these are published coefficients.
 *
 * <p><b>Sources</b>
 * <ul>
 *   <li>CEA (Central Electricity Authority, India), CO2 Baseline Database for the
 *       Indian Power Sector - weighted-average grid emission factor for India,
 *       ~0.71 kg CO2/kWh. Captive/thermal-heavy grids are higher; this is a national
 *       average and will over- or under-state a specific state grid.</li>
 *   <li>IPCC 2006 Guidelines for National Greenhouse Gas Inventories, Volume 2
 *       (Energy), default CO2 emission factors for road transport fuels:
 *       motor gasoline 2.31 kg CO2/litre, diesel 2.68 kg CO2/litre.</li>
 *   <li>Typical Indian passenger-car fuel economy, used ONLY as an editable default
 *       mileage: ~15 km/litre petrol, ~17 km/litre diesel. These are typical values,
 *       not a regulatory standard, and the UI lets the user change them.</li>
 *   <li>Electric two/three/four-wheeler efficiency ~0.15 kWh/km. A typical value for
 *       small Indian EVs; the user can change it.</li>
 * </ul>
 *
 * <p><b>Deliberately NOT provided</b>: a tree carbon-sequestration factor. Sequestration
 * depends on species, age, climate, survival rate and soil, so a single number would be
 * misleading. Trees and green cover are therefore reported as planning inputs and are
 * never subtracted from gross emissions unless the user supplies their own factor.
 */
@Component
public class SocietyEmissionFactors {

    // ------------------------------------------------------------------ electricity

    /**
     * Grid CO2 intensity, kg CO2 per kWh consumed.
     * Source: CEA CO2 Baseline Database for the Indian Power Sector (national average).
     */
    public static final double GRID_KG_CO2_PER_KWH = 0.71;
    public static final String GRID_SOURCE =
            "CEA CO2 Baseline Database for the Indian Power Sector — national weighted-average grid emission factor (~0.71 kg CO2/kWh)";

    // -------------------------------------------------------------------- transport

    /** Petrol (motor gasoline) combustion factor, kg CO2 per litre. Source: IPCC 2006, Vol. 2. */
    public static final double PETROL_KG_CO2_PER_LITRE = 2.31;
    /** Diesel combustion factor, kg CO2 per litre. Source: IPCC 2006, Vol. 2. */
    public static final double DIESEL_KG_CO2_PER_LITRE = 2.68;
    public static final String FUEL_SOURCE =
            "IPCC 2006 Guidelines for National GHG Inventories, Vol. 2 (Energy) — motor gasoline 2.31 kg CO2/litre, diesel 2.68 kg CO2/litre";

    /** Editable default fuel economy, km per litre. Typical Indian passenger car. */
    public static final double DEFAULT_PETROL_KM_PER_LITRE = 15.0;
    public static final double DEFAULT_DIESEL_KM_PER_LITRE = 17.0;

    /** Editable default EV consumption, kWh per km (small Indian EV). */
    public static final double DEFAULT_EV_KWH_PER_KM = 0.15;

    /**
     * Editable default daily distance per vehicle, km/day.
     * An ASSUMPTION, surfaced in the UI and adjustable; it is never applied silently.
     */
    public static final double DEFAULT_KM_PER_VEHICLE_PER_DAY = 30.0;

    // ------------------------------------------------------------------- unit helpers

    /** Exact conversion factors for land area. 1 acre = 4046.8564224 m²; 1 ha = 10000 m². */
    public static final double ACRES_TO_KM2 = 0.0040468564224;
    public static final double HECTARES_TO_KM2 = 0.01;
    public static final String AREA_SOURCE =
            "Exact unit definitions: 1 acre = 4046.8564224 m², 1 hectare = 10000 m²";

    /** Days per year used for annualisation of a daily rate. */
    public static final double DAYS_PER_YEAR = 365.0;
}
