package com.demo.parkease.repository;

import com.demo.parkease.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // ── High-Performance JOIN FETCH queries to eliminate N+1 round trips ─────
    @Query("SELECT p FROM Payment p " +
           "LEFT JOIN FETCH p.booking b " +
           "LEFT JOIN FETCH b.user " +
           "LEFT JOIN FETCH b.parking pk " +
           "LEFT JOIN FETCH pk.owner " +
           "LEFT JOIN FETCH b.slot " +
           "ORDER BY p.createdAt DESC")
    List<Payment> findAllWithDetails();

    @Query("SELECT p FROM Payment p " +
           "LEFT JOIN FETCH p.booking b " +
           "LEFT JOIN FETCH b.user u " +
           "LEFT JOIN FETCH b.parking pk " +
           "LEFT JOIN FETCH b.slot " +
           "WHERE u.id = :userId " +
           "ORDER BY p.createdAt DESC")
    List<Payment> findByUserIdWithDetails(@Param("userId") Long userId);

    @Query("SELECT p FROM Payment p " +
           "LEFT JOIN FETCH p.booking b " +
           "LEFT JOIN FETCH b.user " +
           "LEFT JOIN FETCH b.parking pk " +
           "LEFT JOIN FETCH pk.owner o " +
           "LEFT JOIN FETCH b.slot " +
           "WHERE o.id = :ownerId " +
           "ORDER BY p.createdAt DESC")
    List<Payment> findByOwnerIdWithDetails(@Param("ownerId") Long ownerId);

    // Used by PaymentService.endParking() — fetch original booking payment
    Optional<Payment> findTopByBookingIdOrderByCreatedAtDesc(Long bookingId);

    // Used by PaymentsDashboard.jsx — show user payment history
    List<Payment> findByBooking_User_IdOrderByCreatedAtDesc(Long userId);

    // Used by owner revenue analytics
    List<Payment> findByBooking_Parking_Owner_IdOrderByCreatedAtDesc(Long ownerId);

    // Used by initiatePenalty()
    Optional<Payment> findTopByBookingIdAndTypeOrderByCreatedAtDesc(
            Long bookingId, Payment.PaymentType type);

    // Used by AdminDashboardService — total revenue calculation
    List<Payment> findByStatus(Payment.PaymentStatus status);
}