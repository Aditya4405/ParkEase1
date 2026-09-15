package com.demo.parkease.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_issues", indexes = {
    @Index(name = "idx_maint_parking", columnList = "parking_id"),
    @Index(name = "idx_maint_slot", columnList = "slot_id"),
    @Index(name = "idx_maint_status", columnList = "status"),
    @Index(name = "idx_maint_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parking_id", nullable = false)
    private Parking parking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id")
    private ParkingSlot slot;

    @Column(nullable = false, length = 255)
    private String issue;

    @Column(name = "reported_by", length = 100)
    private String reportedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.OPEN;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    public enum Status {
        OPEN,
        IN_PROGRESS,
        RESOLVED
    }
}
