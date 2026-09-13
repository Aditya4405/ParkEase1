package com.demo.parkease.controller;

import com.demo.parkease.dto.ParkingSlotResponse;
import com.demo.parkease.dto.SlotPriceRequest;
import com.demo.parkease.dto.SlotStatusRequest;
import com.demo.parkease.service.SlotService;
import com.demo.parkease.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/owner/slots")
@CrossOrigin(origins = "http://localhost:3000")
public class SlotController {

    private final SlotService slotService;
    private final JwtUtil jwtUtil;

    public SlotController(SlotService slotService, JwtUtil jwtUtil) {
        this.slotService = slotService;
        this.jwtUtil = jwtUtil;
    }

    // Extract owner ID from JWT token
    private Long getOwnerIdFromToken(String authHeader) {
        return jwtUtil.extractUserId(authHeader.substring(7));
    }

    // ✅ GET /api/owner/slots/{slotId}
    @GetMapping("/{slotId}")
    public ResponseEntity<ParkingSlotResponse> getSlot(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("slotId") Long slotId) {

        Long ownerId = getOwnerIdFromToken(authHeader);
        return ResponseEntity.ok(slotService.getSlotById(slotId, ownerId));
    }

    // ✅ PATCH /api/owner/slots/{slotId}/status
    @PatchMapping("/{slotId}/status")
    public ResponseEntity<ParkingSlotResponse> updateStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("slotId") Long slotId,
            @RequestBody SlotStatusRequest request) {

        Long ownerId = getOwnerIdFromToken(authHeader);
        return ResponseEntity.ok(
                slotService.updateSlotStatus(slotId, request, ownerId)
        );
    }

    // ✅ PATCH /api/owner/slots/{slotId}/price
    @PatchMapping("/{slotId}/price")
    public ResponseEntity<ParkingSlotResponse> updatePrice(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("slotId") Long slotId,
            @RequestBody SlotPriceRequest request) {

        Long ownerId = getOwnerIdFromToken(authHeader);
        return ResponseEntity.ok(
                slotService.updateSlotPrice(slotId, request, ownerId)
        );
    }

    // ✅ PATCH /api/owner/slots/{slotId}/toggle
    @PatchMapping("/{slotId}/toggle")
    public ResponseEntity<ParkingSlotResponse> toggleDisabled(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("slotId") Long slotId) {

        Long ownerId = getOwnerIdFromToken(authHeader);
        return ResponseEntity.ok(
                slotService.toggleSlotDisabled(slotId, ownerId)
        );
    }
}
