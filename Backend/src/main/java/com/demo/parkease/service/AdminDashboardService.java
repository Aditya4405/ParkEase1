package com.demo.parkease.service;

import com.demo.parkease.dto.AdminStatsResponse;
import com.demo.parkease.dto.BookingResponse;
import com.demo.parkease.entity.*;
import com.demo.parkease.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final UserRepository              userRepository;
    private final ParkingRepository           parkingRepository;
    private final ParkingSlotRepository       slotRepository;
    private final BookingRepository           bookingRepository;
    private final PaymentRepository           paymentRepository;
    private final AuditLogRepository          auditLogRepository;
    private final MaintenanceIssueRepository  maintenanceRepository;
    private final AdminNotificationRepository notificationRepository;
    private final RefundRequestRepository     refundRequestRepository;

    public AdminDashboardService(UserRepository userRepository,
                                 ParkingRepository parkingRepository,
                                 ParkingSlotRepository slotRepository,
                                 BookingRepository bookingRepository,
                                 PaymentRepository paymentRepository,
                                 AuditLogRepository auditLogRepository,
                                 MaintenanceIssueRepository maintenanceRepository,
                                 AdminNotificationRepository notificationRepository,
                                 RefundRequestRepository refundRequestRepository) {
        this.userRepository         = userRepository;
        this.parkingRepository      = parkingRepository;
        this.slotRepository         = slotRepository;
        this.bookingRepository      = bookingRepository;
        this.paymentRepository      = paymentRepository;
        this.auditLogRepository     = auditLogRepository;
        this.maintenanceRepository  = maintenanceRepository;
        this.notificationRepository = notificationRepository;
        this.refundRequestRepository = refundRequestRepository;
    }

    // ── Overview stats ────────────────────────────────────────────────────────
    public Map<String, Object> getStats() {
        List<User>        allUsers    = userRepository.findAll();
        List<Parking>     allParkings = parkingRepository.findAllWithOwnerAndSlots();
        List<Booking>     allBookings = bookingRepository.findAllWithDetails();
        List<ParkingSlot> allSlots    = slotRepository.findAll();
        List<Payment>     allPayments = paymentRepository.findAllWithDetails();

        int totalUsers     = (int) allUsers.stream().filter(u -> u.getRole() == Role.USER).count();
        int totalOwners    = (int) allUsers.stream().filter(u -> u.getRole() == Role.OWNER).count();
        int activeBookings = (int) allBookings.stream().filter(b -> b.getStatus() == BookingStatus.ACTIVE).count();

        double totalRevenue = allPayments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.SUCCESS)
                .mapToDouble(Payment::getAmount).sum();

        if (totalRevenue == 0.0) {
            totalRevenue = allBookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                    .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0).sum();
        }

        int available   = (int) allSlots.stream().filter(s -> s.getStatus() == SlotStatus.AVAILABLE   && !s.getDisabled()).count();
        int occupied    = (int) allSlots.stream().filter(s -> s.getStatus() == SlotStatus.OCCUPIED    && !s.getDisabled()).count();
        int reserved    = (int) allSlots.stream().filter(s -> s.getStatus() == SlotStatus.RESERVED    && !s.getDisabled()).count();
        int maintenance = (int) allSlots.stream().filter(s -> s.getStatus() == SlotStatus.MAINTENANCE && !s.getDisabled()).count();
        int disabled    = (int) allSlots.stream().filter(ParkingSlot::getDisabled).count();

        int totalSlots = allSlots.size();
        double occupancyRate = totalSlots > 0 ? ((double) (occupied + reserved) / totalSlots) * 100.0 : 0.0;

        // Recent Bookings (top 10)
        List<BookingResponse> recentBookings = allBookings.stream()
                .limit(10).map(this::mapBooking).collect(Collectors.toList());

        // Top Parkings
        List<AdminStatsResponse.ParkingSummary> topParkings = allParkings.stream()
                .map(p -> {
                    List<Booking> pb = allBookings.stream()
                            .filter(b -> b.getParking() != null && b.getParking().getId().equals(p.getId())).collect(Collectors.toList());
                    int occ = (int)(p.getSlots() != null
                            ? p.getSlots().stream().filter(s -> s.getStatus() == SlotStatus.OCCUPIED).count() : 0);
                    double rev = pb.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                            .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0).sum();

                    AdminStatsResponse.ParkingSummary s = new AdminStatsResponse.ParkingSummary();
                    s.setId(p.getId()); s.setName(p.getName()); s.setLocation(p.getLocation());
                    s.setOwnerName(p.getOwner() != null ? p.getOwner().getName() : "Owner");
                    s.setTotalSlots(p.getSlots() != null ? p.getSlots().size() : 0);
                    s.setOccupied(occ); s.setBookingCount(pb.size()); s.setRevenue(rev);
                    return s;
                })
                .sorted(Comparator.comparingInt(AdminStatsResponse.ParkingSummary::getBookingCount).reversed())
                .limit(5).collect(Collectors.toList());

        // Attention Required Items (optimized with in-memory active slot set)
        List<Map<String, Object>> attentionItems = getAttentionRequiredList(allParkings, allSlots, allUsers, allBookings);

        // Recent Activities
        List<Map<String, Object>> recentActivities = getRecentActivitiesList(allBookings, allPayments, allUsers);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("totalUsers",        totalUsers);
        res.put("totalOwners",       totalOwners);
        res.put("totalParkings",     allParkings.size());
        res.put("totalSlots",        totalSlots);
        res.put("activeBookings",    activeBookings);
        res.put("totalBookings",     allBookings.size());
        res.put("totalRevenue",      totalRevenue);
        res.put("occupancyRate",     Math.round(occupancyRate * 10.0) / 10.0);
        res.put("availableSlots",    available);
        res.put("occupiedSlots",     occupied);
        res.put("reservedSlots",     reserved);
        res.put("maintenanceSlots",  maintenance);
        res.put("disabledSlots",     disabled);
        res.put("recentBookings",    recentBookings);
        res.put("topParkings",       topParkings);
        res.put("attentionRequired", attentionItems);
        res.put("recentActivities",  recentActivities);

        return res;
    }

    // ── Attention Required calculations ──────────────────────────────────────
    private List<Map<String, Object>> getAttentionRequiredList(List<Parking> allParkings,
                                                               List<ParkingSlot> allSlots,
                                                               List<User> allUsers,
                                                               List<Booking> allBookings) {
        List<Map<String, Object>> list = new ArrayList<>();

        // 1. High Occupancy Parkings (>= 80%)
        for (Parking p : allParkings) {
            List<ParkingSlot> slots = p.getSlots() != null ? p.getSlots() : List.of();
            if (!slots.isEmpty()) {
                long occ = slots.stream().filter(s -> s.getStatus() == SlotStatus.OCCUPIED || s.getStatus() == SlotStatus.RESERVED).count();
                double rate = ((double) occ / slots.size()) * 100.0;
                if (rate >= 80.0) {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", "high-occ-" + p.getId());
                    m.put("severity", rate >= 95.0 ? "CRITICAL" : "WARNING");
                    m.put("category", "Parking Capacity");
                    m.put("title", p.getName() + " nearing full capacity");
                    m.put("description", String.format("%d of %d slots occupied (%.0f%% capacity)", occ, slots.size(), rate));
                    m.put("actionUrl", "/admin/live-parking");
                    m.put("actionLabel", "View Parking");
                    list.add(m);
                }
            }
        }

        // 2. Ghost / Suspicious Slots (computed with preloaded bookings)
        List<Map<String, Object>> ghosts = computeGhostSlots(allSlots, allBookings);
        if (!ghosts.isEmpty()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", "ghost-slots-alert");
            m.put("severity", ghosts.size() > 5 ? "CRITICAL" : "WARNING");
            m.put("category", "Slot Anomalies");
            m.put("title", ghosts.size() + " suspicious ghost slot" + (ghosts.size() > 1 ? "s" : "") + " detected");
            m.put("description", "Slots marked occupied/reserved without active booking sessions.");
            m.put("actionUrl", "/admin/ghost-slots");
            m.put("actionLabel", "Review Slots");
            list.add(m);
        }

        // 3. Unpaid user penalties
        long penaltyUsers = allUsers.stream().filter(u -> u.getOutstanding() != null && u.getOutstanding() > 0.0).count();
        if (penaltyUsers > 0) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", "penalties-alert");
            m.put("severity", "WARNING");
            m.put("category", "Payments & Penalties");
            m.put("title", penaltyUsers + " user" + (penaltyUsers > 1 ? "s have" : " has") + " unpaid penalties");
            m.put("description", "Outstanding overtime fees pending settlement.");
            m.put("actionUrl", "/admin/users");
            m.put("actionLabel", "View Users");
            list.add(m);
        }

        // 4. Open Maintenance Issues
        long openMaintenance = maintenanceRepository.countByStatus(MaintenanceIssue.Status.OPEN);
        if (openMaintenance > 0) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", "maintenance-alert");
            m.put("severity", "WARNING");
            m.put("category", "Maintenance");
            m.put("title", openMaintenance + " open maintenance ticket" + (openMaintenance > 1 ? "s" : ""));
            m.put("description", "Slots or facilities reported for physical inspection/repair.");
            m.put("actionUrl", "/admin/maintenance");
            m.put("actionLabel", "View Tickets");
            list.add(m);
        }

        // 5. Pending Refund Requests
        long pendingRefunds = refundRequestRepository.countByStatus(RefundRequest.RefundStatus.PENDING);
        if (pendingRefunds > 0) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", "refunds-alert");
            m.put("severity", "CRITICAL");
            m.put("category", "Finance");
            m.put("title", pendingRefunds + " pending refund request" + (pendingRefunds > 1 ? "s" : ""));
            m.put("description", "Customer refund claims awaiting administrative review.");
            m.put("actionUrl", "/admin/refunds");
            m.put("actionLabel", "Review Refunds");
            list.add(m);
        }

        return list;
    }

    // ── Recent Activities Stream ─────────────────────────────────────────────
    private List<Map<String, Object>> getRecentActivitiesList(List<Booking> allBookings,
                                                              List<Payment> allPayments,
                                                              List<User> allUsers) {
        List<Map<String, Object>> activities = new ArrayList<>();

        // Add recent bookings
        allBookings.stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(10)
                .forEach(b -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", "act-b-" + b.getId());
                    m.put("type", "BOOKING");
                    m.put("actor", b.getUser() != null ? b.getUser().getName() : "Customer");
                    m.put("action", "Created booking (" + b.getStatus().name() + ")");
                    m.put("target", b.getParking().getName() + " [" + b.getSlot().getSlotCode() + "]");
                    m.put("amount", b.getAmount());
                    m.put("timestamp", b.getCreatedAt() != null ? b.getCreatedAt().toString() : null);
                    m.put("status", b.getStatus().name());
                    activities.add(m);
                });

        // Add recent payments
        allPayments.stream()
                .filter(p -> p.getCreatedAt() != null)
                .sorted(Comparator.comparing(Payment::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .forEach(p -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", "act-p-" + p.getId());
                    m.put("type", "PAYMENT");
                    m.put("actor", p.getBooking() != null && p.getBooking().getUser() != null ? p.getBooking().getUser().getName() : "User");
                    m.put("action", "Processed " + (p.getType() != null ? p.getType().name() : "PAYMENT") + " (₹" + p.getAmount() + ")");
                    m.put("target", p.getTransactionId() != null ? p.getTransactionId() : "Direct Payment");
                    m.put("amount", p.getAmount());
                    m.put("timestamp", p.getCreatedAt().toString());
                    m.put("status", p.getStatus().name());
                    activities.add(m);
                });

        // Add recent audit logs
        auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(5)
                .forEach(a -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", "act-a-" + a.getId());
                    m.put("type", "AUDIT");
                    m.put("actor", a.getAdminName() != null ? a.getAdminName() : "Admin");
                    m.put("action", a.getAction());
                    m.put("target", a.getTargetType() + " #" + a.getTargetId());
                    m.put("amount", null);
                    m.put("timestamp", a.getCreatedAt() != null ? a.getCreatedAt().toString() : null);
                    m.put("status", a.getStatus());
                    activities.add(m);
                });

        return activities.stream()
                .sorted((a, b) -> {
                    String ta = (String) a.get("timestamp");
                    String tb = (String) b.get("timestamp");
                    if (ta == null && tb == null) return 0;
                    if (ta == null) return 1;
                    if (tb == null) return -1;
                    return tb.compareTo(ta);
                })
                .limit(15)
                .collect(Collectors.toList());
    }

    // ── All users ─────────────────────────────────────────────────────────────
    public List<Map<String, Object>> getAllUsers() {
        List<Booking> allBookings = bookingRepository.findAll();
        return userRepository.findAll().stream().map(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",            u.getId());
            m.put("name",          u.getName());
            m.put("email",         u.getEmail());
            m.put("phone",         u.getPhone());
            m.put("role",          u.getRole().name());
            m.put("accountStatus", u.getAccountStatus() != null ? u.getAccountStatus().name() : "ACTIVE");
            m.put("outstanding",   u.getOutstanding() != null ? u.getOutstanding() : 0.0);
            m.put("warningCount",  u.getWarningCount() != null ? u.getWarningCount() : 0);
            m.put("createdAt",     u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);

            long bookings = allBookings.stream().filter(b -> b.getUser() != null && b.getUser().getId().equals(u.getId())).count();
            double totalSpent = allBookings.stream()
                    .filter(b -> b.getUser() != null && b.getUser().getId().equals(u.getId()) && b.getStatus() == BookingStatus.COMPLETED)
                    .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0).sum();

            m.put("totalBookings", bookings);
            m.put("totalSpent",    totalSpent);
            return m;
        }).collect(Collectors.toList());
    }

    // ── User Details ──────────────────────────────────────────────────────────
    public Map<String, Object> getUserDetails(Long userId) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        List<Booking> userBookings = bookingRepository.findByUser(u);
        List<Payment> userPayments = paymentRepository.findByBooking_User_IdOrderByCreatedAtDesc(userId);

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("id",            u.getId());
        details.put("name",          u.getName());
        details.put("email",         u.getEmail());
        details.put("phone",         u.getPhone());
        details.put("role",          u.getRole().name());
        details.put("accountStatus", u.getAccountStatus() != null ? u.getAccountStatus().name() : "ACTIVE");
        details.put("outstanding",   u.getOutstanding() != null ? u.getOutstanding() : 0.0);
        details.put("warningCount",  u.getWarningCount() != null ? u.getWarningCount() : 0);
        details.put("createdAt",     u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);

        details.put("totalBookings", userBookings.size());
        details.put("completedBookings", userBookings.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count());
        details.put("activeBookings", userBookings.stream().filter(b -> b.getStatus() == BookingStatus.ACTIVE).count());
        details.put("cancelledBookings", userBookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count());

        double totalSpent = userBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0).sum();
        details.put("totalSpent", totalSpent);

        details.put("recentBookings", userBookings.stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(10).map(this::mapBooking).collect(Collectors.toList()));

        details.put("recentPayments", userPayments.stream()
                .limit(10).map(this::mapPayment).collect(Collectors.toList()));

        return details;
    }

    // ── All parkings ──────────────────────────────────────────────────────────
    public List<Map<String, Object>> getAllParkings() {
        List<Booking> allBookings = bookingRepository.findAllWithDetails();
        return parkingRepository.findAllWithOwnerAndSlots().stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",          p.getId());
            m.put("name",        p.getName());
            m.put("location",    p.getLocation());
            m.put("description", p.getDescription());
            m.put("ownerName",   p.getOwner() != null ? p.getOwner().getName() : "Unknown");
            m.put("ownerEmail",  p.getOwner() != null ? p.getOwner().getEmail() : "");
            m.put("ownerId",     p.getOwner() != null ? p.getOwner().getId() : null);
            m.put("createdAt",   p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);

            List<ParkingSlot> slots = p.getSlots() != null ? p.getSlots() : List.of();
            int total       = slots.size();
            int occupied    = (int) slots.stream().filter(s -> s.getStatus() == SlotStatus.OCCUPIED).count();
            int reserved    = (int) slots.stream().filter(s -> s.getStatus() == SlotStatus.RESERVED).count();
            int available   = (int) slots.stream().filter(s -> s.getStatus() == SlotStatus.AVAILABLE && !s.getDisabled()).count();
            int maintenance = (int) slots.stream().filter(s -> s.getStatus() == SlotStatus.MAINTENANCE).count();
            int disabled    = (int) slots.stream().filter(ParkingSlot::getDisabled).count();

            m.put("totalSlots",       total);
            m.put("occupiedSlots",    occupied);
            m.put("reservedSlots",    reserved);
            m.put("availableSlots",   available);
            m.put("maintenanceSlots", maintenance);
            m.put("disabledSlots",    disabled);
            m.put("occupancyRate",    total > 0 ? (int) Math.round(((occupied + reserved) * 100.0) / total) : 0);

            long bookingCount = allBookings.stream().filter(b -> b.getParking() != null && b.getParking().getId().equals(p.getId())).count();
            double revenue    = allBookings.stream()
                    .filter(b -> b.getParking() != null && b.getParking().getId().equals(p.getId()) && b.getStatus() == BookingStatus.COMPLETED)
                    .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0).sum();
            m.put("bookingCount", bookingCount);
            m.put("revenue",      revenue);
            m.put("status",       disabled == total && total > 0 ? "SUSPENDED" : "ACTIVE");
            return m;
        }).collect(Collectors.toList());
    }

    // ── Parking Details ───────────────────────────────────────────────────────
    public Map<String, Object> getParkingDetails(Long parkingId) {
        Parking p = parkingRepository.findByIdWithOwnerAndSlots(parkingId)
                .orElseThrow(() -> new RuntimeException("Parking not found: " + parkingId));

        List<ParkingSlot> slots = p.getSlots() != null ? p.getSlots() : slotRepository.findByParking(p);
        List<Booking> bookings = bookingRepository.findByParkingWithDetails(p);

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("id",          p.getId());
        details.put("name",        p.getName());
        details.put("location",    p.getLocation());
        details.put("description", p.getDescription());
        details.put("ownerName",   p.getOwner() != null ? p.getOwner().getName() : "Unknown");
        details.put("ownerEmail",  p.getOwner() != null ? p.getOwner().getEmail() : "");
        details.put("ownerPhone",  p.getOwner() != null ? p.getOwner().getPhone() : "");
        details.put("createdAt",   p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);

        int total       = slots.size();
        int occupied    = (int) slots.stream().filter(s -> s.getStatus() == SlotStatus.OCCUPIED).count();
        int reserved    = (int) slots.stream().filter(s -> s.getStatus() == SlotStatus.RESERVED).count();
        int available   = (int) slots.stream().filter(s -> s.getStatus() == SlotStatus.AVAILABLE && !s.getDisabled()).count();
        int maintenance = (int) slots.stream().filter(s -> s.getStatus() == SlotStatus.MAINTENANCE).count();
        int disabled    = (int) slots.stream().filter(ParkingSlot::getDisabled).count();

        details.put("totalSlots",       total);
        details.put("occupiedSlots",    occupied);
        details.put("reservedSlots",    reserved);
        details.put("availableSlots",   available);
        details.put("maintenanceSlots", maintenance);
        details.put("disabledSlots",    disabled);
        details.put("occupancyRate",    total > 0 ? (int) Math.round(((occupied + reserved) * 100.0) / total) : 0);

        double totalRevenue = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0).sum();

        details.put("totalRevenue", totalRevenue);
        details.put("totalBookings", bookings.size());
        details.put("activeBookings", bookings.stream().filter(b -> b.getStatus() == BookingStatus.ACTIVE).count());

        List<Map<String, Object>> slotList = slots.stream().map(s -> {
            Map<String, Object> sm = new LinkedHashMap<>();
            sm.put("id",          s.getId());
            sm.put("slotCode",    s.getSlotCode());
            sm.put("status",      s.getStatus().name());
            sm.put("vehicleType", s.getVehicleType().name());
            sm.put("costPerHour", s.getCostPerHour());
            sm.put("disabled",    s.getDisabled());
            return sm;
        }).collect(Collectors.toList());

        details.put("slots", slotList);
        return details;
    }

    // ── All bookings ──────────────────────────────────────────────────────────
    public List<Map<String, Object>> getAllBookings() {
        return bookingRepository.findAllWithDetails().stream()
                .map(b -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",              b.getId());
                    m.put("userName",        b.getUser() != null ? b.getUser().getName() : "Unknown");
                    m.put("userEmail",       b.getUser() != null ? b.getUser().getEmail() : "");
                    m.put("userId",          b.getUser() != null ? b.getUser().getId() : null);
                    m.put("parkingName",     b.getParking() != null ? b.getParking().getName() : "Unknown");
                    m.put("parkingLocation", b.getParking() != null ? b.getParking().getLocation() : "");
                    m.put("parkingId",       b.getParking() != null ? b.getParking().getId() : null);
                    m.put("ownerName",       b.getParking() != null && b.getParking().getOwner() != null ? b.getParking().getOwner().getName() : "Unknown");
                    m.put("slotCode",        b.getSlot() != null ? b.getSlot().getSlotCode() : "");
                    m.put("slotId",          b.getSlot() != null ? b.getSlot().getId() : null);
                    m.put("vehicleNumber",   b.getVehicleNumber());
                    m.put("vehicleType",     b.getSlot() != null && b.getSlot().getVehicleType() != null ? b.getSlot().getVehicleType().name() : "CAR");
                    m.put("startTime",       b.getStartTime() != null ? b.getStartTime().toString() : null);
                    m.put("endTime",         b.getEndTime()   != null ? b.getEndTime().toString()   : null);
                    m.put("amount",          b.getAmount());
                    m.put("status",          b.getStatus().name());
                    m.put("createdAt",       b.getCreatedAt() != null ? b.getCreatedAt().toString() : null);
                    return m;
                }).collect(Collectors.toList());
    }

    // ── Revenue analytics ─────────────────────────────────────────────────────
    public Map<String, Object> getRevenueData() {
        List<Booking> allBookings = bookingRepository.findAllWithDetails();
        List<Booking> completed = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED).collect(Collectors.toList());

        List<Payment> allPayments = paymentRepository.findAllWithDetails();

        double totalRevenue = allPayments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.SUCCESS)
                .mapToDouble(Payment::getAmount).sum();

        if (totalRevenue == 0.0) {
            totalRevenue = completed.stream()
                    .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0).sum();
        }

        double platformCommission = totalRevenue * 0.15;
        double ownerEarnings      = totalRevenue * 0.85;

        // Revenue by parking
        Map<String, Double> byParking = completed.stream()
                .filter(b -> b.getParking() != null)
                .collect(Collectors.groupingBy(
                        b -> b.getParking().getName(),
                        Collectors.summingDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0)
                ));

        final double finalTot = totalRevenue;
        List<Map<String, Object>> revenueByParking = byParking.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("parking", e.getKey());
                    m.put("revenue", e.getValue());
                    double pct = finalTot > 0 ? (e.getValue() / finalTot) * 100 : 0;
                    m.put("percentage", Math.round(pct));
                    return m;
                }).collect(Collectors.toList());

        // Revenue by owner
        Map<String, Double> byOwner = completed.stream()
                .filter(b -> b.getParking() != null && b.getParking().getOwner() != null)
                .collect(Collectors.groupingBy(
                        b -> b.getParking().getOwner().getName(),
                        Collectors.summingDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0)
                ));

        List<Map<String, Object>> revenueByOwner = byOwner.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("owner", e.getKey());
                    m.put("revenue", e.getValue());
                    double pct = finalTot > 0 ? (e.getValue() / finalTot) * 100 : 0;
                    m.put("percentage", Math.round(pct));
                    return m;
                }).collect(Collectors.toList());

        // Revenue by vehicle type
        Map<String, Double> byVehicle = completed.stream()
                .filter(b -> b.getSlot() != null && b.getSlot().getVehicleType() != null)
                .collect(Collectors.groupingBy(
                        b -> b.getSlot().getVehicleType().name(),
                        Collectors.summingDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0)
                ));

        List<Map<String, Object>> revenueByVehicle = byVehicle.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("vehicleType", e.getKey());
                    m.put("revenue", e.getValue());
                    double pct = finalTot > 0 ? (e.getValue() / finalTot) * 100 : 0;
                    m.put("percentage", Math.round(pct));
                    return m;
                }).collect(Collectors.toList());

        // Transactions
        List<Map<String, Object>> transactions = getAllTransactions();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalRevenue",        totalRevenue);
        result.put("platformCommission",  platformCommission);
        result.put("ownerEarnings",       ownerEarnings);
        result.put("totalTransactions",   completed.size());
        result.put("averageBookingValue", completed.isEmpty() ? 0.0 : totalRevenue / completed.size());
        result.put("revenueByParking",    revenueByParking);
        result.put("revenueByOwner",      revenueByOwner);
        result.put("revenueByVehicle",    revenueByVehicle);
        result.put("transactions",        transactions);
        return result;
    }

    // ── All Transactions ─────────────────────────────────────────────────────
    public List<Map<String, Object>> getAllTransactions() {
        List<Payment> payments = paymentRepository.findAllWithDetails();
        if (!payments.isEmpty()) {
            return payments.stream()
                    .map(this::mapPayment)
                    .collect(Collectors.toList());
        }

        // Fallback to bookings if payments table is empty
        return bookingRepository.findAllWithDetails().stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .map(b -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",            b.getId());
                    m.put("transactionId", "TXN-" + b.getId() + "-" + (b.getCreatedAt() != null ? b.getCreatedAt().getNano() : "00"));
                    m.put("userName",      b.getUser() != null ? b.getUser().getName() : "Customer");
                    m.put("userEmail",     b.getUser() != null ? b.getUser().getEmail() : "");
                    m.put("parkingName",   b.getParking() != null ? b.getParking().getName() : "Parking");
                    m.put("slotCode",      b.getSlot() != null ? b.getSlot().getSlotCode() : "");
                    m.put("vehicleType",   b.getSlot() != null && b.getSlot().getVehicleType() != null ? b.getSlot().getVehicleType().name() : "CAR");
                    m.put("vehicleNumber", b.getVehicleNumber());
                    m.put("amount",        b.getAmount() != null ? b.getAmount() : 0.0);
                    m.put("method",        "UPI / Card");
                    m.put("type",          "BOOKING");
                    m.put("status",        "SUCCESS");
                    m.put("paidAt",        b.getEndTime() != null ? b.getEndTime().toString() : (b.getCreatedAt() != null ? b.getCreatedAt().toString() : null));
                    m.put("createdAt",     b.getCreatedAt() != null ? b.getCreatedAt().toString() : null);
                    return m;
                }).collect(Collectors.toList());
    }

    // ── Refunds ──────────────────────────────────────────────────────────────
    public List<Map<String, Object>> getRefunds() {
        List<RefundRequest> list = refundRequestRepository.findAllByOrderByCreatedAtDesc();
        return list.stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",          r.getId());
            m.put("bookingId",   r.getBooking() != null ? r.getBooking().getId() : null);
            m.put("userName",    r.getUser() != null ? r.getUser().getName() : "Customer");
            m.put("userEmail",   r.getUser() != null ? r.getUser().getEmail() : "");
            m.put("parkingName", r.getBooking() != null && r.getBooking().getParking() != null ? r.getBooking().getParking().getName() : "");
            m.put("amount",      r.getAmount());
            m.put("reason",      r.getReason());
            m.put("status",      r.getStatus().name());
            m.put("reviewedBy",  r.getReviewedBy());
            m.put("reviewedAt",  r.getReviewedAt() != null ? r.getReviewedAt().toString() : null);
            m.put("createdAt",   r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);
            return m;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void processRefund(Long refundId, String status, String adminName) {
        RefundRequest r = refundRequestRepository.findById(refundId)
                .orElseThrow(() -> new RuntimeException("Refund request not found"));
        r.setStatus(RefundRequest.RefundStatus.valueOf(status.toUpperCase()));
        r.setReviewedBy(adminName != null ? adminName : "Admin");
        r.setReviewedAt(LocalDateTime.now());
        refundRequestRepository.save(r);

        logAction(null, adminName, "PROCESS_REFUND", "REFUND", String.valueOf(refundId),
                "Refund request marked as " + status + " for ₹" + r.getAmount());
    }

    // ── Live Parking ──────────────────────────────────────────────────────────
    public List<Map<String, Object>> getLiveParking() {
        return parkingRepository.findAllWithOwnerAndSlots().stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",          p.getId());
            m.put("name",        p.getName());
            m.put("location",    p.getLocation());
            m.put("ownerName",   p.getOwner() != null ? p.getOwner().getName() : "Owner");

            List<ParkingSlot> slots = p.getSlots() != null ? p.getSlots() : List.of();
            int total       = slots.size();
            int available   = (int) slots.stream().filter(s -> s.getStatus() == SlotStatus.AVAILABLE && !s.getDisabled()).count();
            int occupied    = (int) slots.stream().filter(s -> s.getStatus() == SlotStatus.OCCUPIED).count();
            int reserved    = (int) slots.stream().filter(s -> s.getStatus() == SlotStatus.RESERVED).count();
            int maintenance = (int) slots.stream().filter(s -> s.getStatus() == SlotStatus.MAINTENANCE).count();
            int disabled    = (int) slots.stream().filter(ParkingSlot::getDisabled).count();

            m.put("totalSlots",       total);
            m.put("availableSlots",   available);
            m.put("occupiedSlots",    occupied);
            m.put("reservedSlots",    reserved);
            m.put("maintenanceSlots", maintenance);
            m.put("disabledSlots",    disabled);
            m.put("occupancyRate",    total > 0 ? (int) Math.round(((occupied + reserved) * 100.0) / total) : 0);
            m.put("status",           disabled == total && total > 0 ? "MAINTENANCE" : (available == 0 ? "FULL" : "OPERATIONAL"));

            List<Map<String, Object>> slotGrid = slots.stream().map(s -> {
                Map<String, Object> sm = new LinkedHashMap<>();
                sm.put("id",          s.getId());
                sm.put("code",        s.getSlotCode());
                sm.put("status",      s.getDisabled() ? "DISABLED" : s.getStatus().name());
                sm.put("vehicleType", s.getVehicleType().name());
                sm.put("cost",        s.getCostPerHour());
                return sm;
            }).collect(Collectors.toList());

            m.put("slots", slotGrid);
            return m;
        }).collect(Collectors.toList());
    }

    // ── Slot Health & Ghost Slots ─────────────────────────────────────────────
    public Map<String, Object> getSlotHealth() {
        List<ParkingSlot> allSlots = slotRepository.findAll();
        List<Booking> allBookings = bookingRepository.findAllWithDetails();
        List<Map<String, Object>> ghosts = computeGhostSlots(allSlots, allBookings);

        int total       = allSlots.size();
        int available   = (int) allSlots.stream().filter(s -> s.getStatus() == SlotStatus.AVAILABLE && !s.getDisabled()).count();
        int occupied    = (int) allSlots.stream().filter(s -> s.getStatus() == SlotStatus.OCCUPIED && !s.getDisabled()).count();
        int reserved    = (int) allSlots.stream().filter(s -> s.getStatus() == SlotStatus.RESERVED && !s.getDisabled()).count();
        int maintenance = (int) allSlots.stream().filter(s -> s.getStatus() == SlotStatus.MAINTENANCE).count();
        int disabled    = (int) allSlots.stream().filter(ParkingSlot::getDisabled).count();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalSlots",        total);
        result.put("availableSlots",    available);
        result.put("occupiedSlots",     occupied);
        result.put("reservedSlots",     reserved);
        result.put("maintenanceSlots",  maintenance);
        result.put("disabledSlots",     disabled);
        result.put("ghostSlotsCount",   ghosts.size());
        result.put("ghostSlots",        ghosts);
        result.put("healthySlotsRate",  total > 0 ? (int) Math.round(((total - ghosts.size() - maintenance - disabled) * 100.0) / total) : 100);

        return result;
    }

    public List<Map<String, Object>> getGhostSlots() {
        List<ParkingSlot> allSlots = slotRepository.findAll();
        List<Booking> allBookings = bookingRepository.findAllWithDetails();
        return computeGhostSlots(allSlots, allBookings);
    }

    private List<Map<String, Object>> computeGhostSlots(List<ParkingSlot> allSlots, List<Booking> allBookings) {
        List<ParkingSlot> stuck = allSlots.stream()
                .filter(s -> s.getStatus() == SlotStatus.OCCUPIED || s.getStatus() == SlotStatus.RESERVED)
                .collect(Collectors.toList());

        // Fast in-memory lookup set of active slot IDs
        Set<Long> activeSlotIds = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.ACTIVE && b.getSlot() != null)
                .map(b -> b.getSlot().getId())
                .collect(Collectors.toSet());

        // Latest booking per slot map
        Map<Long, Booking> latestBookingBySlot = new HashMap<>();
        for (Booking b : allBookings) {
            if (b.getSlot() != null) {
                Long slotId = b.getSlot().getId();
                Booking existing = latestBookingBySlot.get(slotId);
                if (existing == null || (b.getCreatedAt() != null && existing.getCreatedAt() != null && b.getCreatedAt().isAfter(existing.getCreatedAt()))) {
                    latestBookingBySlot.put(slotId, b);
                }
            }
        }

        List<Map<String, Object>> ghosts = new ArrayList<>();
        for (ParkingSlot slot : stuck) {
            if (!activeSlotIds.contains(slot.getId())) {
                Booking lastBooking = latestBookingBySlot.get(slot.getId());

                Map<String, Object> m = new LinkedHashMap<>();
                m.put("slotId",         slot.getId());
                m.put("slotCode",       slot.getSlotCode());
                m.put("status",         slot.getStatus().name());
                m.put("expectedStatus", "AVAILABLE");
                m.put("vehicleType",    slot.getVehicleType().name());
                m.put("parkingName",    slot.getParking() != null ? slot.getParking().getName() : "Unknown");
                m.put("parkingId",      slot.getParking() != null ? slot.getParking().getId() : null);
                m.put("costPerHour",    slot.getCostPerHour());
                m.put("anomalyScore",   92);
                m.put("reason",         "Slot marked " + slot.getStatus().name() + " but no ACTIVE booking exists.");
                m.put("lastBookingTime", lastBooking != null && lastBooking.getCreatedAt() != null ? lastBooking.getCreatedAt().toString() : null);
                ghosts.add(m);
            }
        }
        return ghosts;
    }

    // ── Maintenance ──────────────────────────────────────────────────────────
    public List<Map<String, Object>> getMaintenanceIssues() {
        return maintenanceRepository.findAllByOrderByCreatedAtDesc().stream().map(m -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id",          m.getId());
            map.put("parkingId",   m.getParking() != null ? m.getParking().getId() : null);
            map.put("parkingName", m.getParking() != null ? m.getParking().getName() : "Unknown");
            map.put("slotId",      m.getSlot() != null ? m.getSlot().getId() : null);
            map.put("slotCode",    m.getSlot() != null ? m.getSlot().getSlotCode() : "N/A");
            map.put("issue",       m.getIssue());
            map.put("reportedBy",  m.getReportedBy());
            map.put("priority",    m.getPriority().name());
            map.put("status",      m.getStatus().name());
            map.put("createdAt",   m.getCreatedAt() != null ? m.getCreatedAt().toString() : null);
            return map;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void createMaintenanceIssue(Long parkingId, Long slotId, String issue, String priority, String reportedBy) {
        Parking p = parkingRepository.findById(parkingId)
                .orElseThrow(() -> new RuntimeException("Parking not found"));
        ParkingSlot s = slotId != null ? slotRepository.findById(slotId).orElse(null) : null;

        MaintenanceIssue m = MaintenanceIssue.builder()
                .parking(p)
                .slot(s)
                .issue(issue)
                .priority(MaintenanceIssue.Priority.valueOf(priority.toUpperCase()))
                .status(MaintenanceIssue.Status.OPEN)
                .reportedBy(reportedBy != null ? reportedBy : "Admin")
                .build();
        maintenanceRepository.save(m);

        if (s != null) {
            s.setStatus(SlotStatus.MAINTENANCE);
            slotRepository.save(s);
        }

        logAction(null, reportedBy, "CREATE_MAINTENANCE", "MAINTENANCE", String.valueOf(m.getId()),
                "Filed maintenance ticket for " + p.getName() + (s != null ? " [" + s.getSlotCode() + "]" : ""));
    }

    @Transactional
    public void updateMaintenanceStatus(Long issueId, String status, String adminName) {
        MaintenanceIssue m = maintenanceRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Maintenance issue not found"));
        m.setStatus(MaintenanceIssue.Status.valueOf(status.toUpperCase()));
        maintenanceRepository.save(m);

        if (m.getStatus() == MaintenanceIssue.Status.RESOLVED && m.getSlot() != null) {
            m.getSlot().setStatus(SlotStatus.AVAILABLE);
            slotRepository.save(m.getSlot());
        }

        logAction(null, adminName, "UPDATE_MAINTENANCE", "MAINTENANCE", String.valueOf(issueId),
                "Updated maintenance issue #" + issueId + " to " + status);
    }

    // ── Deep Analytics ────────────────────────────────────────────────────────
    public Map<String, Object> getAnalyticsData(String range) {
        List<Booking> allBookings = bookingRepository.findAllWithDetails();
        List<User> allUsers = userRepository.findAll();
        List<Payment> allPayments = paymentRepository.findAllWithDetails();

        // Group bookings by hour of day for peak hours
        Map<Integer, Long> bookingsByHour = allBookings.stream()
                .filter(b -> b.getStartTime() != null)
                .collect(Collectors.groupingBy(b -> b.getStartTime().getHour(), Collectors.counting()));

        List<Map<String, Object>> peakHours = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            Map<String, Object> hm = new LinkedHashMap<>();
            hm.put("hour", String.format("%02d:00", h));
            hm.put("count", bookingsByHour.getOrDefault(h, 0L));
            peakHours.add(hm);
        }

        // Vehicle distribution
        Map<String, Long> vehicleDist = allBookings.stream()
                .filter(b -> b.getSlot() != null && b.getSlot().getVehicleType() != null)
                .collect(Collectors.groupingBy(b -> b.getSlot().getVehicleType().name(), Collectors.counting()));

        List<Map<String, Object>> vehicleDistribution = vehicleDist.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("type", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                }).collect(Collectors.toList());

        // Bookings & Revenue trends (last 7 days)
        LocalDateTime now = LocalDateTime.now();
        List<Map<String, Object>> timeline = new ArrayList<>();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM dd");

        for (int i = 6; i >= 0; i--) {
            LocalDateTime dayStart = now.minusDays(i).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime dayEnd   = now.minusDays(i).withHour(23).withMinute(59).withSecond(59);

            long count = allBookings.stream()
                    .filter(b -> b.getCreatedAt() != null && !b.getCreatedAt().isBefore(dayStart) && !b.getCreatedAt().isAfter(dayEnd))
                    .count();

            double rev = allBookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.COMPLETED && b.getCreatedAt() != null
                            && !b.getCreatedAt().isBefore(dayStart) && !b.getCreatedAt().isAfter(dayEnd))
                    .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0).sum();

            Map<String, Object> dm = new LinkedHashMap<>();
            dm.put("date", dayStart.format(dtf));
            dm.put("bookings", count);
            dm.put("revenue", rev);
            timeline.add(dm);
        }

        Map<String, Object> analytics = new LinkedHashMap<>();
        analytics.put("totalUsers",       allUsers.size());
        analytics.put("totalBookings",    allBookings.size());
        analytics.put("timeline",         timeline);
        analytics.put("peakHours",        peakHours);
        analytics.put("vehicleBreakdown", vehicleDistribution);

        return analytics;
    }

    // ── Audit Logs ────────────────────────────────────────────────────────────
    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public void logAction(Long adminId, String adminName, String action, String targetType, String targetId, String description) {
        AuditLog log = AuditLog.builder()
                .adminId(adminId)
                .adminName(adminName != null ? adminName : "Admin")
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .description(description)
                .status("SUCCESS")
                .build();
        auditLogRepository.save(log);
    }

    // ── Notifications ─────────────────────────────────────────────────────────
    public List<AdminNotification> getNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public void markNotificationRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllNotificationsRead() {
        List<AdminNotification> list = notificationRepository.findAll();
        list.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(list);
    }

    // ── Global Search ─────────────────────────────────────────────────────────
    public Map<String, Object> globalSearch(String q) {
        if (q == null || q.trim().isEmpty()) {
            return Map.of("users", List.of(), "parkings", List.of(), "bookings", List.of(), "transactions", List.of());
        }
        String query = q.trim().toLowerCase();

        List<Map<String, Object>> users = userRepository.findAll().stream()
                .filter(u -> (u.getName() != null && u.getName().toLowerCase().contains(query)) ||
                             (u.getEmail() != null && u.getEmail().toLowerCase().contains(query)) ||
                             (u.getPhone() != null && u.getPhone().contains(query)))
                .limit(5)
                .map(u -> Map.<String, Object>of("id", u.getId(), "title", u.getName(), "subtitle", u.getEmail() + " • " + u.getRole().name(), "url", "/admin/users"))
                .collect(Collectors.toList());

        List<Map<String, Object>> parkings = parkingRepository.findAll().stream()
                .filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(query)) ||
                             (p.getLocation() != null && p.getLocation().toLowerCase().contains(query)))
                .limit(5)
                .map(p -> Map.<String, Object>of("id", p.getId(), "title", p.getName(), "subtitle", p.getLocation(), "url", "/admin/parkings"))
                .collect(Collectors.toList());

        List<Map<String, Object>> bookings = bookingRepository.findAll().stream()
                .filter(b -> (b.getVehicleNumber() != null && b.getVehicleNumber().toLowerCase().contains(query)) ||
                             (b.getUser() != null && b.getUser().getName().toLowerCase().contains(query)) ||
                             (b.getParking() != null && b.getParking().getName().toLowerCase().contains(query)) ||
                             String.valueOf(b.getId()).contains(query))
                .limit(5)
                .map(b -> Map.<String, Object>of("id", b.getId(), "title", "Booking #" + b.getId() + " (" + b.getVehicleNumber() + ")", "subtitle", (b.getParking() != null ? b.getParking().getName() : "") + " • " + b.getStatus().name(), "url", "/admin/bookings"))
                .collect(Collectors.toList());

        List<Map<String, Object>> transactions = paymentRepository.findAll().stream()
                .filter(p -> (p.getTransactionId() != null && p.getTransactionId().toLowerCase().contains(query)) ||
                             String.valueOf(p.getId()).contains(query))
                .limit(5)
                .map(p -> Map.<String, Object>of("id", p.getId(), "title", p.getTransactionId() != null ? p.getTransactionId() : "Payment #" + p.getId(), "subtitle", "₹" + p.getAmount() + " • " + p.getStatus().name(), "url", "/admin/transactions"))
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("users",        users);
        result.put("parkings",     parkings);
        result.put("bookings",     bookings);
        result.put("transactions", transactions);
        return result;
    }

    // ── Update user status ────────────────────────────────────────────────────
    @Transactional
    public void updateUserStatus(Long userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            user.setAccountStatus(User.AccountStatus.valueOf(status));
            userRepository.save(user);

            logAction(null, "Admin", "UPDATE_USER_STATUS", "USER", String.valueOf(userId),
                    "Updated account status of " + user.getName() + " to " + status);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }
    }

    // ── Suspend / Delete parking ──────────────────────────────────────────────
    @Transactional
    public void suspendParking(Long parkingId, boolean suspend) {
        Parking parking = parkingRepository.findById(parkingId)
                .orElseThrow(() -> new RuntimeException("Parking not found"));
        List<ParkingSlot> slots = slotRepository.findByParking(parking);
        for (ParkingSlot s : slots) {
            s.setDisabled(suspend);
        }
        slotRepository.saveAll(slots);

        logAction(null, "Admin", suspend ? "SUSPEND_PARKING" : "ACTIVATE_PARKING", "PARKING", String.valueOf(parkingId),
                (suspend ? "Suspended" : "Activated") + " parking facility: " + parking.getName());
    }

    @Transactional
    public void deleteParking(Long parkingId) {
        Parking parking = parkingRepository.findById(parkingId)
                .orElseThrow(() -> new RuntimeException("Parking not found"));
        parkingRepository.delete(parking);

        logAction(null, "Admin", "DELETE_PARKING", "PARKING", String.valueOf(parkingId),
                "Deleted parking lot: " + parking.getName());
    }

    // ── Fix all ghost slots ───────────────────────────────────────────────────
    @Transactional
    public int fixAllGhostSlots() {
        List<ParkingSlot> stuck = slotRepository.findAll().stream()
                .filter(s -> s.getStatus() == SlotStatus.OCCUPIED || s.getStatus() == SlotStatus.RESERVED)
                .collect(Collectors.toList());
        int count = 0;
        for (ParkingSlot slot : stuck) {
            boolean hasActive = bookingRepository.findAll().stream()
                    .anyMatch(b -> b.getSlot().getId().equals(slot.getId())
                            && b.getStatus() == BookingStatus.ACTIVE);
            if (!hasActive) {
                slot.setStatus(SlotStatus.AVAILABLE);
                slotRepository.save(slot);
                count++;
            }
        }

        logAction(null, "Admin", "FIX_GHOST_SLOTS", "SYSTEM", "ALL",
                "Automated release of " + count + " ghost parking slots");
        return count;
    }

    @Transactional
    public void fixSingleGhostSlot(Long slotId) {
        ParkingSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found: " + slotId));
        slot.setStatus(SlotStatus.AVAILABLE);
        slotRepository.save(slot);

        logAction(null, "Admin", "FIX_SLOT", "SLOT", String.valueOf(slotId),
                "Released ghost slot " + slot.getSlotCode() + " to AVAILABLE");
    }

    // ── Private helpers ───────────────────────────────────────────────────────
    private BookingResponse mapBooking(Booking b) {
        BookingResponse r = new BookingResponse();
        r.setId(b.getId());
        r.setParkingId(b.getParking() != null ? b.getParking().getId() : null);
        r.setParkingName(b.getParking() != null ? b.getParking().getName() : "Unknown");
        r.setParkingLocation(b.getParking() != null ? b.getParking().getLocation() : "");
        r.setSlotId(b.getSlot() != null ? b.getSlot().getId() : null);
        r.setSlotCode(b.getSlot() != null ? b.getSlot().getSlotCode() : "");
        r.setVehicleType(b.getSlot() != null && b.getSlot().getVehicleType() != null ? b.getSlot().getVehicleType().name() : "CAR");
        r.setUserId(b.getUser() != null ? b.getUser().getId() : null);
        r.setUserName(b.getUser() != null ? b.getUser().getName() : "Customer");
        r.setVehicleNumber(b.getVehicleNumber());
        r.setStartTime(b.getStartTime() != null ? b.getStartTime().toString() : null);
        r.setEndTime(b.getEndTime()     != null ? b.getEndTime().toString()   : null);
        r.setAmount(b.getAmount());
        r.setStatus(b.getStatus().name());
        r.setCreatedAt(b.getCreatedAt() != null ? b.getCreatedAt().toString() : null);
        return r;
    }

    private Map<String, Object> mapPayment(Payment p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",            p.getId());
        m.put("transactionId", p.getTransactionId() != null ? p.getTransactionId() : "PE-TXN-" + p.getId());
        m.put("bookingId",     p.getBooking() != null ? p.getBooking().getId() : null);
        m.put("userName",      p.getBooking() != null && p.getBooking().getUser() != null ? p.getBooking().getUser().getName() : "User");
        m.put("userEmail",     p.getBooking() != null && p.getBooking().getUser() != null ? p.getBooking().getUser().getEmail() : "");
        m.put("parkingName",   p.getBooking() != null && p.getBooking().getParking() != null ? p.getBooking().getParking().getName() : "Parking");
        m.put("slotCode",      p.getBooking() != null && p.getBooking().getSlot() != null ? p.getBooking().getSlot().getSlotCode() : "");
        m.put("amount",        p.getAmount());
        m.put("method",        p.getMethod() != null ? p.getMethod().name() : "UPI");
        m.put("type",          p.getType() != null ? p.getType().name() : "BOOKING");
        m.put("status",        p.getStatus().name());
        m.put("paidAt",        p.getPaidAt() != null ? p.getPaidAt().toString() : null);
        m.put("createdAt",     p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);
        return m;
    }
}