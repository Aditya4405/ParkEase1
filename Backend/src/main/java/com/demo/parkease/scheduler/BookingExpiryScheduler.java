package com.demo.parkease.scheduler;

import com.demo.parkease.entity.Booking;
import com.demo.parkease.entity.BookingStatus;
import com.demo.parkease.entity.ParkingSlot;
import com.demo.parkease.entity.SlotStatus;
import com.demo.parkease.repository.BookingRepository;
import com.demo.parkease.repository.ParkingSlotRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Runs every 60 seconds.
 *
 * JOB 1 — Auto-complete expired ACTIVE bookings
 *   Finds bookings where status=ACTIVE and endTime < now.
 *   Sets status=COMPLETED and slot=AVAILABLE.
 *   This is the "automatic status change to COMPLETED" you asked for.
 *
 * JOB 2 — Release abandoned RESERVED slots
 *   Finds bookings where status=PENDING and createdAt < now - 15 min.
 *   (User initiated checkout but never confirmed payment.)
 *   Sets status=CANCELLED and slot=AVAILABLE.
 */
@Component
public class BookingExpiryScheduler {

    private static final Logger log = LoggerFactory.getLogger(BookingExpiryScheduler.class);

    private final BookingRepository bookingRepository;
    private final ParkingSlotRepository slotRepository;

    public BookingExpiryScheduler(BookingRepository bookingRepository,
                                  ParkingSlotRepository slotRepository) {
        this.bookingRepository = bookingRepository;
        this.slotRepository    = slotRepository;
    }

    @Scheduled(fixedRate = 60_000) // every 60 seconds
    @Transactional
    public void run() {
        LocalDateTime now = LocalDateTime.now();
        expireActiveBookings(now);
        cancelAbandonedCheckouts(now);
    }

    // ── Job 1: ACTIVE + endTime < now → COMPLETED + slot AVAILABLE ───────────
    private void expireActiveBookings(LocalDateTime now) {
        List<Booking> expired = bookingRepository
                .findByStatusAndEndTimeBefore(BookingStatus.ACTIVE, now);

        if (expired.isEmpty()) return;

        log.info("Auto-expiring {} booking(s)", expired.size());

        for (Booking booking : expired) {
            booking.setStatus(BookingStatus.COMPLETED);
            bookingRepository.save(booking);
            releaseSlot(booking.getSlot());
            log.info("Booking {} auto-completed, slot {} released",
                    booking.getId(),
                    booking.getSlot() != null ? booking.getSlot().getSlotCode() : "N/A");
        }
    }

    // ── Job 2: PENDING + createdAt < (now - 15min) → CANCELLED + slot AVAILABLE
    private void cancelAbandonedCheckouts(LocalDateTime now) {
        LocalDateTime cutoff = now.minusMinutes(15);
        List<Booking> abandoned = bookingRepository
                .findByStatusAndCreatedAtBefore(BookingStatus.PENDING, cutoff);

        if (abandoned.isEmpty()) return;

        log.info("Cancelling {} abandoned checkout(s)", abandoned.size());

        for (Booking booking : abandoned) {
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            releaseSlot(booking.getSlot());
            log.info("Abandoned booking {} cancelled, slot {} released",
                    booking.getId(),
                    booking.getSlot() != null ? booking.getSlot().getSlotCode() : "N/A");
        }
    }

    private void releaseSlot(ParkingSlot slot) {
        if (slot != null && slot.getStatus() != SlotStatus.AVAILABLE) {
            slot.setStatus(SlotStatus.AVAILABLE);
            slotRepository.save(slot);
        }
    }
}