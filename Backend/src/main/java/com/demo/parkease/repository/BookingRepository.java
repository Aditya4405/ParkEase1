package com.demo.parkease.repository;

import com.demo.parkease.entity.Booking;
import com.demo.parkease.entity.BookingStatus;
import com.demo.parkease.entity.Parking;
import com.demo.parkease.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Used by BookingService.getUserBookings() — BookingHistory.jsx
    List<Booking> findByUser(User user);

    // Used by BookingService.getActiveBooking() — restore session on refresh
    Optional<Booking> findTopByUserAndStatusOrderByCreatedAtDesc(
            User user, BookingStatus status);

    // Used by BookingService.getParkingBookings() — OwnerBookings.jsx
    List<Booking> findByParking(Parking parking);

    // Used by BookingService.getAllOwnerBookings() — all bookings across all owner parkings
    List<Booking> findByParkingIn(List<Parking> parkings);

    // Used by BookingExpiryScheduler JOB 1
    // Auto-complete ACTIVE bookings whose endTime has passed
    List<Booking> findByStatusAndEndTimeBefore(BookingStatus status, LocalDateTime time);

    // Used by BookingExpiryScheduler JOB 2
    // Cancel PENDING bookings older than 15 minutes (abandoned checkouts)
    List<Booking> findByStatusAndCreatedAtBefore(BookingStatus status, LocalDateTime time);

    // Used by UserDashboardService — count bookings by status for stats
    long countByUserAndStatus(User user, BookingStatus status);

    // Used by AdminDashboardService — platform-wide active booking count
    long countByStatus(BookingStatus status);
}