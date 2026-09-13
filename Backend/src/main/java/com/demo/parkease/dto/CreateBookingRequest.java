package com.demo.parkease.dto;

import lombok.Data;

@Data
public class CreateBookingRequest {
    private Long parkingId;
    private Long slotId;
    private String vehicleNumber;
    private String startTime; // "2026-03-07T10:00:00"
    private String endTime;   // "2026-03-07T12:00:00"
}