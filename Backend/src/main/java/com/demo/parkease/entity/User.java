package com.demo.parkease.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Maps to the `users` table.
 *
 * DB schema columns:
 *   id, name, email, password, phone, role, created_at
 *
 * Extra fields (account_status, outstanding, warning_count) are used
 * by the penalty / pay-later flow and are added via ddl-auto=update.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    /**
     * Account status used by the penalty / pay-later flow.
     * ACTIVE        → normal user
     * PAYMENT_PENDING → has unpaid penalty, cannot book
     * SUSPENDED     → 5+ warnings, fully blocked
     */
    @Column(name = "account_status", length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    /** Outstanding penalty amount (₹). Updated when pay-later is chosen. */
    @Column(nullable = false)
    @Builder.Default
    private Double outstanding = 0.0;

    /** Number of pay-later warnings. 5 → SUSPENDED. */
    @Column(name = "warning_count", nullable = false)
    @Builder.Default
    private Integer warningCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ── Relations ────────────────────────────────────────────────────────────

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Booking> bookings;

    @OneToMany(mappedBy = "owner", fetch = FetchType.LAZY)
    private List<Parking> parkings;

    // ── Nested enum ──────────────────────────────────────────────────────────

    public enum AccountStatus {
        ACTIVE,
        PAYMENT_PENDING,
        SUSPENDED
    }
}