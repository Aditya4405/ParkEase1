package com.demo.parkease.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_created_at", columnList = "created_at"),
    @Index(name = "idx_audit_action", columnList = "action"),
    @Index(name = "idx_audit_target", columnList = "target_type, target_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_id")
    private Long adminId;

    @Column(name = "admin_name", length = 100)
    private String adminName;

    @Column(nullable = false, length = 100)
    private String action; // e.g., "SUSPEND_USER", "DELETE_PARKING", "FIX_GHOST_SLOTS", "APPROVE_REFUND"

    @Column(name = "target_type", length = 50)
    private String targetType; // "USER", "PARKING", "SLOT", "BOOKING", "REFUND", "SYSTEM"

    @Column(name = "target_id", length = 100)
    private String targetId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 20)
    @Builder.Default
    private String status = "SUCCESS";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
