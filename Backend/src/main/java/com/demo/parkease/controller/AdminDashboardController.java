package com.demo.parkease.controller;

import com.demo.parkease.entity.AdminNotification;
import com.demo.parkease.entity.AuditLog;
import com.demo.parkease.service.AdminDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "https://park-ease1-eight.vercel.app"})
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    // GET /api/admin/stats — platform-wide stats & operational overview
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminDashboardService.getStats());
    }

    // GET /api/admin/users — all users list
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers() {
        return ResponseEntity.ok(adminDashboardService.getAllUsers());
    }

    // GET /api/admin/users/{userId} — detailed user drawer info
    @GetMapping("/users/{userId}")
    public ResponseEntity<Map<String, Object>> getUserDetails(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(adminDashboardService.getUserDetails(userId));
    }

    // PATCH /api/admin/users/{userId}/status — suspend or activate a user
    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<Map<String, String>> updateUserStatus(
            @PathVariable("userId") Long userId,
            @RequestBody Map<String, String> body) {
        adminDashboardService.updateUserStatus(userId, body.get("status"));
        return ResponseEntity.ok(Map.of("message", "User status updated"));
    }

    // GET /api/admin/parkings — all parkings list
    @GetMapping("/parkings")
    public ResponseEntity<List<Map<String, Object>>> getParkings() {
        return ResponseEntity.ok(adminDashboardService.getAllParkings());
    }

    // GET /api/admin/parkings/{parkingId} — detailed parking info & slots
    @GetMapping("/parkings/{parkingId}")
    public ResponseEntity<Map<String, Object>> getParkingDetails(@PathVariable("parkingId") Long parkingId) {
        return ResponseEntity.ok(adminDashboardService.getParkingDetails(parkingId));
    }

    // PATCH /api/admin/parkings/{parkingId}/suspend — suspend or activate parking
    @PatchMapping("/parkings/{parkingId}/suspend")
    public ResponseEntity<Map<String, String>> suspendParking(
            @PathVariable("parkingId") Long parkingId,
            @RequestBody Map<String, Boolean> body) {
        boolean suspend = body.getOrDefault("suspend", true);
        adminDashboardService.suspendParking(parkingId, suspend);
        return ResponseEntity.ok(Map.of("message", suspend ? "Parking suspended" : "Parking activated"));
    }

    // DELETE /api/admin/parkings/{parkingId} — remove a parking lot
    @DeleteMapping("/parkings/{parkingId}")
    public ResponseEntity<Map<String, String>> deleteParking(
            @PathVariable("parkingId") Long parkingId) {
        adminDashboardService.deleteParking(parkingId);
        return ResponseEntity.ok(Map.of("message", "Parking deleted"));
    }

    // GET /api/admin/bookings — all bookings
    @GetMapping("/bookings")
    public ResponseEntity<List<Map<String, Object>>> getBookings() {
        return ResponseEntity.ok(adminDashboardService.getAllBookings());
    }

    // GET /api/admin/revenue — revenue breakdown & analytics
    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenue() {
        return ResponseEntity.ok(adminDashboardService.getRevenueData());
    }

    // GET /api/admin/transactions — all payment transactions
    @GetMapping("/transactions")
    public ResponseEntity<List<Map<String, Object>>> getTransactions() {
        return ResponseEntity.ok(adminDashboardService.getAllTransactions());
    }

    // GET /api/admin/refunds — refund requests
    @GetMapping("/refunds")
    public ResponseEntity<List<Map<String, Object>>> getRefunds() {
        return ResponseEntity.ok(adminDashboardService.getRefunds());
    }

    // PATCH /api/admin/refunds/{refundId}/status — approve or reject refund
    @PatchMapping("/refunds/{refundId}/status")
    public ResponseEntity<Map<String, String>> processRefund(
            @PathVariable("refundId") Long refundId,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        String adminName = auth != null ? auth.getName() : "Admin";
        adminDashboardService.processRefund(refundId, body.get("status"), adminName);
        return ResponseEntity.ok(Map.of("message", "Refund processed"));
    }

    // GET /api/admin/live-parking — real-time parking lots and slots
    @GetMapping("/live-parking")
    public ResponseEntity<List<Map<String, Object>>> getLiveParking() {
        return ResponseEntity.ok(adminDashboardService.getLiveParking());
    }

    // GET /api/admin/slot-health — slot health distribution and anomaly scores
    @GetMapping("/slot-health")
    public ResponseEntity<Map<String, Object>> getSlotHealth() {
        return ResponseEntity.ok(adminDashboardService.getSlotHealth());
    }

    // GET /api/admin/ghost-slots — suspicious slots
    @GetMapping("/ghost-slots")
    public ResponseEntity<List<Map<String, Object>>> getGhostSlots() {
        return ResponseEntity.ok(adminDashboardService.getGhostSlots());
    }

    // POST /api/admin/ghost-slots/fix-all — release all ghost slots
    @PostMapping("/ghost-slots/fix-all")
    public ResponseEntity<Map<String, Object>> fixAllGhostSlots() {
        int fixed = adminDashboardService.fixAllGhostSlots();
        return ResponseEntity.ok(Map.of("message", "Ghost slots fixed", "count", fixed));
    }

    // POST /api/admin/ghost-slots/{slotId}/fix — release single ghost slot
    @PostMapping("/ghost-slots/{slotId}/fix")
    public ResponseEntity<Map<String, String>> fixSingleGhostSlot(@PathVariable("slotId") Long slotId) {
        adminDashboardService.fixSingleGhostSlot(slotId);
        return ResponseEntity.ok(Map.of("message", "Slot released to AVAILABLE"));
    }

    // GET /api/admin/maintenance — maintenance issues
    @GetMapping("/maintenance")
    public ResponseEntity<List<Map<String, Object>>> getMaintenanceIssues() {
        return ResponseEntity.ok(adminDashboardService.getMaintenanceIssues());
    }

    // POST /api/admin/maintenance — report new maintenance ticket
    @PostMapping("/maintenance")
    public ResponseEntity<Map<String, String>> createMaintenanceIssue(
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        Long parkingId = Long.valueOf(body.get("parkingId").toString());
        Long slotId = body.get("slotId") != null ? Long.valueOf(body.get("slotId").toString()) : null;
        String issue = (String) body.get("issue");
        String priority = (String) body.get("priority");
        String adminName = auth != null ? auth.getName() : "Admin";

        adminDashboardService.createMaintenanceIssue(parkingId, slotId, issue, priority, adminName);
        return ResponseEntity.ok(Map.of("message", "Maintenance ticket created"));
    }

    // PATCH /api/admin/maintenance/{issueId}/status — update ticket status
    @PatchMapping("/maintenance/{issueId}/status")
    public ResponseEntity<Map<String, String>> updateMaintenanceStatus(
            @PathVariable("issueId") Long issueId,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        String adminName = auth != null ? auth.getName() : "Admin";
        adminDashboardService.updateMaintenanceStatus(issueId, body.get("status"), adminName);
        return ResponseEntity.ok(Map.of("message", "Maintenance status updated"));
    }

    // GET /api/admin/analytics — deep analytics trends and peak hours
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics(
            @RequestParam(value = "range", defaultValue = "7d") String range) {
        return ResponseEntity.ok(adminDashboardService.getAnalyticsData(range));
    }

    // GET /api/admin/audit-logs — administrative audit trails
    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(adminDashboardService.getAuditLogs());
    }

    // GET /api/admin/notifications — system notifications
    @GetMapping("/notifications")
    public ResponseEntity<List<AdminNotification>> getNotifications() {
        return ResponseEntity.ok(adminDashboardService.getNotifications());
    }

    // PATCH /api/admin/notifications/{id}/read — mark notification as read
    @PatchMapping("/notifications/{id}/read")
    public ResponseEntity<Map<String, String>> markNotificationRead(@PathVariable("id") Long id) {
        adminDashboardService.markNotificationRead(id);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    // POST /api/admin/notifications/mark-all-read — mark all notifications as read
    @PostMapping("/notifications/mark-all-read")
    public ResponseEntity<Map<String, String>> markAllNotificationsRead() {
        adminDashboardService.markAllNotificationsRead();
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    // GET /api/admin/search — global unified search across entities
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> globalSearch(@RequestParam("q") String query) {
        return ResponseEntity.ok(adminDashboardService.globalSearch(query));
    }
}