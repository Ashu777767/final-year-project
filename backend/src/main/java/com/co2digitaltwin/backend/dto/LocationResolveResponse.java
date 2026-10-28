package com.co2digitaltwin.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Outcome of an assisted location lookup.
 *
 * `resolution` records HOW the coordinates were obtained so the UI never implies
 * that approximate coordinates are the exact building/society.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationResolveResponse {
    private boolean resolved;
    /** ex: exact | pincode | address | locality | landmark | manual */
    private String resolution;
    /** Human-readable explanation shown to the user. */
    private String message;
    /** True when the coordinates are not the exact requested area. */
    private boolean approximate;
    private String name;
    private String state;
    private Double latitude;
    private Double longitude;
}
