package com.demo.parkease.controller;

import com.demo.parkease.dto.UserStatsResponse;
import com.demo.parkease.service.UserDashboardService;
import com.demo.parkease.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class UserDashboardController {

    private final UserDashboardService userDashboardService;
    private final JwtUtil jwtUtil;

    public UserDashboardController(UserDashboardService userDashboardService,
                                   JwtUtil jwtUtil) {
        this.userDashboardService = userDashboardService;
        this.jwtUtil = jwtUtil;
    }

    private Long getUserIdFromToken(String authHeader) {
        return jwtUtil.extractUserId(authHeader.substring(7));
    }

    // ✅ GET /api/user/dashboard/stats
    // Returns booking counts, total spent, and active booking snapshot
    @GetMapping("/stats")
    public ResponseEntity<UserStatsResponse> getStats(
            @RequestHeader("Authorization") String authHeader) {

        Long userId = getUserIdFromToken(authHeader);
        return ResponseEntity.ok(
                userDashboardService.getUserStats(userId)
        );
    }
}