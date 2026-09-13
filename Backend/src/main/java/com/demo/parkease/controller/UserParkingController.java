package com.demo.parkease.controller;

import com.demo.parkease.dto.UserParkingResponse;
import com.demo.parkease.service.UserParkingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/parkings")
@CrossOrigin(origins = "http://localhost:3000")
public class UserParkingController {

    private final UserParkingService userParkingService;

    public UserParkingController(UserParkingService userParkingService) {
        this.userParkingService = userParkingService;
    }

    // ✅ GET /api/user/parkings
    // Returns all parkings for the browse/search listing in UserDashboard.jsx
    @GetMapping
    public ResponseEntity<List<UserParkingResponse>> getAllParkings() {
        return ResponseEntity.ok(userParkingService.getAllParkings());
    }

    // ✅ GET /api/user/parkings/{parkingId}
    // Returns a single parking with full slot list for ParkingSlots.jsx slot grid
    @GetMapping("/{parkingId}")
    public ResponseEntity<UserParkingResponse> getParkingById(
            @PathVariable("parkingId") Long parkingId) {
        return ResponseEntity.ok(userParkingService.getParkingById(parkingId));
    }
}