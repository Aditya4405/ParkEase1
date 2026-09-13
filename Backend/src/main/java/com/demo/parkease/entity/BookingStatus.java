package com.demo.parkease.entity;

public enum BookingStatus {
    PENDING,      // payment initiated, slot reserved — waiting for /confirm
    ACTIVE,       // payment confirmed, slot occupied
    COMPLETED,    // parking ended (clean or penalty paid)
    CANCELLED     // cancelled by user / owner / scheduler
}