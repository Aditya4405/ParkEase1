package com.demo.parkease.exception;

/**
 * Thrown during login when the user's owner application is still PENDING.
 * Results in HTTP 403 with applicationStatus="OWNER_PENDING" in the body.
 */
public class OwnerPendingException extends RuntimeException {

    private final String applicationRef;

    public OwnerPendingException(String applicationRef) {
        super("Your owner application is awaiting admin approval.");
        this.applicationRef = applicationRef;
    }

    public String getApplicationRef() {
        return applicationRef;
    }
}
