package com.demo.parkease.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Catches RuntimeExceptions thrown anywhere in the service layer and
 * returns clean JSON { "message": "..." } instead of Spring's HTML error page.
 *
 * The frontend api.js reads: body.message || body.error
 */
@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handle(RuntimeException ex) {

        String msg = ex.getMessage() != null ? ex.getMessage() : "Unexpected error";

        HttpStatus status;
        if (msg.contains("not found") || msg.contains("No active")) {
            status = HttpStatus.NOT_FOUND;                   // 404
        } else if (msg.contains("Unauthorized") || msg.contains("Access denied")) {
            status = HttpStatus.FORBIDDEN;                   // 403
        } else if (msg.contains("already processed") || msg.contains("already confirmed")) {
            status = HttpStatus.CONFLICT;                    // 409
        } else {
            status = HttpStatus.BAD_REQUEST;                 // 400 default
        }

        return ResponseEntity.status(status).body(Map.of("message", msg));
    }
}