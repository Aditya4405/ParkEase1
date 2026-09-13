package com.demo.parkease.dto;

import lombok.Data;

@Data
public class ParkingSlotResponse {
    private Long id;
    private String slotCode;
    private String vehicleType;
    private String vehicleTypeLabel;
    private Double costPerHour;
    private String status;
    private Boolean disabled;
}