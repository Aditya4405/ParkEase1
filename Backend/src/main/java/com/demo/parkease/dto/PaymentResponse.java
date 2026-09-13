package com.demo.parkease.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * Returned by every payment endpoint.
 *
 * After /confirm, PaymentPage.jsx stores this in localStorage as
 * "parkease_active_booking" for ActiveParking.jsx to read.
 *
 * Fields mapping (PaymentPage.jsx line ~146):
 *   bookingId      → activeBooking.bookingId
 *   paymentId      → activeBooking.paymentId
 *   slotCode       → activeBooking.slotId        (the display code e.g. "CAR-01")
 *   slotId         → activeBooking.slotDbId      (the DB numeric id)
 *   parkingName    → activeBooking.parkingName
 *   vehicleNumber  → activeBooking.vehicleNumber
 *   startTime      → activeBooking.startTime
 *   endTime        → activeBooking.endTime
 *   ratePerHour    → activeBooking.ratePerHour
 *   amount         → activeBooking.totalPaid
 *   transactionId  → activeBooking.transactionId
 *   bookingStatus  → used to verify ACTIVE state
 */
@Data
public class PaymentResponse {

    // ── Core payment info ─────────────────────────────────────────────────────
    private Long          paymentId;
    private Long          bookingId;
    private Double        amount;

    /** "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" */
    private String        status;

    /** "BOOKING" | "EXTENSION" | "PENALTY" */
    private String        paymentType;

    /** "UPI" | "CARD" | "WALLET" — null until confirmed */
    private String        paymentMethod;

    /** Simulated gateway ID — null until confirmed */
    private String        transactionId;

    private LocalDateTime paidAt;
    private LocalDateTime createdAt;

    // ── Booking snapshot ──────────────────────────────────────────────────────
    // All fields below are populated after /confirm so the frontend can
    // immediately render ActiveParking.jsx without a second API call.

    /** "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED" */
    private String        bookingStatus;

    /** Slot display code e.g. "CAR-01" — shown in ActiveParking.jsx */
    private String        slotCode;

    /** DB primary key of the slot — stored as slotDbId in localStorage */
    private Long          slotId;

    /** ₹ per hour — used by extend flow to calculate extension cost */
    private Double        ratePerHour;

    private String        parkingName;
    private String        parkingLocation;
    private String        vehicleNumber;

    /** ISO datetime string e.g. "2026-03-14T10:00:00" */
    private String        startTime;
    private String        endTime;
}