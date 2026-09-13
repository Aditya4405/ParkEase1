package com.demo.parkease.dto;

import lombok.Data;

@Data
public class OwnerStatsResponse {
    private int totalParkings;
    private int totalSlots;
    private int activeBookings;
    private int totalBookings;
    private double totalRevenue;
    private int availableSlots;
    private int occupiedSlots;
    private int disabledSlots;
}