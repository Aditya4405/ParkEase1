package com.demo.parkease.repository;

import com.demo.parkease.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Used by PaymentService.endParking() — fetch original booking payment
    // Returns the most recent payment for a booking (DESC by createdAt)
    Optional<Payment> findTopByBookingIdOrderByCreatedAtDesc(Long bookingId);

    // Used by PaymentsDashboard.jsx — show user payment history
    // Returns all payments for bookings belonging to this user
    List<Payment> findByBooking_User_IdOrderByCreatedAtDesc(Long userId);

    // Used by owner revenue analytics
    List<Payment> findByBooking_Parking_Owner_IdOrderByCreatedAtDesc(Long ownerId);

    // Used by initiatePenalty() — check if PENDING penalty already
    // exists for this booking so we don't create duplicates
    Optional<Payment> findTopByBookingIdAndTypeOrderByCreatedAtDesc(
            Long bookingId, Payment.PaymentType type);

    // Used by AdminDashboardService — total revenue calculation
    List<Payment> findByStatus(Payment.PaymentStatus status);
}