package com.demo.parkease.dto;

import lombok.Data;

/**
 * Request DTO for submitting an owner application.
 * Account fields (name, email, phone, password) are also included
 * since the applicant may not have an account yet.
 */
@Data
public class OwnerApplicationRequest {

    // ── Account Information ───────────────────────────────────────────────────
    private String name;
    private String email;
    private String phone;
    private String password;

    // ── Business / Owner Information ─────────────────────────────────────────
    private String businessName;
    private String businessType;
    private String address;
    private String city;
    private String state;
    private String pinCode;
    private String contactNumber;

    /** PAN / GST / Registration number — configurable, not legally mandated here */
    private String businessIdentifier;

    private Integer numberOfLocations;
    private String ownershipType;

    // ── Parking Information ──────────────────────────────────────────────────
    private String parkingSpaceName;
    private String parkingAddress;
    private String parkingCity;
    private String parkingState;
    private String parkingPinCode;
    private Integer approxSlots;
    private String parkingType;
    private String vehicleTypesSupported;
}
