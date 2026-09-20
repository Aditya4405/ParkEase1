package com.demo.parkease.service;

import com.demo.parkease.dto.LoginRequest;
import com.demo.parkease.dto.RegisterRequest;
import com.demo.parkease.dto.AuthResponse;
import com.demo.parkease.entity.User;
import com.demo.parkease.entity.Role;
import com.demo.parkease.exception.OwnerPendingException;
import com.demo.parkease.exception.OwnerRejectedException;
import com.demo.parkease.repository.OwnerApplicationRepository;
import com.demo.parkease.repository.UserRepository;
import com.demo.parkease.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OwnerApplicationRepository ownerApplicationRepository;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       OwnerApplicationRepository ownerApplicationRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.ownerApplicationRepository = ownerApplicationRepository;
    }

    // ✅ REGISTER (USER only — owners go through /api/owner-applications/submit)
    public AuthResponse registerUser(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        // Force USER role regardless of what's sent — owner registration goes through /owner-applications
        user.setRole(Role.USER);

        userRepository.save(user);

        // Generate JWT immediately after register
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getId()
        );

        return new AuthResponse(
                "Registration successful",
                user.getRole().name(),
                token,
                user.getId(),
                user.getName()
        );
    }

    // ✅ LOGIN
    public AuthResponse loginUser(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password.");
        }

        if (user.getAccountStatus() == User.AccountStatus.SUSPENDED) {
            throw new RuntimeException("Your account is currently inactive.");
        }

        // ── Owner application status checks ──────────────────────────────────
        // These throw special exceptions caught by GlobalExceptionHandler
        // so that the frontend receives a structured response, not a generic error.
        // CRITICAL: No JWT is issued to OWNER_PENDING or OWNER_REJECTED accounts.

        if (user.getRole() == Role.OWNER) {
            if (user.getAccountStatus() == User.AccountStatus.OWNER_PENDING) {
                // Fetch the application ref for a better UX on the pending page
                String ref = ownerApplicationRepository
                        .findTopByApplicantIdOrderBySubmittedAtDesc(user.getId())
                        .map(a -> a.getApplicationRef())
                        .orElse(null);
                throw new OwnerPendingException(ref);
            }
            if (user.getAccountStatus() == User.AccountStatus.OWNER_REJECTED) {
                String reason = ownerApplicationRepository
                        .findTopByApplicantIdOrderBySubmittedAtDesc(user.getId())
                        .map(a -> a.getRejectionReason())
                        .orElse(null);
                throw new OwnerRejectedException(reason);
            }
        }

        // Generate JWT on successful login
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getId()
        );

        return new AuthResponse(
                "Login successful",
                user.getRole().name(),
                token,
                user.getId(),
                user.getName()
        );
    }
}