package com.demo.parkease.controller;

import com.demo.parkease.dto.AdminStatsResponse;
import com.demo.parkease.service.AdminDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    // GET /api/admin/stats — overview stats
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminDashboardService.getStats());
    }

    // GET /api/admin/users — all users list
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers() {
        return ResponseEntity.ok(adminDashboardService.getAllUsers());
    }

    // GET /api/admin/parkings — all parkings list
    @GetMapping("/parkings")
    public ResponseEntity<List<Map<String, Object>>> getParkings() {
        return ResponseEntity.ok(adminDashboardService.getAllParkings());
    }

    // GET /api/admin/bookings — all bookings
    @GetMapping("/bookings")
    public ResponseEntity<List<Map<String, Object>>> getBookings() {
        return ResponseEntity.ok(adminDashboardService.getAllBookings());
    }

    // GET /api/admin/revenue — revenue breakdown
    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenue() {
        return ResponseEntity.ok(adminDashboardService.getRevenueData());
    }

    // GET /api/admin/ghost-slots — slots occupied but booking completed/cancelled
    @GetMapping("/ghost-slots")
    public ResponseEntity<List<Map<String, Object>>> getGhostSlots() {
        return ResponseEntity.ok(adminDashboardService.getGhostSlots());
    }

    // PATCH /api/admin/users/{userId}/status — suspend or activate a user
    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<Map<String, String>> updateUserStatus(
            @PathVariable("userId") Long userId,
            @RequestBody Map<String, String> body) {
        adminDashboardService.updateUserStatus(userId, body.get("status"));
        return ResponseEntity.ok(Map.of("message", "User status updated"));
    }

    // DELETE /api/admin/parkings/{parkingId} — remove a parking lot
    @DeleteMapping("/parkings/{parkingId}")
    public ResponseEntity<Map<String, String>> deleteParking(
            @PathVariable("parkingId") Long parkingId) {
        adminDashboardService.deleteParking(parkingId);
        return ResponseEntity.ok(Map.of("message", "Parking deleted"));
    }

    // POST /api/admin/ghost-slots/fix-all — release all ghost slots
    @PostMapping("/ghost-slots/fix-all")
    public ResponseEntity<Map<String, Object>> fixAllGhostSlots() {
        int fixed = adminDashboardService.fixAllGhostSlots();
        return ResponseEntity.ok(Map.of("message", "Ghost slots fixed", "count", fixed));
    }
}