package com.demo.parkease.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateParkingRequest {

    private String name;
    private String location;
    private String description;

    // Each config = one vehicle type block from AddParking.jsx
    private List<SlotConfig> slotConfigs;

    @Data
    public static class SlotConfig {
        private String vehicleType;   // "CAR", "BIKE", "LARGE", "SMALL"
        private int numberOfSlots;
        private double costPerHour;
    }
}