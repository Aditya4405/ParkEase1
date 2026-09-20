package com.demo.parkease.controller;

import com.demo.parkease.dto.OwnerApplicationRequest;
import com.demo.parkease.dto.OwnerApplicationResponse;
import com.demo.parkease.service.OwnerApplicationService;
import com.demo.parkease.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Owner Application endpoints — for applicants (not yet active owners).
 *
 * POST /api/owner-applications/submit   — submit a new owner application (multipart)
 * GET  /api/owner-applications/me       — get current user's latest application status
 *
 * Security: /api/owner-applications/submit is public (applicant may not have a JWT yet).
 *           /api/owner-applications/me requires any valid JWT.
 */
@RestController
@RequestMapping("/api/owner-applications")
@CrossOrigin(origins = {"http://localhost:3000", "https://park-ease1-eight.vercel.app"})
public class OwnerApplicationController {

    private final OwnerApplicationService ownerApplicationService;
    private final JwtUtil jwtUtil;

    public OwnerApplicationController(OwnerApplicationService ownerApplicationService,
                                      JwtUtil jwtUtil) {
        this.ownerApplicationService = ownerApplicationService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Submit a new owner application.
     *
     * Accepts multipart/form-data:
     *   - applicationData fields (name, email, password, businessName, etc.)
     *   - document files (identityProof, addressProof, businessProof, propertyProof)
     */
    @PostMapping(value = "/submit", consumes = "multipart/form-data")
    public ResponseEntity<OwnerApplicationResponse> submitApplication(
            @RequestParam("name")               String name,
            @RequestParam("email")              String email,
            @RequestParam("phone")              String phone,
            @RequestParam("password")           String password,
            @RequestParam("businessName")       String businessName,
            @RequestParam(value = "businessType",       required = false) String businessType,
            @RequestParam("address")            String address,
            @RequestParam("city")               String city,
            @RequestParam("state")              String state,
            @RequestParam(value = "pinCode",            required = false) String pinCode,
            @RequestParam(value = "contactNumber",      required = false) String contactNumber,
            @RequestParam(value = "businessIdentifier", required = false) String businessIdentifier,
            @RequestParam(value = "numberOfLocations",  required = false) Integer numberOfLocations,
            @RequestParam(value = "ownershipType",      required = false) String ownershipType,
            // Parking Information
            @RequestParam(value = "parkingSpaceName",   required = false) String parkingSpaceName,
            @RequestParam(value = "parkingAddress",     required = false) String parkingAddress,
            @RequestParam(value = "parkingCity",        required = false) String parkingCity,
            @RequestParam(value = "parkingState",       required = false) String parkingState,
            @RequestParam(value = "parkingPinCode",     required = false) String parkingPinCode,
            @RequestParam(value = "approxSlots",        required = false) Integer approxSlots,
            @RequestParam(value = "parkingType",        required = false) String parkingType,
            @RequestParam(value = "vehicleTypesSupported", required = false) String vehicleTypesSupported,
            @RequestParam(value = "identityProof",      required = false) MultipartFile identityProof,
            @RequestParam(value = "addressProof",       required = false) MultipartFile addressProof,
            @RequestParam(value = "businessProof",      required = false) MultipartFile businessProof,
            @RequestParam(value = "propertyProof",      required = false) MultipartFile propertyProof
    ) throws IOException {

        OwnerApplicationRequest request = new OwnerApplicationRequest();
        request.setName(name);
        request.setEmail(email);
        request.setPhone(phone);
        request.setPassword(password);
        request.setBusinessName(businessName);
        request.setBusinessType(businessType);
        request.setAddress(address);
        request.setCity(city);
        request.setState(state);
        request.setPinCode(pinCode);
        request.setContactNumber(contactNumber);
        request.setBusinessIdentifier(businessIdentifier);
        request.setNumberOfLocations(numberOfLocations);
        request.setOwnershipType(ownershipType);
        // Parking
        request.setParkingSpaceName(parkingSpaceName);
        request.setParkingAddress(parkingAddress);
        request.setParkingCity(parkingCity);
        request.setParkingState(parkingState);
        request.setParkingPinCode(parkingPinCode);
        request.setApproxSlots(approxSlots);
        request.setParkingType(parkingType);
        request.setVehicleTypesSupported(vehicleTypesSupported);

        Map<String, MultipartFile> documents = new HashMap<>();
        if (identityProof != null && !identityProof.isEmpty())
            documents.put("IDENTITY_PROOF", identityProof);
        if (addressProof != null && !addressProof.isEmpty())
            documents.put("ADDRESS_PROOF", addressProof);
        if (businessProof != null && !businessProof.isEmpty())
            documents.put("BUSINESS_PROOF", businessProof);
        if (propertyProof != null && !propertyProof.isEmpty())
            documents.put("PROPERTY_PROOF", propertyProof);

        OwnerApplicationResponse response = ownerApplicationService.submitApplication(request, documents);
        return ResponseEntity.ok(response);
    }

    /**
     * Check status of an owner application by reference number (e.g. PE-2026-00001).
     * Public endpoint so applicant can check status without a JWT.
     */
    @GetMapping("/status/{ref}")
    public ResponseEntity<OwnerApplicationResponse> getStatusByRef(@PathVariable String ref) {
        return ResponseEntity.ok(ownerApplicationService.getApplicationByRef(ref));
    }

    /**
     * Get the current authenticated user's most recent owner application.
     * Used by the pending page to show status details when authenticated.
     */
    @GetMapping("/me")
    public ResponseEntity<OwnerApplicationResponse> getMyApplication(HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        return ResponseEntity.ok(ownerApplicationService.getMyApplication(userId));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Long extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized");
        }
        return jwtUtil.extractUserId(authHeader.substring(7));
    }
}
