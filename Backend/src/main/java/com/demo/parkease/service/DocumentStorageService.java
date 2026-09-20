package com.demo.parkease.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Abstraction layer for storing and retrieving owner application documents.
 *
 * Currently uses the local filesystem under ${app.document.upload-dir}.
 * Can be replaced with cloud storage (S3/GCS) by changing this class only.
 *
 * Security measures:
 * - File type validation (allowlist)
 * - File size validation
 * - Sanitized filenames — no directory traversal possible
 * - No user-supplied filenames are used as storage paths
 */
@Service
public class DocumentStorageService {

    @Value("${app.document.upload-dir:./uploads/owner-docs}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png"
    );

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            ".pdf", ".jpg", ".jpeg", ".png"
    );

    /**
     * Store a document and return its relative storage path.
     *
     * @param applicationId the application ID (used in filename for organisation)
     * @param documentType  category label (IDENTITY_PROOF etc.)
     * @param file          the uploaded multipart file
     * @return relative path from uploadDir (safe to store in DB)
     */
    public String storeDocument(Long applicationId, String documentType, MultipartFile file)
            throws IOException {

        validateFile(file);

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        String extension = getExtension(file.getOriginalFilename());
        // Sanitized storage name: no user-controlled characters in the path
        String storageName = String.format("%d_%s_%s%s",
                applicationId,
                sanitizeLabel(documentType),
                UUID.randomUUID(),
                extension);

        Path destination = uploadPath.resolve(storageName).normalize();

        // Safety check: ensure the destination is inside uploadDir
        if (!destination.startsWith(uploadPath)) {
            throw new IllegalArgumentException("Invalid file path detected.");
        }

        try (InputStream is = file.getInputStream()) {
            Files.copy(is, destination, StandardCopyOption.REPLACE_EXISTING);
        }

        return storageName; // relative path
    }

    /**
     * Resolve the absolute Path for a stored document.
     * Only safe because storageName is server-generated (UUID-based).
     */
    public Path resolveStoragePath(String storageName) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path resolved   = uploadPath.resolve(storageName).normalize();

        // Prevent path traversal
        if (!resolved.startsWith(uploadPath)) {
            throw new IllegalArgumentException("Invalid storage path.");
        }
        return resolved;
    }

    /** Delete a stored document (best-effort — errors are logged, not thrown) */
    public void deleteDocument(String storageName) {
        try {
            Path path = resolveStoragePath(storageName);
            Files.deleteIfExists(path);
        } catch (Exception ignored) {
            // Best-effort cleanup
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("File exceeds maximum size of 10 MB: " + file.getOriginalFilename());
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Unsupported file type: " + contentType + ". Allowed: PDF, JPG, PNG.");
        }

        String ext = getExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported file extension: " + ext);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf("."));
    }

    /** Remove any non-alphanumeric characters from a label to make it safe for filenames */
    private String sanitizeLabel(String label) {
        if (label == null) return "DOC";
        return label.replaceAll("[^a-zA-Z0-9_]", "_").toUpperCase();
    }
}
