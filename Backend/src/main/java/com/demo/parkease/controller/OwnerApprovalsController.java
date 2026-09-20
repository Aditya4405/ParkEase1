package com.demo.parkease.controller;

import com.demo.parkease.dto.AdminOwnerApprovalAction;
import com.demo.parkease.dto.OwnerApplicationResponse;
import com.demo.parkease.service.OwnerApplicationService;
import com.demo.parkease.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

/**
 * Admin-only endpoints for reviewing and acting on owner applications.
 *
 * GET  /api/admin/owner-approvals              — list all (optionally filtered by status)
 * GET  /api/admin/owner-approvals/{id}         — detail view
 * GET  /api/admin/owner-approvals/stats        — counts by status
 * POST /api/admin/owner-approvals/{id}/approve — approve
 * POST /api/admin/owner-approvals/{id}/reject  — reject (body: { rejectionReason })
 * POST /api/admin/owner-approvals/{id}/review  — mark under review
 *
 * Security: ALL endpoints require ROLE_ADMIN (enforced in SecurityConfig + here).
 */
@RestController
@RequestMapping("/api/admin/owner-approvals")
@CrossOrigin(origins = {"http://localhost:3000", "https://park-ease1-eight.vercel.app"})
public class OwnerApprovalsController {

    private final OwnerApplicationService ownerApplicationService;
    private final JwtUtil jwtUtil;

    public OwnerApprovalsController(OwnerApplicationService ownerApplicationService,
                                    JwtUtil jwtUtil) {
        this.ownerApplicationService = ownerApplicationService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<List<OwnerApplicationResponse>> getAllApplications(
            @RequestParam(value = "status", required = false) String status) {
        return ResponseEntity.ok(ownerApplicationService.getAllApplications(status));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(ownerApplicationService.getApplicationStats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OwnerApplicationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ownerApplicationService.getApplicationById(id));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<OwnerApplicationResponse> approve(
            @PathVariable Long id,
            @RequestBody(required = false) AdminOwnerApprovalAction action,
            HttpServletRequest request) {
        Long adminId = extractUserId(request);
        return ResponseEntity.ok(ownerApplicationService.approveApplication(id, adminId, action));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<OwnerApplicationResponse> reject(
            @PathVariable Long id,
            @RequestBody AdminOwnerApprovalAction action,
            HttpServletRequest request) {
        Long adminId = extractUserId(request);
        return ResponseEntity.ok(ownerApplicationService.rejectApplication(id, adminId, action));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<OwnerApplicationResponse> markUnderReview(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long adminId = extractUserId(request);
        return ResponseEntity.ok(ownerApplicationService.markUnderReview(id, adminId));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Long extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized");
        }
        return jwtUtil.extractUserId(authHeader.substring(7));
    }
}
