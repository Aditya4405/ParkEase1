package com.demo.parkease.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Stores metadata about a document uploaded as part of an owner application.
 *
 * The actual file bytes are NOT stored in the DB — only the storage path.
 */
@Entity
@Table(name = "owner_application_documents", indexes = {
    @Index(name = "idx_oad_application", columnList = "application_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerApplicationDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private OwnerApplication application;

    /** Category label: IDENTITY_PROOF, ADDRESS_PROOF, BUSINESS_PROOF, PROPERTY_PROOF, OTHER */
    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType;

    /** Original filename from the client upload */
    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    /** Relative storage path (from the configured upload directory) */
    @Column(name = "storage_path", nullable = false, length = 512)
    private String storagePath;

    /** MIME type, e.g. image/jpeg, application/pdf */
    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;
}
