package com.demo.parkease.dto;

import lombok.Data;

@Data
public class BookingResponse {
    private Long id;
    private Long parkingId;
    private String parkingName;
    private String parkingLocation;
    private Long slotId;
    private String slotCode;
    private String vehicleType;
    private Long userId;
    private String userName;
    private String vehicleNumber;
    private String startTime;
    private String endTime;
    private Double amount;
    private String status;
    private String createdAt;
}