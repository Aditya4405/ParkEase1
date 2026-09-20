package com.demo.parkease.config;

import com.demo.parkease.exception.OwnerPendingException;
import com.demo.parkease.exception.OwnerRejectedException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Catches Exceptions thrown anywhere in the service layer and
 * returns clean JSON { "message": "..." } instead of Spring's HTML error page.
 *
 * The frontend api.js reads: body.message || body.error
 *
 * Special handling:
 *   - OwnerPendingException  → 403 + { applicationStatus: "OWNER_PENDING",  ... }
 *   - OwnerRejectedException → 403 + { applicationStatus: "OWNER_REJECTED", ... }
 *   - DataIntegrityViolationException → 400/409 with user-friendly text (no SQL leaks)
 */
@RestControllerAdvice
class GlobalExceptionHandler {

    /** Pending owner tried to log in — frontend redirects to /owner/application-pending */
    @ExceptionHandler(OwnerPendingException.class)
    public ResponseEntity<Map<String, String>> handleOwnerPending(OwnerPendingException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("applicationStatus", "OWNER_PENDING");
        body.put("message", ex.getMessage());
        if (ex.getApplicationRef() != null) {
            body.put("applicationRef", ex.getApplicationRef());
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    /** Rejected owner tried to log in — frontend redirects to /owner/application-rejected */
    @ExceptionHandler(OwnerRejectedException.class)
    public ResponseEntity<Map<String, String>> handleOwnerRejected(OwnerRejectedException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("applicationStatus", "OWNER_REJECTED");
        body.put("message", ex.getMessage());
        body.put("rejectionReason", ex.getRejectionReason());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    /** Catches database constraint violations and prevents leaking raw SQL queries to frontend */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrity(DataIntegrityViolationException ex) {
        String raw = ex.getMessage() != null ? ex.getMessage() : "";
        String userFriendlyMsg = "Unable to process request due to a data constraint conflict.";

        if (raw.contains("users_email_key") || (raw.contains("email") && raw.contains("duplicate key"))) {
            userFriendlyMsg = "This email address is already registered.";
        } else if (raw.contains("users_account_status_check")) {
            userFriendlyMsg = "Invalid account status specified. Please contact support.";
        } else if (raw.contains("violates check constraint")) {
            userFriendlyMsg = "Submitted data contains invalid values that violate system constraints.";
        } else if (raw.contains("violates foreign key constraint")) {
            userFriendlyMsg = "Referenced entity does not exist.";
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", userFriendlyMsg));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handle(RuntimeException ex) {

        String msg = ex.getMessage() != null ? ex.getMessage() : "Unexpected error";

        // Sanitize raw SQL dumps if any slip through
        if (msg.contains("could not execute statement") || msg.contains("SQL [") || msg.contains("violates check constraint")) {
            msg = "A database error occurred while processing your request. Please try again.";
        }

        HttpStatus status;
        if (msg.contains("not found") || msg.contains("No active")) {
            status = HttpStatus.NOT_FOUND;                   // 404
        } else if (msg.contains("Unauthorized") || msg.contains("Access denied")) {
            status = HttpStatus.FORBIDDEN;                   // 403
        } else if (msg.contains("already processed") || msg.contains("already confirmed") || msg.contains("already registered")) {
            status = HttpStatus.CONFLICT;                    // 409
        } else {
            status = HttpStatus.BAD_REQUEST;                 // 400 default
        }

        return ResponseEntity.status(status).body(Map.of("message", msg));
    }
}