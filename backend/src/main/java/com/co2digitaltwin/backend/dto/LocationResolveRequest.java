package com.co2digitaltwin.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Extra location information supplied by the user when an area name cannot be
 * resolved to coordinates automatically. Coordinates are never invented: if none of
 * these resolve, the request fails with a clear message instead of guessing.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationResolveRequest {
    /** Original area/society name the user typed. */
    private String areaName;
    private String pincode;
    private String address;
    private String locality;
    private String city;
    private String state;
    private String landmark;
    /** Optional manual coordinates - used only after automatic resolution fails. */
    private Double latitude;
    private Double longitude;
}
