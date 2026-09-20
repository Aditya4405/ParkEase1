package com.demo.parkease.entity;

/**
 * Status of an owner application in the ParkEase approval workflow.
 */
public enum ApplicationStatus {
    /** Submitted, waiting for admin action. */
    PENDING,
    /** Admin has started reviewing but not yet decided. */
    UNDER_REVIEW,
    /** Approved — user account is now an active OWNER. */
    APPROVED,
    /** Rejected — reason stored in OwnerApplication.rejectionReason. */
    REJECTED
}
