package com.demo.parkease.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/** Response DTO for owner application details */
@Data
@Builder
public class OwnerApplicationResponse {

    private Long id;
    private String applicationRef;
    private String applicationStatus;

    // Applicant
    private Long applicantId;
    private String applicantName;
    private String applicantEmail;
    private String applicantPhone;

    // Business
    private String businessName;
    private String businessType;
    private String address;
    private String city;
    private String state;
    private String pinCode;
    private String contactNumber;
    private String businessIdentifier;
    private Integer numberOfLocations;
    private String ownershipType;

    // Parking
    private String parkingSpaceName;
    private String parkingAddress;
    private String parkingCity;
    private String parkingState;
    private String parkingPinCode;
    private Integer approxSlots;
    private String parkingType;
    private String vehicleTypesSupported;

    // Review
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private String reviewedByName;
    private String rejectionReason;
    private String adminNotes;

    // Documents
    private List<DocumentInfo> documents;

    @Data
    @Builder
    public static class DocumentInfo {
        private Long id;
        private String documentType;
        private String originalFileName;
        private String contentType;
        private Long fileSizeBytes;
        private LocalDateTime uploadedAt;
        /** Download URL path — frontend calls this */
        private String downloadUrl;
    }
}
