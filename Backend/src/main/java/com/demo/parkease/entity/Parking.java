package com.demo.parkease.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Maps to the `parkings` table.
 *
 * DB schema columns:
 *   id, name, location, description, owner_id, created_at
 */
@Entity
@Table(name = "parkings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Parking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 255)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** The OWNER user who created this parking. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ── Relations ────────────────────────────────────────────────────────────

    /**
     * CascadeType.ALL + orphanRemoval:
     * When a parking is saved, all its slots are saved too.
     * When a parking is deleted, all slots are deleted too.
     */
    @OneToMany(
            mappedBy = "parking",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<ParkingSlot> slots = new ArrayList<>();

    @OneToMany(mappedBy = "parking", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();
}