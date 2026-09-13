package com.demo.parkease.service;

import com.demo.parkease.dto.LoginRequest;
import com.demo.parkease.dto.RegisterRequest;
import com.demo.parkease.dto.AuthResponse;
import com.demo.parkease.entity.User;
import com.demo.parkease.entity.Role;
import com.demo.parkease.repository.UserRepository;
import com.demo.parkease.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // ✅ REGISTER
    public AuthResponse registerUser(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(request.getRole() == null ? Role.USER : request.getRole());

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
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        if (!user.getRole().equals(request.getRole())) {
            throw new RuntimeException("Role mismatch");
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