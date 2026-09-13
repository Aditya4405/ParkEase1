package com.demo.parkease.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String message;
    private String role;
    private String token;    // ← JWT token for all future requests
    private Long userId;     // ← frontend needs this to scope API calls
    private String name;     // ← frontend shows this in the dashboard header
}