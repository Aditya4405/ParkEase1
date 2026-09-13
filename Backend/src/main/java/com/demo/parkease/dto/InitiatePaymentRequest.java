package com.demo.parkease.dto;

import lombok.Data;

@Data
public class InitiatePaymentRequest {

    private Long slotId;
    private Long parkingId;
    private String vehicleNumber;
    private String startTime;   // "2026-03-07T10:00:00" — matches CreateBookingRequest style
    private String endTime;     // "2026-03-07T12:00:00"

    /**
     * "BOOKING"   — new slot booking
     * "EXTENSION" — extend an active booking (requires bookingId + extensionHours)
     * "PENALTY"   — pay overtime penalty (requires bookingId)
     */
    private String paymentType;

    // Required for EXTENSION and PENALTY
    private Long bookingId;

    // Required for EXTENSION — how many additional hours
    private Integer extensionHours;
}