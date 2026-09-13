package com.demo.parkease.service;

import com.demo.parkease.dto.BookingResponse;
import com.demo.parkease.dto.CreateBookingRequest;
import com.demo.parkease.entity.*;
import com.demo.parkease.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingService {

    private final BookingRepository     bookingRepository;
    private final ParkingRepository     parkingRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final UserRepository        userRepository;

    public BookingService(BookingRepository bookingRepository,
                          ParkingRepository parkingRepository,
                          ParkingSlotRepository parkingSlotRepository,
                          UserRepository userRepository) {
        this.bookingRepository     = bookingRepository;
        this.parkingRepository     = parkingRepository;
        this.parkingSlotRepository = parkingSlotRepository;
        this.userRepository        = userRepository;
    }

    // ✅ USER — Create booking (legacy direct-create endpoint)
    public BookingResponse createBooking(CreateBookingRequest request, Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Parking parking = parkingRepository.findById(request.getParkingId())
                .orElseThrow(() -> new RuntimeException("Parking not found"));
        ParkingSlot slot = parkingSlotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (!slot.getParking().getId().equals(parking.getId()))
            throw new RuntimeException("Slot does not belong to this parking");
        if (slot.getStatus() != SlotStatus.AVAILABLE || slot.getDisabled())
            throw new RuntimeException("Slot is not available");

        LocalDateTime start = LocalDateTime.parse(request.getStartTime(),
                DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        LocalDateTime end = LocalDateTime.parse(request.getEndTime(),
                DateTimeFormatter.ISO_LOCAL_DATE_TIME);

        if (!end.isAfter(start))
            throw new RuntimeException("End time must be after start time");

        double hours  = java.time.Duration.between(start, end).toMinutes() / 60.0;
        double amount = Math.round(hours * slot.getCostPerHour() * 100.0) / 100.0;

        Booking booking = new Booking();
        booking.setParking(parking);
        booking.setSlot(slot);
        booking.setUser(user);
        booking.setVehicleNumber(request.getVehicleNumber());
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setAmount(amount);
        booking.setStatus(BookingStatus.ACTIVE);

        slot.setStatus(SlotStatus.OCCUPIED);
        parkingSlotRepository.save(slot);

        return mapToResponse(bookingRepository.save(booking));
    }

    // ✅ USER — All bookings (BookingHistory.jsx + PaymentsDashboard.jsx)
    public List<BookingResponse> getUserBookings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByUser(user)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ✅ USER — Get current ACTIVE booking
    // Called by ActiveParking.jsx on page refresh when localStorage is empty.
    // Throws RuntimeException("No active booking found") → controller returns 404.
    public BookingResponse getActiveBooking(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking active = bookingRepository
                .findTopByUserAndStatusOrderByCreatedAtDesc(user, BookingStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("No active booking found"));

        return mapToResponse(active);
    }

    // ✅ OWNER — Bookings for a specific parking
    public List<BookingResponse> getParkingBookings(Long parkingId, Long ownerId) {
        Parking parking = parkingRepository.findById(parkingId)
                .orElseThrow(() -> new RuntimeException("Parking not found"));
        if (!parking.getOwner().getId().equals(ownerId))
            throw new RuntimeException("Access denied");
        return bookingRepository.findByParking(parking)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ✅ OWNER — All bookings across all parkings
    public List<BookingResponse> getAllOwnerBookings(Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));
        List<Parking> parkings = parkingRepository.findByOwner(owner);
        return bookingRepository.findByParkingIn(parkings)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ✅ OWNER — Cancel a booking
    public BookingResponse cancelBooking(Long bookingId, Long ownerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!booking.getParking().getOwner().getId().equals(ownerId))
            throw new RuntimeException("Access denied");
        if (booking.getStatus() != BookingStatus.ACTIVE)
            throw new RuntimeException("Only ACTIVE bookings can be cancelled");

        booking.setStatus(BookingStatus.CANCELLED);
        booking.getSlot().setStatus(SlotStatus.AVAILABLE);
        parkingSlotRepository.save(booking.getSlot());
        bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    // ✅ OWNER — Complete a booking
    public BookingResponse completeBooking(Long bookingId, Long ownerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!booking.getParking().getOwner().getId().equals(ownerId))
            throw new RuntimeException("Access denied");
        if (booking.getStatus() != BookingStatus.ACTIVE)
            throw new RuntimeException("Only ACTIVE bookings can be completed");

        booking.setStatus(BookingStatus.COMPLETED);
        booking.setEndTime(LocalDateTime.now());
        booking.getSlot().setStatus(SlotStatus.AVAILABLE);
        parkingSlotRepository.save(booking.getSlot());
        bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    // ✅ USER — Cancel own booking
    public BookingResponse userCancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!booking.getUser().getId().equals(userId))
            throw new RuntimeException("Access denied");
        if (booking.getStatus() != BookingStatus.ACTIVE)
            throw new RuntimeException("Only ACTIVE bookings can be cancelled");

        booking.setStatus(BookingStatus.CANCELLED);
        booking.getSlot().setStatus(SlotStatus.AVAILABLE);
        parkingSlotRepository.save(booking.getSlot());
        bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    // ─── PRIVATE ─────────────────────────────────────────────────────────────

    public BookingResponse mapToResponse(Booking b) {
        BookingResponse r = new BookingResponse();
        r.setId(b.getId());
        r.setParkingId(b.getParking().getId());
        r.setParkingName(b.getParking().getName());
        r.setParkingLocation(b.getParking().getLocation());
        r.setSlotId(b.getSlot().getId());
        r.setSlotCode(b.getSlot().getSlotCode());
        r.setVehicleType(b.getSlot().getVehicleType().name());
        r.setUserId(b.getUser().getId());
        r.setUserName(b.getUser().getName());
        r.setVehicleNumber(b.getVehicleNumber());
        r.setStartTime(b.getStartTime() != null  ? b.getStartTime().toString()  : null);
        r.setEndTime(b.getEndTime()     != null  ? b.getEndTime().toString()     : null);
        r.setAmount(b.getAmount());
        r.setStatus(b.getStatus().name());
        r.setCreatedAt(b.getCreatedAt() != null  ? b.getCreatedAt().toString()  : null);
        return r;
    }
}