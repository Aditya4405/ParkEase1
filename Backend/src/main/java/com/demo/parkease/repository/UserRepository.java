package com.demo.parkease.repository;

import com.demo.parkease.entity.Role;
import com.demo.parkease.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Used by UserService (login) + CustomUserDetailsService (JWT filter)
    Optional<User> findByEmail(String email);

    // Used by UserService (register) — check duplicate email
    boolean existsByEmail(String email);

    // Used by AdminDashboardService — count users by role
    List<User> findByRole(Role role);
}