package com.demo.parkease.filter;

import com.demo.parkease.service.CustomUserDetailsService;
import com.demo.parkease.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Runs once per request (extends OncePerRequestFilter).
 *
 * Flow:
 *  1. Read "Authorization: Bearer <token>" header
 *  2. Extract email from token via JwtUtil
 *  3. Load UserDetails from DB via CustomUserDetailsService
 *  4. Validate token (signature + expiry)
 *  5. Set authentication in SecurityContext so Spring Security
 *     allows the request through to the controller
 *
 * If any step fails the filter simply does NOT set authentication,
 * and Spring Security will return 401/403 automatically.
 *
 * Public routes (/api/auth/**) are permitted in SecurityConfig
 * so this filter is effectively skipped for them.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthFilter(JwtUtil jwtUtil,
                         CustomUserDetailsService userDetailsService) {
        this.jwtUtil            = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest  request,
                                    HttpServletResponse response,
                                    FilterChain         filterChain)
            throws ServletException, IOException {

        // ── Step 1: Read Authorization header ────────────────────────────────
        final String authHeader = request.getHeader("Authorization");

        // Skip if no Bearer token present
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // ── Step 2: Extract JWT and email ─────────────────────────────────────
        final String jwt   = authHeader.substring(7); // strip "Bearer "
        final String email;

        try {
            email = jwtUtil.extractEmail(jwt);
        } catch (Exception e) {
            // Malformed token — skip filter, let Spring Security reject it
            filterChain.doFilter(request, response);
            return;
        }

        // ── Step 3: Only authenticate if not already authenticated ────────────
        if (email != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

            // ── Step 4: Load user from DB and validate token ──────────────────
            UserDetails userDetails =
                    userDetailsService.loadUserByUsername(email);

            if (jwtUtil.isTokenValid(jwt)) {

                // ── Step 5: Set authentication in SecurityContext ──────────────
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,                        // credentials (not needed)
                                userDetails.getAuthorities() // ROLE_USER / ROLE_OWNER / ROLE_ADMIN
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                SecurityContextHolder.getContext()
                        .setAuthentication(authToken);
            }
        }

        // ── Continue down the filter chain ────────────────────────────────────
        filterChain.doFilter(request, response);
    }
}