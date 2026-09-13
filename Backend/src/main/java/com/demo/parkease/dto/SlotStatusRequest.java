package com.demo.parkease.dto;

import lombok.Data;

@Data
public class SlotStatusRequest {
    private String status; // "AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"
}