package com.demo.parkease.controller;

import com.demo.parkease.dto.CreateParkingRequest;
import com.demo.parkease.dto.ParkingResponse;
import com.demo.parkease.dto.ParkingSlotResponse;
import com.demo.parkease.service.ParkingService;
import com.demo.parkease.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import com.demo.parkease.dto.CreateSlotRequest;

import java.util.List;

@RestController
@RequestMapping("/api/owner/parkings")
@CrossOrigin(origins = "http://localhost:3000")
public class OwnerParkingController {

    private final ParkingService parkingService;
    private final JwtUtil jwtUtil;

    public OwnerParkingController(ParkingService parkingService,
                                  JwtUtil jwtUtil) {
        this.parkingService = parkingService;
        this.jwtUtil = jwtUtil;
    }

    // Helper — extract owner ID from JWT token in request header
    private Long getOwnerIdFromToken(String authHeader) {
        String token = authHeader.substring(7); // Remove "Bearer "
        return jwtUtil.extractUserId(token);
    }

    // ✅ POST /api/owner/parkings — Create new parking
    @PostMapping
    public ResponseEntity<ParkingResponse> createParking(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody CreateParkingRequest request) {

        Long ownerId = getOwnerIdFromToken(authHeader);
        ParkingResponse response = parkingService.createParking(request, ownerId);
        return ResponseEntity.ok(response);
    }

    // ✅ GET /api/owner/parkings — Get all parkings for this owner
    @GetMapping
    public ResponseEntity<List<ParkingResponse>> getMyParkings(
            @RequestHeader("Authorization") String authHeader) {

        Long ownerId = getOwnerIdFromToken(authHeader);
        return ResponseEntity.ok(parkingService.getOwnerParkings(ownerId));
    }

    // ✅ GET /api/owner/parkings/{id} — Get single parking
    @GetMapping("/{parkingId}")
    public ResponseEntity<ParkingResponse> getParkingById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("parkingId") Long parkingId) {

        Long ownerId = getOwnerIdFromToken(authHeader);
        return ResponseEntity.ok(parkingService.getParkingById(parkingId, ownerId));
    }



    @GetMapping("/debug")
    public ResponseEntity<?> debug(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        return ResponseEntity.ok(Map.of(
                "email", jwtUtil.extractEmail(token),
                "role", jwtUtil.extractRole(token),
                "userId", jwtUtil.extractUserId(token)
        ));
    }

    @PostMapping("/{parkingId}/slots")
    public ResponseEntity<ParkingSlotResponse> addSlot(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("parkingId") Long parkingId,
            @RequestBody CreateSlotRequest request) {
        Long ownerId = getOwnerIdFromToken(authHeader);
        return ResponseEntity.ok(parkingService.addSlot(parkingId, request, ownerId));
    }
}
