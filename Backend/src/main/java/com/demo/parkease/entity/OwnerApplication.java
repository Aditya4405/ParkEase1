package com.demo.parkease.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Represents an owner application submitted by an applicant.
 *
 * DB table: owner_applications
 *
 * Lifecycle:
 *   PENDING → UNDER_REVIEW → APPROVED  (user.accountStatus = ACTIVE)
 *                           → REJECTED  (user.accountStatus = OWNER_REJECTED)
 */
@Entity
@Table(name = "owner_applications", indexes = {
    @Index(name = "idx_oa_applicant", columnList = "applicant_id"),
    @Index(name = "idx_oa_status", columnList = "application_status"),
    @Index(name = "idx_oa_ref", columnList = "application_ref", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Human-readable reference, e.g. PE-000042 */
    @Column(name = "application_ref", nullable = false, unique = true, length = 20)
    private String applicationRef;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false)
    private User applicant;

    // ── Business Information ──────────────────────────────────────────────────

    @Column(name = "business_name", nullable = false, length = 200)
    private String businessName;

    @Column(name = "business_type", length = 100)
    private String businessType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(name = "pin_code", length = 10)
    private String pinCode;

    @Column(name = "contact_number", length = 20)
    private String contactNumber;

    /** PAN / GST / other govt ID — stored as entered, not validated as legally mandatory */
    @Column(name = "business_identifier", length = 50)
    private String businessIdentifier;

    @Column(name = "number_of_locations")
    private Integer numberOfLocations;

    @Column(name = "ownership_type", length = 100)
    private String ownershipType;

    // ── Parking Information ──────────────────────────────────────────────────

    @Column(name = "parking_space_name", length = 200)
    private String parkingSpaceName;

    @Column(name = "parking_address", columnDefinition = "TEXT")
    private String parkingAddress;

    @Column(name = "parking_city", length = 100)
    private String parkingCity;

    @Column(name = "parking_state", length = 100)
    private String parkingState;

    @Column(name = "parking_pin_code", length = 10)
    private String parkingPinCode;

    @Column(name = "approx_slots")
    private Integer approxSlots;

    @Column(name = "parking_type", length = 100)
    private String parkingType;

    @Column(name = "vehicle_types_supported", length = 200)
    private String vehicleTypesSupported;

    // ── Application Status ───────────────────────────────────────────────────

    @Column(name = "application_status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApplicationStatus applicationStatus = ApplicationStatus.PENDING;

    @CreationTimestamp
    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    private User reviewedBy;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    // ── Documents ────────────────────────────────────────────────────────────

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OwnerApplicationDocument> documents;
}
