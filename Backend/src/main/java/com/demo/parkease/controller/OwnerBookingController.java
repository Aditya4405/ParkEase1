package com.demo.parkease.controller;

import com.demo.parkease.dto.BookingResponse;
import com.demo.parkease.service.BookingService;
import com.demo.parkease.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/owner")
@CrossOrigin(origins = "http://localhost:3000")
public class OwnerBookingController {

    private final BookingService bookingService;
    private final JwtUtil jwtUtil;

    public OwnerBookingController(BookingService bookingService,
                                  JwtUtil jwtUtil) {
        this.bookingService = bookingService;
        this.jwtUtil = jwtUtil;
    }

    private Long getOwnerIdFromToken(String authHeader) {
        return jwtUtil.extractUserId(authHeader.substring(7));
    }

    // ✅ GET /api/owner/bookings
    // All bookings across ALL owner's parkings
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestHeader("Authorization") String authHeader) {

        Long ownerId = getOwnerIdFromToken(authHeader);
        return ResponseEntity.ok(
                bookingService.getAllOwnerBookings(ownerId)
        );
    }

    // ✅ GET /api/owner/parkings/{parkingId}/bookings
    // Bookings for a specific parking
    @GetMapping("/parkings/{parkingId}/bookings")
    public ResponseEntity<List<BookingResponse>> getParkingBookings(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("parkingId") Long parkingId) {

        Long ownerId = getOwnerIdFromToken(authHeader);
        return ResponseEntity.ok(
                bookingService.getParkingBookings(parkingId, ownerId)
        );
    }

    // ✅ PATCH /api/owner/bookings/{bookingId}/cancel
    @PatchMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("bookingId") Long bookingId) {

        Long ownerId = getOwnerIdFromToken(authHeader);
        return ResponseEntity.ok(
                bookingService.cancelBooking(bookingId, ownerId)
        );
    }

    // ✅ PATCH /api/owner/bookings/{bookingId}/complete
    @PatchMapping("/bookings/{bookingId}/complete")
    public ResponseEntity<BookingResponse> completeBooking(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("bookingId") Long bookingId) {

        Long ownerId = getOwnerIdFromToken(authHeader);
        return ResponseEntity.ok(
                bookingService.completeBooking(bookingId, ownerId)
        );
    }
}