package com.demo.parkease.dto;

import lombok.Data;
import java.util.List;

@Data
public class AdminStatsResponse {

    // ── Platform totals ───────────────────────────────────────────────────────
    private int    totalUsers;
    private int    totalOwners;
    private int    totalParkings;
    private int    totalSlots;
    private int    activeBookings;
    private int    totalBookings;
    private double totalRevenue;

    // ── Slot health ───────────────────────────────────────────────────────────
    private int    availableSlots;
    private int    occupiedSlots;
    private int    reservedSlots;
    private int    maintenanceSlots;
    private int    disabledSlots;

    // ── Recent bookings (last 10) for the bookings table ─────────────────────
    private List<BookingResponse> recentBookings;

    // ── Top parkings by booking count ─────────────────────────────────────────
    private List<ParkingSummary> topParkings;

    @Data
    public static class ParkingSummary {
        private Long   id;
        private String name;
        private String location;
        private String ownerName;
        private int    totalSlots;
        private int    occupied;
        private int    bookingCount;
        private double revenue;
    }
}