package com.demo.parkease.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserParkingResponse {

    private Long id;
    private String name;
    private String location;
    private String description;

    // Slot summary
    private int totalSlots;
    private int availableSlots;
    private int occupiedSlots;

    // Vehicle types available at this parking (e.g. ["CAR", "BIKE"])
    private List<String> vehicleTypes;

    // Price range (cheapest slot cost per hour across all slots)
    private Double minCostPerHour;
    private Double maxCostPerHour;

    // Full slot list — used by ParkingSlots.jsx to render the slot grid
    private List<UserSlotResponse> slots;

    @Data
    public static class UserSlotResponse {
        private Long id;
        private String slotCode;
        private String vehicleType;
        private String vehicleTypeLabel;
        private Double costPerHour;
        private String status;       // "AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"
        private Boolean disabled;
        private Boolean bookable;    // true only if AVAILABLE and not disabled
    }
}