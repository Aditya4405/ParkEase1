package com.demo.parkease.controller;

import com.demo.parkease.dto.BookingResponse;
import com.demo.parkease.dto.CreateBookingRequest;
import com.demo.parkease.service.BookingService;
import com.demo.parkease.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class UserBookingController {

    private final BookingService bookingService;
    private final JwtUtil jwtUtil;

    public UserBookingController(BookingService bookingService,
                                 JwtUtil jwtUtil) {
        this.bookingService = bookingService;
        this.jwtUtil = jwtUtil;
    }

    private Long getUserIdFromToken(String authHeader) {
        return jwtUtil.extractUserId(authHeader.substring(7));
    }

    // ✅ POST /api/user/bookings — Create booking (legacy, kept for compatibility)
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody CreateBookingRequest request) {

        Long userId = getUserIdFromToken(authHeader);
        return ResponseEntity.ok(
                bookingService.createBooking(request, userId)
        );
    }

    // ✅ GET /api/user/bookings — Get all my bookings (BookingHistory.jsx)
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @RequestHeader("Authorization") String authHeader) {

        Long userId = getUserIdFromToken(authHeader);
        return ResponseEntity.ok(
                bookingService.getUserBookings(userId)
        );
    }

    // ✅ PATCH /api/user/bookings/{bookingId}/cancel — Cancel my booking
    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("bookingId") Long bookingId) {

        Long userId = getUserIdFromToken(authHeader);
        return ResponseEntity.ok(
                bookingService.userCancelBooking(bookingId, userId)
        );
    }

    // ✅ GET /api/user/bookings/active — Get current active booking
    // Used by ActiveParking.jsx to restore session after a page refresh
    // (when localStorage is cleared but the booking is still ACTIVE in DB)
    @GetMapping("/active")
    public ResponseEntity<BookingResponse> getActiveBooking(
            @RequestHeader("Authorization") String authHeader) {

        Long userId = getUserIdFromToken(authHeader);
        return ResponseEntity.ok(
                bookingService.getActiveBooking(userId)
        );
    }
}