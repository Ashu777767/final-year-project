package com.co2digitaltwin.backend.service;

import com.co2digitaltwin.backend.dto.LocationSearchResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@Slf4j
public class GeocodingService {

    private static final String NOMINATIM_SEARCH_URL =
            "https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=10&countrycodes=in&q=";

    private static final int CONNECT_TIMEOUT_MS = 5000;
    private static final int READ_TIMEOUT_MS = 8000;

    /** India bounding box - invalid coordinates are rejected rather than guessed. */
    private static final double MIN_LAT = 6.0;
    private static final double MAX_LAT = 38.0;
    private static final double MIN_LNG = 68.0;
    private static final double MAX_LNG = 98.0;

    /** Place classes that describe a settlement, administrative area or a building. */
    private static final Set<String> AREA_CLASSES = Set.of("place", "boundary", "building", "landuse");

    /**
     * Types a user can meaningfully select as an "area", including named societies
     * and complexes so small local areas can be located exactly. Shops, bus stops and
     * other POIs remain filtered out, and the generic "yes" type is deliberately
     * excluded so ordinary buildings do not flood city search results.
     */
    private static final Set<String> AREA_TYPES = Set.of(
            "city", "town", "village", "hamlet", "suburb", "neighbourhood", "quarter",
            "municipality", "city_district", "district", "county", "state", "borough",
            "administrative", "locality", "island", "region",
            // administrative areas returned for locality queries
            "local_authority", "administrative_area_level_2",
            // small-area / society level
            "residential", "apartments", "house", "dwelling", "commercial", "industrial",
            "farm", "allotments"
    );

    private final RestTemplate restTemplate;

    /**
     * Short-lived cache of successful lookups. Nominatim's usage policy is ~1
     * request/second, and the assisted resolver can issue several queries in one
     * action; caching avoids re-querying the same text and reduces throttling.
     */
    private final Map<String, CachedLookup> cache = new java.util.concurrent.ConcurrentHashMap<>();

    private static final long CACHE_TTL_MS = 5 * 60 * 1000L;
    /** Nominatim asks for at most one request per second. */
    private static final long MIN_REQUEST_GAP_MS = 1000L;

    private volatile long lastRequestAt = 0L;

    private record CachedLookup(List<LocationSearchResult> results, long at) {}

    public GeocodingService() {
        // External geocoding must never hang a user request: without explicit
        // timeouts a slow Nominatim response leaves the search spinner running
        // forever ("search sometimes does not complete").
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(CONNECT_TIMEOUT_MS);
        factory.setReadTimeout(READ_TIMEOUT_MS);
        this.restTemplate = new RestTemplate(factory);
    }

    /**
     * Geocodes a free-text query.
     *
     * @return the matching results (possibly empty when the query genuinely has no
     *         match), or {@code null} when the lookup could not be performed at all
     *         (network error / throttling). Callers must treat null as "unknown",
     *         never as "not found", so a service failure is not misreported to the
     *         user as a non-existent address.
     */
    public List<LocationSearchResult> search(String query) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }

        String key = query.trim().toLowerCase();
        CachedLookup cached = cache.get(key);
        if (cached != null && (System.currentTimeMillis() - cached.at()) < CACHE_TTL_MS) {
            return cached.results();
        }

        try {
            // Space out requests to respect Nominatim's rate limit.
            throttle();

            String url = NOMINATIM_SEARCH_URL + java.net.URLEncoder.encode(query.trim(), StandardCharsets.UTF_8);

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "co2-digital-twin-app");
            headers.set("Accept-Language", "en");
            HttpEntity<?> entity = new HttpEntity<>(headers);

            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );

            List<LocationSearchResult> all = new ArrayList<>();
            List<LocationSearchResult> settlements = new ArrayList<>();

            if (response.getBody() != null) {
                for (Map<String, Object> item : response.getBody()) {
                    LocationSearchResult result = toSearchResult(item);
                    if (result == null) {
                        continue;
                    }
                    all.add(result);
                    if (isSettlement(item)) {
                        settlements.add(result);
                    }
                }
            }

            // Prefer real settlements/localities; only fall back to broader matches
            // when nothing settlement-like was returned for a valid query.
            List<LocationSearchResult> results = dedupe(settlements.isEmpty() ? all : settlements);

            // Only successful (non-empty) lookups are cached. Caching an empty result
            // would let one throttled/slow response permanently poison that query,
            // which previously made a valid address look non-existent.
            if (!results.isEmpty()) {
                cache.put(key, new CachedLookup(results, System.currentTimeMillis()));
            }
            return results;
        } catch (Exception e) {
            log.error("Failed to search location: {}", query, e);
            return null;
        }
    }

    private void throttle() {
        long since = System.currentTimeMillis() - lastRequestAt;
        if (since < MIN_REQUEST_GAP_MS) {
            try {
                Thread.sleep(MIN_REQUEST_GAP_MS - since);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            }
        }
        lastRequestAt = System.currentTimeMillis();
    }

    private List<LocationSearchResult> dedupe(List<LocationSearchResult> input) {
        Map<String, LocationSearchResult> deduped = new LinkedHashMap<>();
        for (LocationSearchResult result : input) {
            String key = result.getName().toLowerCase() + "|" + result.getState().toLowerCase();
            deduped.putIfAbsent(key, result);
        }
        return new ArrayList<>(deduped.values());
    }

    // ---------------------------------------------------------------- assisted lookup

    /**
     * Resolves coordinates from progressively broader user-supplied information.
     *
     * Order: exact area -> pincode -> full address -> locality+city+state ->
     * landmark+locality/city -> manual coordinates. Coordinates are NEVER invented;
     * if nothing resolves, an unresolved response is returned and the caller must not
     * continue to the model.
     */
    public com.co2digitaltwin.backend.dto.LocationResolveResponse resolve(
            com.co2digitaltwin.backend.dto.LocationResolveRequest req) {

        String areaName = trimToNull(req.getAreaName());

        // F: manual coordinates are a valid, explicit user input (validated below).
        Double manualLat = req.getLatitude();
        Double manualLng = req.getLongitude();
        boolean manualSupplied = manualLat != null || manualLng != null;

        // A..E automatic resolution from the supplied information.
        List<String[]> attempts = new ArrayList<>();
        String pincode = trimToNull(req.getPincode());
        String address = trimToNull(req.getAddress());
        String locality = trimToNull(req.getLocality());
        String city = trimToNull(req.getCity());
        String state = trimToNull(req.getState());
        String landmark = trimToNull(req.getLandmark());

        if (pincode != null) {
            attempts.add(new String[]{join(pincode, city, state), "pincode",
                    "Location resolved using pincode"});
        }
        if (address != null) {
            attempts.add(new String[]{address, "address",
                    "Location resolved using the address you provided"});
        }
        if (locality != null || city != null) {
            attempts.add(new String[]{join(locality, city, state), "locality",
                    "Approximate area location (locality/city level)"});
        }
        // Broader retry of the free-text address with its administrative context.
        if (address != null) {
            attempts.add(new String[]{join(address, city, state), "address",
                    "Approximate area location resolved from the address you provided"});
            // Geocoders are sensitive to overly specific queries, so also try the
            // address without the trailing administrative part.
            attempts.add(new String[]{dropLastSegment(address), "address",
                    "Approximate area location resolved from the address you provided"});
        }
        if (landmark != null) {
            attempts.add(new String[]{join(landmark, locality, city), "landmark",
                    "Approximate area location (resolved from the landmark)"});
        }

        boolean lookupFailed = false;

        for (String[] attempt : attempts) {
            String query = attempt[0];
            if (query == null || query.isBlank()) {
                continue;
            }
            List<LocationSearchResult> found = search(query);
            if (found == null) {
                // The lookup itself failed - remember it so we do not tell the user
                // their address does not exist when the service was simply unavailable.
                lookupFailed = true;
                continue;
            }
            if (!found.isEmpty()) {
                LocationSearchResult best = found.get(0);
                return resolved(attempt[1], attempt[2], true, areaName, best);
            }
        }

        // Manual coordinates are the final fallback.
        if (manualSupplied) {
            if (isValidCoordinate(manualLat, manualLng)) {
                return com.co2digitaltwin.backend.dto.LocationResolveResponse.builder()
                        .resolved(true)
                        .resolution("manual")
                        .message("Location entered manually")
                        .approximate(false)
                        .name(areaName != null ? areaName : (city != null ? city : "Custom area"))
                        .state(state)
                        .latitude(manualLat)
                        .longitude(manualLng)
                        .build();
            }
            return unresolved("Those coordinates are not valid. Latitude must be between "
                    + MIN_LAT + " and " + MAX_LAT + ", and longitude between "
                    + MIN_LNG + " and " + MAX_LNG + ".");
        }

        if (lookupFailed) {
            return unresolved("The location lookup service is temporarily unavailable. "
                    + "Please try again in a moment, or enter coordinates manually.");
        }

        return unresolved("We still couldn't locate this area. Please provide a valid pincode, "
                + "address, or coordinates to continue.");
    }

    private com.co2digitaltwin.backend.dto.LocationResolveResponse resolved(
            String resolution, String message, boolean approximate, String areaName,
            LocationSearchResult best) {
        return com.co2digitaltwin.backend.dto.LocationResolveResponse.builder()
                .resolved(true)
                .resolution(resolution)
                .message(message)
                .approximate(approximate)
                .name(areaName != null ? areaName : best.getName())
                .state(best.getState())
                .latitude(best.getLat())
                .longitude(best.getLng())
                .build();
    }

    private com.co2digitaltwin.backend.dto.LocationResolveResponse unresolved(String message) {
        return com.co2digitaltwin.backend.dto.LocationResolveResponse.builder()
                .resolved(false)
                .resolution("unresolved")
                .message(message)
                .build();
    }

    /** Bounding box for India plus rejection of the null-island 0,0 point. */
    public static boolean isValidCoordinate(Double lat, Double lng) {
        if (lat == null || lng == null || lat.isNaN() || lng.isNaN()) {
            return false;
        }
        if (Math.abs(lat) < 0.0001 && Math.abs(lng) < 0.0001) {
            return false; // never accept 0,0
        }
        return lat >= MIN_LAT && lat <= MAX_LAT && lng >= MIN_LNG && lng <= MAX_LNG;
    }

    private static String join(String... parts) {
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (p != null && !p.isBlank()) {
                if (sb.length() > 0) sb.append(", ");
                sb.append(p.trim());
            }
        }
        String out = sb.toString();
        return out.isBlank() ? null : out;
    }

    private static String trimToNull(String v) {
        if (v == null) return null;
        String t = v.trim();
        return t.isEmpty() ? null : t;
    }

    /**
     * Drops the final comma-separated segment (usually the state or country) so an
     * over-specific address still has a chance of resolving.
     */
    private static String dropLastSegment(String value) {
        if (value == null) return null;
        int idx = value.lastIndexOf(',');
        if (idx <= 0) return null;
        String trimmed = value.substring(0, idx).trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean isSettlement(Map<String, Object> item) {        String category = item.get("category") != null ? String.valueOf(item.get("category")).toLowerCase() : "";
        String type = item.get("type") != null ? String.valueOf(item.get("type")).toLowerCase() : "";
        return (AREA_CLASSES.contains(category) || AREA_TYPES.contains(category))
                && AREA_TYPES.contains(type);
    }

    @SuppressWarnings("unchecked")
    private LocationSearchResult toSearchResult(Map<String, Object> item) {
        try {
            Object latRaw = item.get("lat");
            Object lonRaw = item.get("lon");
            if (latRaw == null || lonRaw == null) {
                return null;
            }
            Double lat = Double.parseDouble(String.valueOf(latRaw));
            Double lon = Double.parseDouble(String.valueOf(lonRaw));

            Map<String, Object> address = item.get("address") instanceof Map
                    ? (Map<String, Object>) item.get("address")
                    : Map.of();

            String type = item.get("type") != null ? String.valueOf(item.get("type")) : "";
            String category = item.get("category") != null ? String.valueOf(item.get("category")).toLowerCase() : "";

            // Reject obvious points of interest outright; settlement-vs-broad
            // preference is applied by the caller.
            if (!AREA_CLASSES.contains(category) && !AREA_TYPES.contains(type.toLowerCase())) {
                return null;
            }

            String name = firstNonBlank(
                    str(item.get("name")),
                    str(address.get("city")),
                    str(address.get("town")),
                    str(address.get("village")),
                    str(address.get("suburb")),
                    str(address.get("county")),
                    firstDisplaySegment(item.get("display_name"))
            );
            if (name == null || name.isBlank()) {
                return null;
            }

            // Use the real administrative state, never a postcode.
            String state = firstNonBlank(
                    str(address.get("state")),
                    str(address.get("state_district")),
                    str(address.get("county")),
                    str(address.get("country"))
            );

            return LocationSearchResult.builder()
                    .name(name)
                    .state(state != null ? state : "")
                    .lat(lat)
                    .lng(lon)
                    .build();
        } catch (Exception e) {
            log.debug("Skipping unusable geocoding entry: {}", item, e);
            return null;
        }
    }

    private static String str(Object value) {
        if (value == null) {
            return null;
        }
        String s = String.valueOf(value).trim();
        return s.isEmpty() ? null : s;
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v;
            }
        }
        return null;
    }

    private static String firstDisplaySegment(Object displayName) {
        String s = str(displayName);
        if (s == null) {
            return null;
        }
        int comma = s.indexOf(',');
        return (comma > 0 ? s.substring(0, comma) : s).trim();
    }
}
