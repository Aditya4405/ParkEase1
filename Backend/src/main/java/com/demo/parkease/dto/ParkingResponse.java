package com.demo.parkease.dto;

import lombok.Data;
import java.util.List;

@Data
public class ParkingResponse {
    private Long id;
    private String name;
    private String location;
    private String description;
    private int totalSlots;
    private int occupied;
    private int occupancyRate;
    private String createdAt;
    private List<ParkingSlotResponse> slots;
}