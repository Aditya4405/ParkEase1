package com.demo.parkease.service;

import com.demo.parkease.dto.AdminStatsResponse;
import com.demo.parkease.dto.BookingResponse;
import com.demo.parkease.entity.*;
import com.demo.parkease.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final UserRepository        userRepository;
    private final ParkingRepository     parkingRepository;
    private final ParkingSlotRepository slotRepository;
    private final BookingRepository     bookingRepository;

    public AdminDashboardService(UserRepository userRepository,
                                 ParkingRepository parkingRepository,
                                 ParkingSlotRepository slotRepository,
                                 BookingRepository bookingRepository) {
        this.userRepository    = userRepository;
        this.parkingRepository = parkingRepository;
        this.slotRepository    = slotRepository;
        this.bookingRepository = bookingRepository;
    }

    // ── Overview stats ────────────────────────────────────────────────────────
    public AdminStatsResponse getStats() {
        List<User>        allUsers    = userRepository.findAll();
        List<Parking>     allParkings = parkingRepository.findAllWithSlots();
        List<Booking>     allBookings = bookingRepository.findAll();
        List<ParkingSlot> allSlots    = slotRepository.findAll();

        int totalUsers    = (int) allUsers.stream().filter(u -> u.getRole() == Role.USER).count();
        int totalOwners   = (int) allUsers.stream().filter(u -> u.getRole() == Role.OWNER).count();
        int activeBookings = (int) allBookings.stream().filter(b -> b.getStatus() == BookingStatus.ACTIVE).count();

        double totalRevenue = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0).sum();

        int available   = (int) allSlots.stream().filter(s -> s.getStatus() == SlotStatus.AVAILABLE   && !s.getDisabled()).count();
        int occupied    = (int) allSlots.stream().filter(s -> s.getStatus() == SlotStatus.OCCUPIED    && !s.getDisabled()).count();
        int reserved    = (int) allSlots.stream().filter(s -> s.getStatus() == SlotStatus.RESERVED    && !s.getDisabled()).count();
        int maintenance = (int) allSlots.stream().filter(s -> s.getStatus() == SlotStatus.MAINTENANCE && !s.getDisabled()).count();
        int disabled    = (int) allSlots.stream().filter(ParkingSlot::getDisabled).count();

        List<BookingResponse> recentBookings = allBookings.stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(10).map(this::mapBooking).collect(Collectors.toList());

        List<AdminStatsResponse.ParkingSummary> topParkings = allParkings.stream()
                .map(p -> {
                    List<Booking> pb = allBookings.stream()
                            .filter(b -> b.getParking().getId().equals(p.getId())).collect(Collectors.toList());
                    int occ = (int)(p.getSlots() != null
                            ? p.getSlots().stream().filter(s -> s.getStatus() == SlotStatus.OCCUPIED).count() : 0);
                    double rev = pb.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                            .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0).sum();

                    AdminStatsResponse.ParkingSummary s = new AdminStatsResponse.ParkingSummary();
                    s.setId(p.getId()); s.setName(p.getName()); s.setLocation(p.getLocation());
                    s.setOwnerName(p.getOwner().getName());
                    s.setTotalSlots(p.getSlots() != null ? p.getSlots().size() : 0);
                    s.setOccupied(occ); s.setBookingCount(pb.size()); s.setRevenue(rev);
                    return s;
                })
                .sorted(Comparator.comparingInt(AdminStatsResponse.ParkingSummary::getBookingCount).reversed())
                .limit(5).collect(Collectors.toList());

        AdminStatsResponse res = new AdminStatsResponse();
        res.setTotalUsers(totalUsers); res.setTotalOwners(totalOwners);
        res.setTotalParkings(allParkings.size()); res.setTotalSlots(allSlots.size());
        res.setActiveBookings(activeBookings); res.setTotalBookings(allBookings.size());
        res.setTotalRevenue(totalRevenue);
        res.setAvailableSlots(available); res.setOccupiedSlots(occupied);
        res.setReservedSlots(reserved); res.setMaintenanceSlots(maintenance);
        res.setDisabledSlots(disabled);
        res.setRecentBookings(recentBookings); res.setTopParkings(topParkings);
        return res;
    }

    // ── All users ─────────────────────────────────────────────────────────────
    public List<Map<String, Object>> getAllUsers() {
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
            // booking count
            long bookings = bookingRepository.findByUser(u).size();
            m.put("totalBookings", bookings);
            return m;
        }).collect(Collectors.toList());
    }

    // ── All parkings ──────────────────────────────────────────────────────────
    public List<Map<String, Object>> getAllParkings() {
        List<Booking> allBookings = bookingRepository.findAll();
        return parkingRepository.findAllWithSlots().stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",          p.getId());
            m.put("name",        p.getName());
            m.put("location",    p.getLocation());
            m.put("description", p.getDescription());
            m.put("ownerName",   p.getOwner().getName());
            m.put("ownerEmail",  p.getOwner().getEmail());
            m.put("ownerId",     p.getOwner().getId());
            m.put("createdAt",   p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);

            List<ParkingSlot> slots = p.getSlots() != null ? p.getSlots() : List.of();
            int total    = slots.size();
            int occupied = (int) slots.stream().filter(s -> s.getStatus() == SlotStatus.OCCUPIED).count();
            int avail    = (int) slots.stream().filter(s -> s.getStatus() == SlotStatus.AVAILABLE && !s.getDisabled()).count();
            m.put("totalSlots",    total);
            m.put("occupiedSlots", occupied);
            m.put("availableSlots",avail);
            m.put("occupancyRate", total > 0 ? (int)Math.round((occupied * 100.0) / total) : 0);

            long bookingCount = allBookings.stream().filter(b -> b.getParking().getId().equals(p.getId())).count();
            double revenue    = allBookings.stream()
                    .filter(b -> b.getParking().getId().equals(p.getId()) && b.getStatus() == BookingStatus.COMPLETED)
                    .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0).sum();
            m.put("bookingCount", bookingCount);
            m.put("revenue",      revenue);
            return m;
        }).collect(Collectors.toList());
    }

    // ── All bookings ──────────────────────────────────────────────────────────
    public List<Map<String, Object>> getAllBookings() {
        return bookingRepository.findAll().stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(b -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",            b.getId());
                    m.put("userName",      b.getUser().getName());
                    m.put("userEmail",     b.getUser().getEmail());
                    m.put("userId",        b.getUser().getId());
                    m.put("parkingName",   b.getParking().getName());
                    m.put("parkingLocation", b.getParking().getLocation());
                    m.put("parkingId",     b.getParking().getId());
                    m.put("slotCode",      b.getSlot().getSlotCode());
                    m.put("vehicleNumber", b.getVehicleNumber());
                    m.put("vehicleType",   b.getSlot().getVehicleType().name());
                    m.put("startTime",     b.getStartTime() != null ? b.getStartTime().toString() : null);
                    m.put("endTime",       b.getEndTime()   != null ? b.getEndTime().toString()   : null);
                    m.put("amount",        b.getAmount());
                    m.put("status",        b.getStatus().name());
                    m.put("createdAt",     b.getCreatedAt() != null ? b.getCreatedAt().toString() : null);
                    return m;
                }).collect(Collectors.toList());
    }

    // ── Revenue breakdown ─────────────────────────────────────────────────────
    public Map<String, Object> getRevenueData() {
        List<Booking> completed = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED).collect(Collectors.toList());

        double totalRevenue = completed.stream()
                .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0).sum();

        // Revenue by parking
        Map<String, Double> byParking = completed.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getParking().getName(),
                        Collectors.summingDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0)
                ));

        List<Map<String, Object>> revenueByParking = byParking.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("parking", e.getKey());
                    m.put("revenue", e.getValue());
                    double pct = totalRevenue > 0 ? (e.getValue() / totalRevenue) * 100 : 0;
                    m.put("percentage", Math.round(pct));
                    return m;
                }).collect(Collectors.toList());

        // Revenue by vehicle type
        Map<String, Double> byVehicle = completed.stream()
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
                    double pct = totalRevenue > 0 ? (e.getValue() / totalRevenue) * 100 : 0;
                    m.put("percentage", Math.round(pct));
                    return m;
                }).collect(Collectors.toList());

        // Recent 20 transactions
        List<Map<String, Object>> transactions = completed.stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(20)
                .map(b -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("bookingId",     b.getId());
                    m.put("userName",      b.getUser().getName());
                    m.put("parkingName",   b.getParking().getName());
                    m.put("slotCode",      b.getSlot().getSlotCode());
                    m.put("vehicleType",   b.getSlot().getVehicleType().name());
                    m.put("vehicleNumber", b.getVehicleNumber());
                    m.put("amount",        b.getAmount());
                    m.put("startTime",     b.getStartTime() != null ? b.getStartTime().toString() : null);
                    m.put("endTime",       b.getEndTime()   != null ? b.getEndTime().toString()   : null);
                    return m;
                }).collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalRevenue",     totalRevenue);
        result.put("totalTransactions",completed.size());
        result.put("revenueByParking", revenueByParking);
        result.put("revenueByVehicle", revenueByVehicle);
        result.put("transactions",     transactions);
        return result;
    }

    // ── Ghost slots ───────────────────────────────────────────────────────────
    // Slots marked OCCUPIED/RESERVED but their booking is COMPLETED/CANCELLED
    public List<Map<String, Object>> getGhostSlots() {
        List<ParkingSlot> stuck = slotRepository.findAll().stream()
                .filter(s -> s.getStatus() == SlotStatus.OCCUPIED || s.getStatus() == SlotStatus.RESERVED)
                .collect(Collectors.toList());

        List<Map<String, Object>> ghosts = new ArrayList<>();
        for (ParkingSlot slot : stuck) {
            // Check if any ACTIVE booking holds this slot
            boolean hasActiveBooking = bookingRepository.findAll().stream()
                    .anyMatch(b -> b.getSlot().getId().equals(slot.getId())
                            && b.getStatus() == BookingStatus.ACTIVE);
            if (!hasActiveBooking) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("slotId",      slot.getId());
                m.put("slotCode",    slot.getSlotCode());
                m.put("status",      slot.getStatus().name());
                m.put("vehicleType", slot.getVehicleType().name());
                m.put("parkingName", slot.getParking().getName());
                m.put("parkingId",   slot.getParking().getId());
                m.put("costPerHour", slot.getCostPerHour());
                ghosts.add(m);
            }
        }
        return ghosts;
    }

    // ── Update user status ────────────────────────────────────────────────────
    @Transactional
    public void updateUserStatus(Long userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            user.setAccountStatus(User.AccountStatus.valueOf(status));
            userRepository.save(user);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }
    }

    // ── Delete parking ────────────────────────────────────────────────────────
    @Transactional
    public void deleteParking(Long parkingId) {
        Parking parking = parkingRepository.findById(parkingId)
                .orElseThrow(() -> new RuntimeException("Parking not found"));
        parkingRepository.delete(parking);
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
        return count;
    }

    // ── Private helper ────────────────────────────────────────────────────────
    private BookingResponse mapBooking(Booking b) {
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
        r.setStartTime(b.getStartTime() != null ? b.getStartTime().toString() : null);
        r.setEndTime(b.getEndTime()     != null ? b.getEndTime().toString()   : null);
        r.setAmount(b.getAmount());
        r.setStatus(b.getStatus().name());
        r.setCreatedAt(b.getCreatedAt() != null ? b.getCreatedAt().toString() : null);
        return r;
    }
}