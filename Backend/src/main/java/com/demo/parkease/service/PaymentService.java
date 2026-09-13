package com.demo.parkease.service;

import com.demo.parkease.dto.ConfirmPaymentRequest;
import com.demo.parkease.dto.InitiatePaymentRequest;
import com.demo.parkease.dto.PaymentResponse;
import com.demo.parkease.entity.Booking;
import com.demo.parkease.entity.BookingStatus;
import com.demo.parkease.entity.Payment;
import com.demo.parkease.entity.ParkingSlot;
import com.demo.parkease.entity.SlotStatus;
import com.demo.parkease.entity.User;
import com.demo.parkease.repository.BookingRepository;
import com.demo.parkease.repository.PaymentRepository;
import com.demo.parkease.repository.ParkingSlotRepository;
import com.demo.parkease.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class PaymentService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final ParkingSlotRepository slotRepository;
    private final UserRepository userRepository;

    public PaymentService(PaymentRepository paymentRepository,
                          BookingRepository bookingRepository,
                          ParkingSlotRepository slotRepository,
                          UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.slotRepository    = slotRepository;
        this.userRepository    = userRepository;
    }

    // =========================================================================
    // STEP 1 — INITIATE
    // Dispatches to the correct sub-flow based on paymentType.
    // =========================================================================
    @Transactional
    public PaymentResponse initiatePayment(InitiatePaymentRequest req, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Payment.PaymentType type = parseType(req.getPaymentType());

        return switch (type) {
            case EXTENSION -> initiateExtension(req, user);
            case PENALTY   -> initiatePenalty(req, user);
            default        -> initiateBooking(req, user);
        };
    }

    // =========================================================================
    // STEP 2 — CONFIRM
    // Simulates gateway. Always succeeds (mock).
    // Saves SUCCESS to DB, activates booking, occupies slot.
    // =========================================================================
    @Transactional
    public PaymentResponse confirmPayment(Long paymentId,
                                          ConfirmPaymentRequest req,
                                          Long userId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

        Booking booking = payment.getBooking();

        if (!booking.getUser().getId().equals(userId))
            throw new RuntimeException("Unauthorized");

        // Idempotent — already confirmed, just return
        if (payment.getStatus() == Payment.PaymentStatus.SUCCESS)
            return toResponse(payment);

        if (payment.getStatus() != Payment.PaymentStatus.PENDING)
            throw new RuntimeException("Payment already processed (status=" + payment.getStatus() + ")");

        // ── Simulate gateway (always succeeds in mock mode) ──────────────────
        boolean gatewaySuccess = callGateway(req);

        if (!gatewaySuccess) {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            paymentRepository.save(payment);
            // If booking flow failed, release the reserved slot
            if (payment.getType() == Payment.PaymentType.BOOKING) {
                releaseSlot(booking.getSlot());
                booking.setStatus(BookingStatus.CANCELLED);
                bookingRepository.save(booking);
            }
            throw new RuntimeException("Payment failed. Please try again.");
        }

        // ── Mark payment SUCCESS in DB ────────────────────────────────────────
        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        payment.setMethod(parseMethod(req.getPaymentMethod()));
        payment.setTransactionId(
                "PE-" + UUID.randomUUID().toString().replace("-", "")
                        .substring(0, 12).toUpperCase()
        );
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // ── Update booking + slot based on payment type ───────────────────────
        ParkingSlot slot = booking.getSlot();

        switch (payment.getType()) {

            case BOOKING -> {
                // Slot moves from RESERVED → OCCUPIED
                slot.setStatus(SlotStatus.OCCUPIED);
                slotRepository.save(slot);
                // Booking moves from PENDING → ACTIVE
                booking.setStatus(BookingStatus.ACTIVE);
                bookingRepository.save(booking);
            }

            case EXTENSION -> {
                // Push end time forward by purchased hours
                long hours = Math.max(1,
                        Math.round(payment.getAmount() / slot.getCostPerHour()));
                booking.setEndTime(booking.getEndTime().plusHours(hours));
                // Add extension cost to booking total
                booking.setAmount(
                        (booking.getAmount() != null ? booking.getAmount() : 0.0)
                                + payment.getAmount()
                );
                // Booking stays ACTIVE
                bookingRepository.save(booking);
            }

            case PENALTY -> {
                // Add penalty cost to booking total
                booking.setAmount(
                        (booking.getAmount() != null ? booking.getAmount() : 0.0)
                                + payment.getAmount()
                );
                // Penalty paid → complete session, free the slot
                releaseSlot(slot);
                booking.setStatus(BookingStatus.COMPLETED);
                bookingRepository.save(booking);
            }
        }

        return toResponse(payment);
    }

    // =========================================================================
    // END PARKING — clean end, no penalty
    // Marks booking COMPLETED, frees slot.
    // =========================================================================
    @Transactional
    public PaymentResponse endParking(Long bookingId, Long userId) {
        Booking booking = getBookingForUser(bookingId, userId);

        if (booking.getStatus() != BookingStatus.ACTIVE)
            throw new RuntimeException("Booking is not ACTIVE (status=" + booking.getStatus() + ")");

        // Guard: if already past end time, force penalty flow
        if (LocalDateTime.now().isAfter(booking.getEndTime()))
            throw new RuntimeException(
                    "Booking has expired. Use penalty flow to end parking.");

        releaseSlot(booking.getSlot());
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setEndTime(LocalDateTime.now());
        bookingRepository.save(booking);

        // Return the original BOOKING payment record
        Payment original = paymentRepository
                .findTopByBookingIdOrderByCreatedAtDesc(bookingId)
                .orElseThrow(() -> new RuntimeException(
                        "No payment record found for booking " + bookingId));

        return toResponse(original);
    }

    // =========================================================================
    // PAY LATER — defer penalty
    // Releases slot immediately, leaves PENDING penalty in DB.
    // Account flagging is handled client-side (localStorage).
    // =========================================================================
    @Transactional
    public void markPenaltyPayLater(Long bookingId, Long userId) {
        Booking booking = getBookingForUser(bookingId, userId);

        // Always release the slot — it must never stay blocked for unpaid penalty
        releaseSlot(booking.getSlot());
        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);

        // The PENDING penalty payment row stays in DB as a reminder.
        // When user eventually pays, /initiate → /confirm will find it.
    }

    // =========================================================================
    // PRIVATE — initiate sub-flows
    // =========================================================================

    private PaymentResponse initiateBooking(InitiatePaymentRequest req, User user) {

        ParkingSlot slot = slotRepository.findById(req.getSlotId())
                .orElseThrow(() -> new RuntimeException("Slot not found: " + req.getSlotId()));

        if (slot.getStatus() != SlotStatus.AVAILABLE || Boolean.TRUE.equals(slot.getDisabled()))
            throw new RuntimeException("Slot is not available for booking");

        // Parse datetimes — frontend sends "YYYY-MM-DDTHH:MM:SS"
        LocalDateTime start = LocalDateTime.parse(req.getStartTime(), FMT);
        LocalDateTime end   = LocalDateTime.parse(req.getEndTime(),   FMT);

        if (!end.isAfter(start))
            throw new RuntimeException("End time must be after start time");

        // Calculate amount: use fractional hours for accuracy
        double durationHours = ChronoUnit.MINUTES.between(start, end) / 60.0;
        double amount = Math.round(slot.getCostPerHour() * durationHours * 100.0) / 100.0;

        // Create PENDING booking — becomes ACTIVE only after /confirm
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setParking(slot.getParking());
        booking.setSlot(slot);
        booking.setVehicleNumber(req.getVehicleNumber());
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setAmount(amount);
        booking.setStatus(BookingStatus.PENDING);   // override @PrePersist default
        bookingRepository.save(booking);

        // Hold the slot during checkout window (max 15 min via scheduler)
        slot.setStatus(SlotStatus.RESERVED);
        slotRepository.save(slot);

        return toResponse(savePendingPayment(booking, amount, Payment.PaymentType.BOOKING));
    }

    private PaymentResponse initiateExtension(InitiatePaymentRequest req, User user) {
        Booking booking = getBookingForUser(req.getBookingId(), user.getId());

        if (booking.getStatus() != BookingStatus.ACTIVE)
            throw new RuntimeException("Can only extend an ACTIVE booking");

        int hours  = req.getExtensionHours() != null ? req.getExtensionHours() : 1;
        double amount = booking.getSlot().getCostPerHour() * hours;

        return toResponse(savePendingPayment(booking, amount, Payment.PaymentType.EXTENSION));
    }

    private PaymentResponse initiatePenalty(InitiatePaymentRequest req, User user) {
        Booking booking = getBookingForUser(req.getBookingId(), user.getId());

        // Server recalculates penalty from actual overtime — ₹10 per 15 min
        long overtimeMinutes = ChronoUnit.MINUTES.between(
                booking.getEndTime(), LocalDateTime.now());
        if (overtimeMinutes <= 0)
            throw new RuntimeException("No overtime detected — booking has not expired yet");

        long intervals    = Math.max(1, overtimeMinutes / 15);
        double penalty    = intervals * 10.0;

        return toResponse(savePendingPayment(booking, penalty, Payment.PaymentType.PENALTY));
    }

    // =========================================================================
    // PRIVATE — shared utilities
    // =========================================================================

    /** Creates and persists a PENDING Payment record. */
    private Payment savePendingPayment(Booking booking, double amount,
                                       Payment.PaymentType type) {
        Payment p = new Payment();
        p.setBooking(booking);
        p.setAmount(amount);
        p.setStatus(Payment.PaymentStatus.PENDING);
        p.setType(type);
        return paymentRepository.save(p);
    }

    private void releaseSlot(ParkingSlot slot) {
        if (slot != null && slot.getStatus() != SlotStatus.AVAILABLE) {
            slot.setStatus(SlotStatus.AVAILABLE);
            slotRepository.save(slot);
        }
    }

    private Booking getBookingForUser(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        if (!booking.getUser().getId().equals(userId))
            throw new RuntimeException("Unauthorized: booking does not belong to you");
        return booking;
    }

    /**
     * Mock payment gateway — always returns true.
     *
     * To integrate Razorpay later, replace this body:
     *   RazorpayClient client = new RazorpayClient(KEY_ID, KEY_SECRET);
     *   // verify req.paymentToken (razorpay_payment_id) signature here
     *   return signatureIsValid;
     */
    private boolean callGateway(ConfirmPaymentRequest req) {
        return true; // Always succeeds in mock mode
    }

    private Payment.PaymentType parseType(String type) {
        if (type == null) return Payment.PaymentType.BOOKING;
        try { return Payment.PaymentType.valueOf(type.toUpperCase()); }
        catch (IllegalArgumentException e) { return Payment.PaymentType.BOOKING; }
    }

    private Payment.PaymentMethod parseMethod(String method) {
        if (method == null) return Payment.PaymentMethod.UPI;
        try { return Payment.PaymentMethod.valueOf(method.toUpperCase()); }
        catch (IllegalArgumentException e) { return Payment.PaymentMethod.UPI; }
    }

    /**
     * Maps a Payment entity → PaymentResponse DTO.
     *
     * IMPORTANT: This returns ALL fields that ActiveParking.jsx needs
     * to build the localStorage "parkease_active_booking" object.
     * Do NOT remove fields from this method.
     */
    private PaymentResponse toResponse(Payment p) {
        PaymentResponse r = new PaymentResponse();

        // ── Payment fields ────────────────────────────────────────────────────
        r.setPaymentId(p.getId());
        r.setAmount(p.getAmount());
        r.setStatus(p.getStatus().name());
        r.setPaymentType(p.getType().name());
        if (p.getMethod() != null)      r.setPaymentMethod(p.getMethod().name());
        r.setTransactionId(p.getTransactionId());
        r.setPaidAt(p.getPaidAt());
        r.setCreatedAt(p.getCreatedAt());

        // ── Booking snapshot — needed by PaymentPage.jsx to populate localStorage
        Booking b = p.getBooking();
        if (b != null) {
            r.setBookingId(b.getId());
            r.setBookingStatus(b.getStatus().name());
            r.setVehicleNumber(b.getVehicleNumber());
            if (b.getStartTime() != null) r.setStartTime(b.getStartTime().format(FMT));
            if (b.getEndTime()   != null) r.setEndTime(b.getEndTime().format(FMT));

            ParkingSlot slot = b.getSlot();
            if (slot != null) {
                r.setSlotCode(slot.getSlotCode());
                r.setSlotId(slot.getId());
                r.setRatePerHour(slot.getCostPerHour());
            }

            if (b.getParking() != null) {
                r.setParkingName(b.getParking().getName());
                r.setParkingLocation(b.getParking().getLocation());
            }
        }

        return r;
    }
}