package com.demo.parkease.service;

import com.demo.parkease.dto.UserStatsResponse;
import com.demo.parkease.entity.*;
import com.demo.parkease.repository.BookingRepository;
import com.demo.parkease.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserDashboardService {

    private final BookingRepository bookingRepository;
    private final UserRepository    userRepository;

    public UserDashboardService(BookingRepository bookingRepository,
                                UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository    = userRepository;
    }

    // ✅ GET /api/user/dashboard/stats
    public UserStatsResponse getUserStats(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> all = bookingRepository.findByUser(user);

        int total     = all.size();
        int active    = (int) all.stream().filter(b -> b.getStatus() == BookingStatus.ACTIVE).count();
        int completed = (int) all.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count();
        int cancelled = (int) all.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count();

        double spent = all.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0)
                .sum();

        // Active booking snapshot — most recent ACTIVE booking
        UserStatsResponse.ActiveBookingSnapshot snapshot = all.stream()
                .filter(b -> b.getStatus() == BookingStatus.ACTIVE)
                .findFirst()
                .map(this::mapToSnapshot)
                .orElse(null);

        UserStatsResponse stats = new UserStatsResponse();
        stats.setTotalBookings(total);
        stats.setActiveBookings(active);
        stats.setCompletedBookings(completed);
        stats.setCancelledBookings(cancelled);
        stats.setTotalAmountSpent(spent);
        stats.setActiveBooking(snapshot);

        return stats;
    }

    // ─── PRIVATE ────────────────────────────────────────────────────────────

    private UserStatsResponse.ActiveBookingSnapshot mapToSnapshot(Booking b) {
        UserStatsResponse.ActiveBookingSnapshot s =
                new UserStatsResponse.ActiveBookingSnapshot();

        s.setBookingId(b.getId());
        s.setParkingName(b.getParking().getName());
        s.setParkingLocation(b.getParking().getLocation());
        s.setSlotCode(b.getSlot().getSlotCode());
        s.setSlotDbId(b.getSlot().getId());           // ← needed by extend flow
        s.setRatePerHour(b.getSlot().getCostPerHour()); // ← needed by extend flow
        s.setVehicleNumber(b.getVehicleNumber());

        s.setStartTime(b.getStartTime() != null
                ? b.getStartTime().toString() : null);
        s.setEndTime(b.getEndTime() != null
                ? b.getEndTime().toString() : null);
        s.setAmount(b.getAmount());

        return s;
    }
}