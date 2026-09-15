package com.demo.parkease.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_notifications", indexes = {
    @Index(name = "idx_notif_created_at", columnList = "created_at"),
    @Index(name = "idx_notif_read", columnList = "read"),
    @Index(name = "idx_notif_type", columnList = "type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private NotificationType type = NotificationType.INFO;

    @Column(nullable = false)
    @Builder.Default
    private Boolean read = false;

    @Column(name = "target_url", length = 255)
    private String targetUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum NotificationType {
        CRITICAL,
        WARNING,
        INFO,
        SUCCESS
    }
}
