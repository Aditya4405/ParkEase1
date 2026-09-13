package com.demo.parkease.dto;

import lombok.Data;

@Data
public class CreateSlotRequest {
    private String vehicleType;
    private double costPerHour;
}