package com.demo.parkease.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Maps to the `bookings` table.
 *
 * DB schema columns:
 *   id, parking_id, slot_id, user_id, vehicle_number,
 *   start_time, end_time, amount, status, created_at
 *
 * Lifecycle:
 *   PENDING  → created at /payments/initiate (slot = RESERVED)
 *   ACTIVE   → confirmed at /payments/{id}/confirm (slot = OCCUPIED)
 *   COMPLETED→ ended cleanly or penalty paid (slot = AVAILABLE)
 *   CANCELLED→ abandoned checkout or owner/user cancel (slot = AVAILABLE)
 */
@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parking_id", nullable = false)
    private Parking parking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    private ParkingSlot slot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "vehicle_number", nullable = false, length = 20)
    private String vehicleNumber;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    /** Nullable until booking is confirmed or extended. */
    @Column(name = "end_time")
    private LocalDateTime endTime;

    /** Total booking amount in ₹. Grows if extensions are added. */
    @Column
    private Double amount;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ── Relations ─────────────────────────────────────────────────────────────

    /** All payments associated with this booking (booking + extensions + penalties). */
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Payment> payments;
}