package com.demo.parkease.exception;

/**
 * Thrown during login when the user's owner application has been REJECTED.
 * Results in HTTP 403 with applicationStatus="OWNER_REJECTED" in the body.
 */
public class OwnerRejectedException extends RuntimeException {

    private final String rejectionReason;

    public OwnerRejectedException(String rejectionReason) {
        super("Your owner application was not approved.");
        this.rejectionReason = rejectionReason != null ? rejectionReason : "No reason provided.";
    }

    public String getRejectionReason() {
        return rejectionReason;
    }
}
