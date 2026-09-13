package com.demo.parkease.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Maps to the `payments` table.
 *
 * DB schema columns:
 *   id, booking_id, amount, status, method, type,
 *   transaction_id, paid_at, created_at
 *
 * One booking can have multiple payments:
 *   1 × BOOKING payment   (initial booking)
 *   N × EXTENSION payments (each extend adds one)
 *   1 × PENALTY payment   (if user exceeded time)
 *
 * Payment flow:
 *   /initiate → status = PENDING
 *   /confirm  → status = SUCCESS (mock gateway always succeeds)
 *   On failure → status = FAILED
 */
@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The booking this payment belongs to. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    /** Null until /confirm is called. */
    @Column
    @Enumerated(EnumType.STRING)
    private PaymentMethod method;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentType type = PaymentType.BOOKING;

    /**
     * Simulated gateway transaction ID.
     * Format: "PE-" + 12 uppercase hex chars
     * e.g. "PE-A1B2C3D4E5F6"
     * Null until payment is confirmed.
     */
    @Column(name = "transaction_id", unique = true, length = 60)
    private String transactionId;

    /** Timestamp when payment was confirmed. Null until SUCCESS. */
    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ── Nested enums ─────────────────────────────────────────────────────────

    public enum PaymentStatus {
        PENDING,   // created, waiting for /confirm
        SUCCESS,   // gateway confirmed
        FAILED,    // gateway rejected
        REFUNDED   // future use
    }

    public enum PaymentMethod {
        UPI,
        CARD,
        WALLET
    }

    public enum PaymentType {
        BOOKING,    // initial slot booking
        EXTENSION,  // extend active booking
        PENALTY     // overtime penalty
    }
}