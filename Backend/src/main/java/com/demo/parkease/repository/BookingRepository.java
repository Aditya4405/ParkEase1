package com.demo.parkease.repository;

import com.demo.parkease.entity.Booking;
import com.demo.parkease.entity.BookingStatus;
import com.demo.parkease.entity.Parking;
import com.demo.parkease.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // ── High-Performance JOIN FETCH queries to eliminate N+1 round trips ─────
    @Query("SELECT b FROM Booking b " +
           "LEFT JOIN FETCH b.user " +
           "LEFT JOIN FETCH b.parking p " +
           "LEFT JOIN FETCH p.owner " +
           "LEFT JOIN FETCH b.slot " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findAllWithDetails();

    @Query("SELECT b FROM Booking b " +
           "LEFT JOIN FETCH b.user " +
           "LEFT JOIN FETCH b.parking p " +
           "LEFT JOIN FETCH p.owner " +
           "LEFT JOIN FETCH b.slot " +
           "WHERE b.user = :user " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findByUserWithDetails(@Param("user") User user);

    @Query("SELECT b FROM Booking b " +
           "LEFT JOIN FETCH b.user " +
           "LEFT JOIN FETCH b.parking p " +
           "LEFT JOIN FETCH p.owner " +
           "LEFT JOIN FETCH b.slot " +
           "WHERE b.parking = :parking " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findByParkingWithDetails(@Param("parking") Parking parking);

    @Query("SELECT b FROM Booking b " +
           "LEFT JOIN FETCH b.user " +
           "LEFT JOIN FETCH b.parking p " +
           "LEFT JOIN FETCH p.owner " +
           "LEFT JOIN FETCH b.slot " +
           "WHERE b.parking IN :parkings " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findByParkingInWithDetails(@Param("parkings") List<Parking> parkings);

    @Query("SELECT b FROM Booking b " +
           "LEFT JOIN FETCH b.user " +
           "LEFT JOIN FETCH b.parking p " +
           "LEFT JOIN FETCH p.owner " +
           "LEFT JOIN FETCH b.slot " +
           "WHERE b.status = :status " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findByStatusWithDetails(@Param("status") BookingStatus status);

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
    List<Booking> findByStatusAndEndTimeBefore(BookingStatus status, LocalDateTime time);

    // Used by BookingExpiryScheduler JOB 2
    List<Booking> findByStatusAndCreatedAtBefore(BookingStatus status, LocalDateTime time);

    // Used by UserDashboardService — count bookings by status for stats
    long countByUserAndStatus(User user, BookingStatus status);

    // Used by AdminDashboardService — platform-wide active booking count
    long countByStatus(BookingStatus status);
}