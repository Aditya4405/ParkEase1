package com.demo.parkease.service;

import com.demo.parkease.dto.AdminOwnerApprovalAction;
import com.demo.parkease.dto.OwnerApplicationRequest;
import com.demo.parkease.dto.OwnerApplicationResponse;
import com.demo.parkease.entity.*;
import com.demo.parkease.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class OwnerApplicationService {

    private final OwnerApplicationRepository         applicationRepository;
    private final OwnerApplicationDocumentRepository documentRepository;
    private final UserRepository                     userRepository;
    private final AuditLogRepository                 auditLogRepository;
    private final AdminNotificationRepository        notificationRepository;
    private final DocumentStorageService             documentStorageService;
    private final PasswordEncoder                    passwordEncoder;

    public OwnerApplicationService(
            OwnerApplicationRepository applicationRepository,
            OwnerApplicationDocumentRepository documentRepository,
            UserRepository userRepository,
            AuditLogRepository auditLogRepository,
            AdminNotificationRepository notificationRepository,
            DocumentStorageService documentStorageService,
            PasswordEncoder passwordEncoder) {
        this.applicationRepository  = applicationRepository;
        this.documentRepository     = documentRepository;
        this.userRepository         = userRepository;
        this.auditLogRepository     = auditLogRepository;
        this.notificationRepository = notificationRepository;
        this.documentStorageService = documentStorageService;
        this.passwordEncoder        = passwordEncoder;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SUBMIT APPLICATION
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Submit a new owner application.
     *
     * Business rules:
     * - Email must not already be registered (for new applicants)
     * - If account exists with OWNER_PENDING status → reject duplicate
     * - Creates user with role=OWNER, accountStatus=OWNER_PENDING (no JWT issued)
     * - Creates OwnerApplication with status=PENDING
     * - Stores uploaded documents
     * - Creates AdminNotification + AuditLog
     */
    public OwnerApplicationResponse submitApplication(
            OwnerApplicationRequest request,
            Map<String, MultipartFile> documents) throws IOException {

        // Validate no existing pending application for this email
        userRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
            if (existing.getAccountStatus() == User.AccountStatus.OWNER_PENDING) {
                throw new RuntimeException(
                        "You already have a pending owner application. Please wait for admin review.");
            }
            if (existing.getAccountStatus() == User.AccountStatus.ACTIVE
                    && existing.getRole() == Role.OWNER) {
                throw new RuntimeException(
                        "This email is already registered as an active owner.");
            }
            // OWNER_REJECTED → allow reapplication; but email must not be a USER
            if (existing.getRole() == Role.USER) {
                throw new RuntimeException(
                        "This email is registered as a user account. Please use a different email.");
            }
        });

        // Create user with OWNER_PENDING status — no JWT, no dashboard access
        User applicant = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    User u = User.builder()
                            .name(request.getName())
                            .email(request.getEmail())
                            .password(passwordEncoder.encode(request.getPassword()))
                            .phone(request.getPhone())
                            .role(Role.OWNER)
                            .accountStatus(User.AccountStatus.OWNER_PENDING)
                            .build();
                    return userRepository.save(u);
                });

        // If re-applying after rejection — update accountStatus back to OWNER_PENDING
        if (applicant.getAccountStatus() == User.AccountStatus.OWNER_REJECTED) {
            applicant.setAccountStatus(User.AccountStatus.OWNER_PENDING);
            if (request.getPassword() != null && !request.getPassword().isBlank()) {
                applicant.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            userRepository.save(applicant);
        }

        // Generate application reference: PE-2026-00001
        long count = applicationRepository.count() + 1;
        String applicationRef = String.format("PE-%d-%05d", LocalDateTime.now().getYear(), count);

        // Build and save application
        OwnerApplication application = OwnerApplication.builder()
                .applicationRef(applicationRef)
                .applicant(applicant)
                .businessName(request.getBusinessName())
                .businessType(request.getBusinessType())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pinCode(request.getPinCode())
                .contactNumber(request.getContactNumber() != null
                        ? request.getContactNumber() : request.getPhone())
                .businessIdentifier(request.getBusinessIdentifier())
                .numberOfLocations(request.getNumberOfLocations())
                .ownershipType(request.getOwnershipType())
                // Parking Information
                .parkingSpaceName(request.getParkingSpaceName())
                .parkingAddress(request.getParkingAddress())
                .parkingCity(request.getParkingCity())
                .parkingState(request.getParkingState())
                .parkingPinCode(request.getParkingPinCode())
                .approxSlots(request.getApproxSlots())
                .parkingType(request.getParkingType())
                .vehicleTypesSupported(request.getVehicleTypesSupported())
                .applicationStatus(ApplicationStatus.PENDING)
                .build();

        application = applicationRepository.save(application);

        // Store documents
        if (documents != null) {
            for (Map.Entry<String, MultipartFile> entry : documents.entrySet()) {
                MultipartFile file = entry.getValue();
                if (file != null && !file.isEmpty()) {
                    String storagePath = documentStorageService.storeDocument(
                            application.getId(), entry.getKey(), file);

                    OwnerApplicationDocument doc = OwnerApplicationDocument.builder()
                            .application(application)
                            .documentType(entry.getKey())
                            .originalFileName(file.getOriginalFilename())
                            .storagePath(storagePath)
                            .contentType(file.getContentType())
                            .fileSizeBytes(file.getSize())
                            .build();

                    documentRepository.save(doc);
                }
            }
        }

        // Create admin notification
        AdminNotification notification = AdminNotification.builder()
                .title("New Owner Application")
                .message(String.format(
                        "New owner application submitted by %s (%s) — %s, %s. Ref: %s",
                        request.getName(), request.getEmail(),
                        request.getBusinessName(), request.getCity(),
                        applicationRef))
                .type(AdminNotification.NotificationType.INFO)
                .targetUrl("/admin/owner-approvals")
                .build();
        notificationRepository.save(notification);

        // Audit log
        AuditLog auditLog = AuditLog.builder()
                .adminId(null)
                .adminName("SYSTEM")
                .action("OWNER_APPLICATION_SUBMITTED")
                .targetType("OWNER_APPLICATION")
                .targetId(applicationRef)
                .description(String.format(
                        "Owner application submitted by %s (%s) for business: %s",
                        request.getName(), request.getEmail(), request.getBusinessName()))
                .status("SUCCESS")
                .build();
        auditLogRepository.save(auditLog);

        return toResponse(applicationRepository.findByIdWithDetails(application.getId())
                .orElse(application));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET MY APPLICATION
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public OwnerApplicationResponse getMyApplication(Long userId) {
        OwnerApplication app = applicationRepository
                .findTopByApplicantIdOrderBySubmittedAtDesc(userId)
                .orElseThrow(() -> new RuntimeException("No application found for this account."));

        return toResponse(applicationRepository.findByIdWithDetails(app.getId()).orElse(app));
    }

    @Transactional(readOnly = true)
    public OwnerApplicationResponse getApplicationByRef(String ref) {
        OwnerApplication app = applicationRepository.findByApplicationRef(ref)
                .orElseThrow(() -> new RuntimeException("Application not found with reference: " + ref));
        return toResponse(applicationRepository.findByIdWithDetails(app.getId()).orElse(app));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN — LIST ALL
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<OwnerApplicationResponse> getAllApplications(String statusFilter) {
        List<OwnerApplication> apps;

        if (statusFilter != null && !statusFilter.isBlank()) {
            try {
                ApplicationStatus status = ApplicationStatus.valueOf(statusFilter.toUpperCase());
                apps = applicationRepository.findByApplicationStatusOrderBySubmittedAtDesc(status);
            } catch (IllegalArgumentException e) {
                apps = applicationRepository.findAllWithDetails();
            }
        } else {
            apps = applicationRepository.findAllWithDetails();
        }

        return apps.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN — GET DETAIL
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public OwnerApplicationResponse getApplicationById(Long id) {
        OwnerApplication app = applicationRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));
        return toResponse(app);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN — APPROVE
    // ─────────────────────────────────────────────────────────────────────────

    public OwnerApplicationResponse approveApplication(Long id, Long adminId, AdminOwnerApprovalAction action) {
        OwnerApplication app = applicationRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));

        // Prevent invalid transitions
        if (app.getApplicationStatus() == ApplicationStatus.APPROVED) {
            throw new RuntimeException("Application is already approved.");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found."));

        // Update application
        app.setApplicationStatus(ApplicationStatus.APPROVED);
        app.setReviewedAt(LocalDateTime.now());
        app.setReviewedBy(admin);
        if (action != null && action.getAdminNotes() != null) {
            app.setAdminNotes(action.getAdminNotes());
        }

        // Activate the owner account
        User applicant = app.getApplicant();
        applicant.setAccountStatus(User.AccountStatus.ACTIVE);
        userRepository.save(applicant);
        applicationRepository.save(app);

        // Admin notification to applicant (stored in admin notifications table for now)
        AdminNotification notification = AdminNotification.builder()
                .title("Owner Application Approved")
                .message(String.format(
                        "Owner application %s for %s (%s) has been APPROVED by %s. " +
                        "The owner can now log in.",
                        app.getApplicationRef(), applicant.getName(),
                        applicant.getEmail(), admin.getName()))
                .type(AdminNotification.NotificationType.SUCCESS)
                .targetUrl("/admin/owner-approvals")
                .build();
        notificationRepository.save(notification);

        // Audit log
        AuditLog auditLog = AuditLog.builder()
                .adminId(adminId)
                .adminName(admin.getName())
                .action("OWNER_APPLICATION_APPROVED")
                .targetType("OWNER_APPLICATION")
                .targetId(app.getApplicationRef())
                .description(String.format(
                        "Admin %s approved owner application %s for %s (%s)",
                        admin.getName(), app.getApplicationRef(),
                        applicant.getName(), applicant.getEmail()))
                .status("SUCCESS")
                .build();
        auditLogRepository.save(auditLog);

        return toResponse(app);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN — REJECT
    // ─────────────────────────────────────────────────────────────────────────

    public OwnerApplicationResponse rejectApplication(Long id, Long adminId, AdminOwnerApprovalAction action) {
        OwnerApplication app = applicationRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));

        if (app.getApplicationStatus() == ApplicationStatus.REJECTED) {
            throw new RuntimeException("Application is already rejected.");
        }
        if (app.getApplicationStatus() == ApplicationStatus.APPROVED) {
            throw new RuntimeException("Cannot reject an already approved application.");
        }

        if (action == null || action.getRejectionReason() == null || action.getRejectionReason().isBlank()) {
            throw new RuntimeException("Rejection reason is required.");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found."));

        app.setApplicationStatus(ApplicationStatus.REJECTED);
        app.setReviewedAt(LocalDateTime.now());
        app.setReviewedBy(admin);
        app.setRejectionReason(action.getRejectionReason());
        if (action.getAdminNotes() != null) {
            app.setAdminNotes(action.getAdminNotes());
        }

        // Mark user account as rejected — still cannot log in
        User applicant = app.getApplicant();
        applicant.setAccountStatus(User.AccountStatus.OWNER_REJECTED);
        userRepository.save(applicant);
        applicationRepository.save(app);

        // Notification
        AdminNotification notification = AdminNotification.builder()
                .title("Owner Application Rejected")
                .message(String.format(
                        "Owner application %s for %s (%s) has been REJECTED by %s. Reason: %s",
                        app.getApplicationRef(), applicant.getName(),
                        applicant.getEmail(), admin.getName(), action.getRejectionReason()))
                .type(AdminNotification.NotificationType.WARNING)
                .targetUrl("/admin/owner-approvals")
                .build();
        notificationRepository.save(notification);

        // Audit log
        AuditLog auditLog = AuditLog.builder()
                .adminId(adminId)
                .adminName(admin.getName())
                .action("OWNER_APPLICATION_REJECTED")
                .targetType("OWNER_APPLICATION")
                .targetId(app.getApplicationRef())
                .description(String.format(
                        "Admin %s rejected owner application %s for %s (%s). Reason: %s",
                        admin.getName(), app.getApplicationRef(),
                        applicant.getName(), applicant.getEmail(),
                        action.getRejectionReason()))
                .status("SUCCESS")
                .build();
        auditLogRepository.save(auditLog);

        return toResponse(app);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN — MARK UNDER REVIEW
    // ─────────────────────────────────────────────────────────────────────────

    public OwnerApplicationResponse markUnderReview(Long id, Long adminId) {
        OwnerApplication app = applicationRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));

        if (app.getApplicationStatus() != ApplicationStatus.PENDING) {
            throw new RuntimeException("Only PENDING applications can be moved to UNDER_REVIEW.");
        }

        app.setApplicationStatus(ApplicationStatus.UNDER_REVIEW);
        applicationRepository.save(app);

        User admin = userRepository.findById(adminId).orElse(null);
        AuditLog auditLog = AuditLog.builder()
                .adminId(adminId)
                .adminName(admin != null ? admin.getName() : "Admin")
                .action("OWNER_APPLICATION_REVIEWED")
                .targetType("OWNER_APPLICATION")
                .targetId(app.getApplicationRef())
                .description("Application " + app.getApplicationRef() + " marked as UNDER_REVIEW")
                .status("SUCCESS")
                .build();
        auditLogRepository.save(auditLog);

        return toResponse(app);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN — STATS
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, Long> getApplicationStats() {
        return Map.of(
                "pending",     applicationRepository.countByApplicationStatus(ApplicationStatus.PENDING),
                "underReview", applicationRepository.countByApplicationStatus(ApplicationStatus.UNDER_REVIEW),
                "approved",    applicationRepository.countByApplicationStatus(ApplicationStatus.APPROVED),
                "rejected",    applicationRepository.countByApplicationStatus(ApplicationStatus.REJECTED)
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MAPPER
    // ─────────────────────────────────────────────────────────────────────────

    private OwnerApplicationResponse toResponse(OwnerApplication app) {
        if (app == null) return null;

        List<OwnerApplicationResponse.DocumentInfo> docs = (app.getDocuments() != null)
                ? app.getDocuments().stream().map(d ->
                    OwnerApplicationResponse.DocumentInfo.builder()
                            .id(d.getId())
                            .documentType(d.getDocumentType())
                            .originalFileName(d.getOriginalFileName())
                            .contentType(d.getContentType())
                            .fileSizeBytes(d.getFileSizeBytes())
                            .uploadedAt(d.getUploadedAt())
                            .downloadUrl("/api/documents/" + d.getId())
                            .build()
                ).collect(Collectors.toList())
                : List.of();

        User applicant  = app.getApplicant();
        User reviewedBy = app.getReviewedBy();

        return OwnerApplicationResponse.builder()
                .id(app.getId())
                .applicationRef(app.getApplicationRef())
                .applicationStatus(app.getApplicationStatus().name())
                .applicantId(applicant != null ? applicant.getId() : null)
                .applicantName(applicant != null ? applicant.getName() : null)
                .applicantEmail(applicant != null ? applicant.getEmail() : null)
                .applicantPhone(applicant != null ? applicant.getPhone() : null)
                .businessName(app.getBusinessName())
                .businessType(app.getBusinessType())
                .address(app.getAddress())
                .city(app.getCity())
                .state(app.getState())
                .pinCode(app.getPinCode())
                .contactNumber(app.getContactNumber())
                .businessIdentifier(app.getBusinessIdentifier())
                .numberOfLocations(app.getNumberOfLocations())
                .ownershipType(app.getOwnershipType())
                // Parking
                .parkingSpaceName(app.getParkingSpaceName())
                .parkingAddress(app.getParkingAddress())
                .parkingCity(app.getParkingCity())
                .parkingState(app.getParkingState())
                .parkingPinCode(app.getParkingPinCode())
                .approxSlots(app.getApproxSlots())
                .parkingType(app.getParkingType())
                .vehicleTypesSupported(app.getVehicleTypesSupported())
                .submittedAt(app.getSubmittedAt())
                .reviewedAt(app.getReviewedAt())
                .reviewedByName(reviewedBy != null ? reviewedBy.getName() : null)
                .rejectionReason(app.getRejectionReason())
                .adminNotes(app.getAdminNotes())
                .documents(docs)
                .build();
    }
}
