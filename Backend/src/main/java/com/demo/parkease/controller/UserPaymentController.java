package com.demo.parkease.controller;

import com.demo.parkease.dto.ConfirmPaymentRequest;
import com.demo.parkease.dto.InitiatePaymentRequest;
import com.demo.parkease.dto.PaymentResponse;
import com.demo.parkease.service.PaymentService;
import com.demo.parkease.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Full payment flow:
 *
 *  POST /api/user/payments/initiate
 *    Body: { slotId, parkingId, vehicleNumber, startTime, endTime, paymentType:"BOOKING" }
 *    → Booking=PENDING, Slot=RESERVED
 *    ← { paymentId, amount, status:"PENDING" }
 *
 *  POST /api/user/payments/{paymentId}/confirm
 *    Body: { paymentMethod:"UPI", upiId:"name@upi" }
 *    → Booking=ACTIVE, Slot=OCCUPIED
 *    ← { paymentId, bookingId, status:"SUCCESS", slotCode, startTime, endTime, ... }
 *
 *  POST /api/user/payments/end-parking/{bookingId}
 *    → Booking=COMPLETED, Slot=AVAILABLE
 *    ← PaymentResponse of original booking payment
 *
 *  POST /api/user/payments/penalty/initiate
 *    Body: { bookingId, paymentType:"PENALTY" }
 *    → Creates PENDING penalty payment
 *    ← { paymentId, amount (server-calculated), status:"PENDING" }
 *    Then call /confirm as normal → Booking=COMPLETED, Slot=AVAILABLE
 *
 *  POST /api/user/payments/penalty/pay-later/{bookingId}
 *    → Slot=AVAILABLE (released immediately), account flagged PAYMENT_PENDING
 *    ← { message, accountStatus }
 */
@RestController
@RequestMapping("/api/user/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class UserPaymentController {

    private final PaymentService paymentService;
    private final JwtUtil jwtUtil;

    public UserPaymentController(PaymentService paymentService, JwtUtil jwtUtil) {
        this.paymentService = paymentService;
        this.jwtUtil = jwtUtil;
    }

    private Long userId(String authHeader) {
        return jwtUtil.extractUserId(authHeader.substring(7));
    }

    // ── Step 1: Initiate ──────────────────────────────────────────────────────
    @PostMapping("/initiate")
    public ResponseEntity<PaymentResponse> initiate(
            @RequestHeader("Authorization") String auth,
            @RequestBody InitiatePaymentRequest request) {

        return ResponseEntity.ok(paymentService.initiatePayment(request, userId(auth)));
    }

    // ── Step 2: Confirm ───────────────────────────────────────────────────────
    @PostMapping("/{paymentId}/confirm")
    public ResponseEntity<PaymentResponse> confirm(
            @RequestHeader("Authorization") String auth,
            @PathVariable("paymentId") Long paymentId,
            @RequestBody ConfirmPaymentRequest request) {

        return ResponseEntity.ok(paymentService.confirmPayment(paymentId, request, userId(auth)));
    }

    // ── End parking (no penalty) ──────────────────────────────────────────────
    @PostMapping("/end-parking/{bookingId}")
    public ResponseEntity<PaymentResponse> endParking(
            @RequestHeader("Authorization") String auth,
            @PathVariable("bookingId") Long bookingId) {

        return ResponseEntity.ok(paymentService.endParking(bookingId, userId(auth)));
    }

    // ── Penalty: initiate ─────────────────────────────────────────────────────
    @PostMapping("/penalty/initiate")
    public ResponseEntity<PaymentResponse> initiatePenalty(
            @RequestHeader("Authorization") String auth,
            @RequestBody InitiatePaymentRequest request) {

        request.setPaymentType("PENALTY");
        return ResponseEntity.ok(paymentService.initiatePayment(request, userId(auth)));
    }

    // ── Penalty: pay later ────────────────────────────────────────────────────
    @PostMapping("/penalty/pay-later/{bookingId}")
    public ResponseEntity<Map<String, String>> payLater(
            @RequestHeader("Authorization") String auth,
            @PathVariable("bookingId") Long bookingId) {

        paymentService.markPenaltyPayLater(bookingId, userId(auth));
        return ResponseEntity.ok(Map.of(
                "message", "Penalty deferred. Slot released. Account flagged PAYMENT_PENDING.",
                "accountStatus", "PAYMENT_PENDING"
        ));
    }
}