package com.demo.parkease.controller;

import com.demo.parkease.entity.OwnerApplicationDocument;
import com.demo.parkease.entity.Role;
import com.demo.parkease.entity.User;
import com.demo.parkease.repository.OwnerApplicationDocumentRepository;
import com.demo.parkease.repository.UserRepository;
import com.demo.parkease.service.DocumentStorageService;
import com.demo.parkease.util.JwtUtil;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.net.MalformedURLException;
import java.nio.file.Path;

/**
 * Secure document download endpoint.
 *
 * GET /api/documents/{documentId}
 *
 * Access control:
 *   - ADMIN users can download any document.
 *   - The applicant (owner of the application) can download their own documents.
 *   - All others receive 403.
 *
 * Documents are served inline (for preview) by default, or as attachment
 * when ?download=true is appended.
 */
@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = {"http://localhost:3000", "https://park-ease1-eight.vercel.app"})
public class DocumentController {

    private final OwnerApplicationDocumentRepository documentRepository;
    private final DocumentStorageService             documentStorageService;
    private final UserRepository                     userRepository;
    private final JwtUtil                            jwtUtil;

    public DocumentController(OwnerApplicationDocumentRepository documentRepository,
                               DocumentStorageService documentStorageService,
                               UserRepository userRepository,
                               JwtUtil jwtUtil) {
        this.documentRepository     = documentRepository;
        this.documentStorageService = documentStorageService;
        this.userRepository         = userRepository;
        this.jwtUtil                = jwtUtil;
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long documentId,
            @RequestParam(value = "download", defaultValue = "false") boolean download,
            HttpServletRequest httpRequest) throws MalformedURLException {

        // Extract and validate JWT
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(403).build();
        }

        String token = authHeader.substring(7);
        Long requesterId = jwtUtil.extractUserId(token);
        String requesterEmail = jwtUtil.extractEmail(token);

        User requester = userRepository.findByEmail(requesterEmail).orElse(null);
        if (requester == null) {
            return ResponseEntity.status(403).build();
        }

        // Look up document
        OwnerApplicationDocument doc = documentRepository.findById(documentId).orElse(null);
        if (doc == null) {
            return ResponseEntity.notFound().build();
        }

        // Authorization: ADMIN always allowed; otherwise only the application's own applicant
        boolean isAdmin     = requester.getRole() == Role.ADMIN;
        boolean isApplicant = doc.getApplication() != null
                && doc.getApplication().getApplicant() != null
                && doc.getApplication().getApplicant().getId().equals(requesterId);

        if (!isAdmin && !isApplicant) {
            return ResponseEntity.status(403).build();
        }

        // Resolve and serve file
        Path filePath = documentStorageService.resolveStoragePath(doc.getStoragePath());
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = doc.getContentType() != null
                ? doc.getContentType() : "application/octet-stream";

        String disposition = download
                ? "attachment; filename=\"" + doc.getOriginalFileName() + "\""
                : "inline; filename=\"" + doc.getOriginalFileName() + "\"";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .body(resource);
    }
}
