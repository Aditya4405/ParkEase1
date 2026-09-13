package com.demo.parkease.dto;

import lombok.Data;

@Data
public class UserStatsResponse {

    // Booking counts
    private int totalBookings;
    private int activeBookings;
    private int completedBookings;
    private int cancelledBookings;

    // Spending
    private double totalAmountSpent;

    // Current active booking snapshot (null if no active booking)
    private ActiveBookingSnapshot activeBooking;

    @Data
    public static class ActiveBookingSnapshot {
        private Long   bookingId;
        private String parkingName;
        private String parkingLocation;
        private String slotCode;
        private Long   slotDbId;        // ← NEW: DB id of the slot
        private Double ratePerHour;     // ← NEW: needed by Extend flow
        private String vehicleNumber;
        private String startTime;
        private String endTime;
        private Double amount;
    }
}