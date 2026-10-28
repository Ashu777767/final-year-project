package com.co2digitaltwin.backend.service;

import com.co2digitaltwin.backend.data.DatasetRepository;
import com.co2digitaltwin.backend.dto.DatasetRow;
import com.co2digitaltwin.backend.dto.HotspotDetail;
import com.co2digitaltwin.backend.dto.HotspotSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class HotspotService {

    private final DatasetRepository datasetRepository;

    private static final int MAX_ZONES = 5;

    /**
     * Returns hotspot zones for the active area.
     *
     * When the area is covered by the engineered dataset the zones are real observed
     * sampling points. Otherwise a deterministic set of surrounding zones is derived
     * from the selected coordinates - never random values, so repeated requests and
     * page switches stay consistent.
     */
    public List<HotspotSummary> getHotspots(String city, Double lat, Double lng, String dataSource) {
        return getHotspots(city, lat, lng, dataSource, null);
    }

    /**
     * @param baselineTonnesPerDay the area's own modelled value when known (custom
     *        areas), so the reported point reflects the real profile instead of an
     *        invented number.
     */
    public List<HotspotSummary> getHotspots(String city, Double lat, Double lng, String dataSource,
                                            Double baselineTonnesPerDay) {
        if (datasetRepository.isCityInDataset(city)) {
            List<HotspotSummary> observed = observedZones(city);
            if (!observed.isEmpty()) {
                return sortResults(observed);
            }
        }

        // Custom / small areas (societies, colonies, campuses) have no dataset
        // coverage. Inventing surrounding zones for them would fabricate spatial data,
        // so a single modelled point is reported at the resolved coordinates instead.
        if (dataSource != null && dataSource.toLowerCase().contains("survey")) {
            return sortResults(singleModelledPoint(city, lat, lng, baselineTonnesPerDay));
        }

        return sortResults(surroundingZones(city, lat, lng));
    }

    /**
     * One modelled point for an area created through the Area Profile survey.
     * No surrounding zones are invented because none exist in the data. The value is
     * the area's own modelled prediction when supplied.
     */
    private List<HotspotSummary> singleModelledPoint(String city, Double lat, Double lng,
                                                     Double baselineTonnesPerDay) {
        if (!GeocodingService.isValidCoordinate(lat, lng)) {
            return List.of();
        }
        String label = (city == null || city.isBlank()) ? "Selected area" : city;
        double co2Tonnes = baselineTonnesPerDay != null && baselineTonnesPerDay > 0 ? baselineTonnesPerDay : 0.0;

        return List.of(HotspotSummary.builder()
                .id(1)
                .area(String.format(Locale.ROOT, "Modelled point — %s · %.4f°N, %.4f°E", label, lat, lng))
                .co2Level((int) Math.round(co2Tonnes * 1000.0))
                .risk(determineRisk(co2Tonnes))
                .trend("Stable")
                .lat(lat)
                .lng(lng)
                .dataSource("Survey-based estimate")
                .zoneKind("modelled")
                .vehicleDensityKm2(0.0)
                .build());
    }

    /** Real dataset sampling points for a city we hold data for. */
    private List<HotspotSummary> observedZones(String city) {
        List<DatasetRow> allRows = datasetRepository.getAllRowsForCity(city);
        List<DatasetRow> distinctLocations = new ArrayList<>();
        for (DatasetRow row : allRows) {
            boolean seen = distinctLocations.stream().anyMatch(d ->
                    Math.abs(d.getLatitude() - row.getLatitude()) < 0.001
                            && Math.abs(d.getLongitude() - row.getLongitude()) < 0.001);
            if (!seen) {
                distinctLocations.add(row);
            }
            if (distinctLocations.size() >= MAX_ZONES) {
                break;
            }
        }

        List<HotspotSummary> results = new ArrayList<>();
        int id = 1;
        for (DatasetRow loc : distinctLocations) {
            double co2Tonnes = loc.getCo2Tonnes() != null ? loc.getCo2Tonnes() : 0.0;
            results.add(HotspotSummary.builder()
                    .id(id)
                    // Labelled as a sampled location (with its true coordinates) so the
                    // UI never implies real neighbourhood-level inventory data.
                    .area(String.format(Locale.ROOT, "Sampled location — %s · %.3f°N, %.3f°E",
                            city, loc.getLatitude(), loc.getLongitude()))
                    .co2Level((int) Math.round(co2Tonnes * 1000.0))
                    .risk(determineRisk(co2Tonnes))
                    .trend("Stable")
                    .lat(loc.getLatitude())
                    .lng(loc.getLongitude())
                    .dataSource("Dataset-backed")
                    .zoneKind("sampled")
                    .vehicleDensityKm2(loc.getVehicleDensityKm2())
                    .build());
            id++;
        }
        return results;
    }

    /**
     * Deterministic surrounding zones for an area without dataset coverage.
     * Offsets are fixed bearings around the selected point and are scaled by the
     * area's own footprint when known, so the same location always yields the
     * same zones.
     */
    private List<HotspotSummary> surroundingZones(String city, Double lat, Double lng) {
        List<HotspotSummary> results = new ArrayList<>();
        String baseCity = (city == null || city.isBlank()) ? "Selected area" : city;
        double baseLat = lat != null ? lat : 12.9716;
        double baseLng = lng != null ? lng : 77.5946;

        double spread = resolveSpreadDegrees(city);

        Object[][] zones = {
                {"North",  spread,        0.0},
                {"East",   0.0,           spread},
                {"South", -spread,        0.0},
                {"West",   0.0,          -spread},
        };

        int id = 1;
        for (Object[] zone : zones) {
            String label = (String) zone[0];
            double zoneLat = baseLat + (Double) zone[1];
            double zoneLng = baseLng + (Double) zone[2];

            // Deterministic, coordinate-derived magnitude: no randomness, and it
            // varies realistically with distance from the selected centre.
            double distanceFactor = Math.hypot(zoneLat - baseLat, zoneLng - baseLng);
            double co2Tonnes = 1.5 + (distanceFactor * 30.0);

            results.add(HotspotSummary.builder()
                    .id(id)
                    .area("Modelled zone — " + baseCity + " " + label)
                    .co2Level((int) Math.round(co2Tonnes * 1000.0))
                    .risk(determineRisk(co2Tonnes))
                    .trend("Stable")
                    .lat(round6(zoneLat))
                    .lng(round6(zoneLng))
                    .dataSource("Model-estimated hotspot zone")
                    .zoneKind("modelled")
                    .vehicleDensityKm2(round2(2000.0 + (distanceFactor * 40000.0)))
                    .build());
            id++;
        }
        return results;
    }

    /**
     * Spread of the surrounding zones in degrees, derived from the city footprint
     * when the dataset knows it (roughly 25% of the city radius).
     */
    private double resolveSpreadDegrees(String city) {
        if (datasetRepository.isCityInDataset(city)) {
            List<DatasetRow> rows = datasetRepository.getAllRowsForCity(city);
            if (!rows.isEmpty() && rows.get(0).getAreaKm2() != null) {
                double radiusKm = Math.sqrt(rows.get(0).getAreaKm2() / Math.PI);
                double spread = (radiusKm * 0.25) / 111.0;
                if (spread > 0.005) {
                    return Math.min(spread, 0.05);
                }
            }
        }
        return 0.02;
    }

    private static double round6(double v) {
        return Math.round(v * 1_000_000.0) / 1_000_000.0;
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    /**
     * Highest modelled level first. Sorting a copy matters: the single modelled point
     * for a surveyed custom area is built with {@code List.of(...)}, which is
     * immutable, so sorting it in place threw UnsupportedOperationException and turned
     * every /api/hotspots and /api/map/markers request for a custom area into a 500.
     */
    private List<HotspotSummary> sortResults(List<HotspotSummary> results) {
        if (results == null || results.isEmpty()) {
            return List.of();
        }
        List<HotspotSummary> sorted = new ArrayList<>(results);
        sorted.sort(Comparator.comparing(HotspotSummary::getCo2Level).reversed());
        return sorted;
    }

    private String determineRisk(double co2) {
        if (co2 > 4.5) return "Critical";
        if (co2 > 3.0) return "High";
        if (co2 > 1.5) return "Medium";
        return "Low";
    }

    /**
     * Detail for a hotspot that belongs to the currently selected area, so the
     * panel shows the same zone the table lists instead of a generic placeholder.
     */
    public HotspotDetail getHotspotDetail(int id, String city, Double lat, Double lng, String dataSource) {
        return getHotspotDetail(id, city, lat, lng, dataSource, null);
    }

    public HotspotDetail getHotspotDetail(int id, String city, Double lat, Double lng, String dataSource,
                                          Double baselineTonnesPerDay) {
        List<HotspotSummary> hotspots = getHotspots(city, lat, lng, dataSource, baselineTonnesPerDay);

        HotspotSummary match = hotspots.stream()
                .filter(h -> h.getId() == id)
                .findFirst()
                .orElse(null);

        if (match == null) {
            return null;
        }

        double co2Tonnes = match.getCo2Level() / 1000.0;
        double vehicleDensity = match.getVehicleDensityKm2();

        String trafficLevel = vehicleDensity > 8000 ? "Very High"
                : vehicleDensity > 4000 ? "High"
                : vehicleDensity > 2000 ? "Medium"
                : "Low";

        List<String> factors = new ArrayList<>();
        if (vehicleDensity > 4000) {
            factors.add("High vehicular density");
        } else {
            factors.add("Moderate vehicular density");
        }
        if (co2Tonnes > 3.0) {
            factors.add("Elevated emission concentration");
        }
        factors.add("Limited dispersion in built-up area");

        // Short deterministic illustration around the observed level. The dataset has
        // no per-location history, so this is flagged as derived rather than recorded.
        List<Integer> trend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            trend.add((int) Math.round(match.getCo2Level() * (1.0 - (i * 0.012))));
        }

        return HotspotDetail.builder()
                .area(match.getArea())
                .co2Level(match.getCo2Level())
                .severity(match.getRisk())
                .mainFactor(factors.get(0))
                .trafficLevel(trafficLevel)
                .industrialActivity(co2Tonnes > 3.0 ? "High" : "Medium")
                .greenCover(vehicleDensity > 4000 ? "Low" : "Medium")
                .trend(trend)
                .trendIsDerived(true)
                .factors(factors)
                .zoneKind(match.getZoneKind())
                .recommendedIntervention(vehicleDensity > 4000
                        ? "Green Corridor + Traffic Reduction"
                        : "Tree Plantation + Biofilter")
                .build();
    }
}
