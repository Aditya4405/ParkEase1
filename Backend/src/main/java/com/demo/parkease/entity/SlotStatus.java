package com.demo.parkease.entity;

public enum SlotStatus {
    AVAILABLE,    // free to book
    RESERVED,     // held during checkout (max 15 min via scheduler)
    OCCUPIED,     // actively being used
    MAINTENANCE   // disabled by owner
}