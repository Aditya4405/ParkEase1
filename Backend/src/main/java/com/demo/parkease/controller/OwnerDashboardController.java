package com.demo.parkease.controller;

import com.demo.parkease.dto.OwnerStatsResponse;
import com.demo.parkease.service.DashboardService;
import com.demo.parkease.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/owner/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class OwnerDashboardController {

    private final DashboardService dashboardService;
    private final JwtUtil jwtUtil;

    public OwnerDashboardController(DashboardService dashboardService,
                                    JwtUtil jwtUtil) {
        this.dashboardService = dashboardService;
        this.jwtUtil = jwtUtil;
    }

    private Long getOwnerIdFromToken(String authHeader) {
        return jwtUtil.extractUserId(authHeader.substring(7));
    }

    // ✅ GET /api/owner/dashboard/stats
    @GetMapping("/stats")
    public ResponseEntity<OwnerStatsResponse> getStats(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Long parkingId) {

        Long ownerId = getOwnerIdFromToken(authHeader);
        return ResponseEntity.ok(
                dashboardService.getOwnerStats(ownerId, parkingId)
        );
    }

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenue(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Long parkingId) {

        Long ownerId = getOwnerIdFromToken(authHeader);
        return ResponseEntity.ok(
                dashboardService.getOwnerRevenueData(ownerId, parkingId)
        );
    }
}
