package com.demo.parkease.service;

import com.demo.parkease.dto.OwnerStatsResponse;
import com.demo.parkease.entity.*;
import com.demo.parkease.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)   // ← keeps session open so slots can be accessed
public class DashboardService {

    private final ParkingRepository     parkingRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final BookingRepository     bookingRepository;
    private final UserRepository        userRepository;

    public DashboardService(ParkingRepository parkingRepository,
                            ParkingSlotRepository parkingSlotRepository,
                            BookingRepository bookingRepository,
                            UserRepository userRepository) {
        this.parkingRepository     = parkingRepository;
        this.parkingSlotRepository = parkingSlotRepository;
        this.bookingRepository     = bookingRepository;
        this.userRepository        = userRepository;
    }

    public OwnerStatsResponse getOwnerStats(Long ownerId, Long parkingId) {

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        // JOIN FETCH ensures slots are loaded in one query — no lazy load needed
        List<Parking> parkings = parkingRepository.findByOwnerWithSlots(owner);
        if (parkingId != null) {
            parkings = parkings.stream().filter(p -> p.getId().equals(parkingId)).toList();
        }

        List<Booking> allBookings = parkings.isEmpty() ?
                java.util.Collections.emptyList() :
                bookingRepository.findByParkingIn(parkings);

        List<ParkingSlot> allSlots = parkings.stream()
                .flatMap(p -> p.getSlots().stream())
                .toList();

        int totalParkings  = parkings.size();
        int totalSlots     = allSlots.size();

        int availableSlots = (int) allSlots.stream()
                .filter(s -> s.getStatus() == SlotStatus.AVAILABLE && !s.getDisabled()).count();

        int occupiedSlots  = (int) allSlots.stream()
                .filter(s -> s.getStatus() == SlotStatus.OCCUPIED && !s.getDisabled()).count();

        int disabledSlots  = (int) allSlots.stream()
                .filter(ParkingSlot::getDisabled).count();

        int activeBookings = (int) allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.ACTIVE).count();

        int totalBookings  = allBookings.size();

        double totalRevenue = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0)
                .sum();

        OwnerStatsResponse stats = new OwnerStatsResponse();
        stats.setTotalParkings(totalParkings);
        stats.setTotalSlots(totalSlots);
        stats.setAvailableSlots(availableSlots);
        stats.setOccupiedSlots(occupiedSlots);
        stats.setDisabledSlots(disabledSlots);
        stats.setActiveBookings(activeBookings);
        stats.setTotalBookings(totalBookings);
        stats.setTotalRevenue(totalRevenue);
        return stats;
    }

    public Map<String, Object> getOwnerRevenueData(Long ownerId, Long parkingId) {

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        List<Parking> parkings = parkingRepository.findByOwnerWithSlots(owner);
        if (parkingId != null) {
            parkings = parkings.stream().filter(p -> p.getId().equals(parkingId)).toList();
        }
        List<Booking> completed = parkings.isEmpty() ?
                java.util.Collections.emptyList() :
                bookingRepository.findByParkingIn(parkings).stream()
                        .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                        .toList();

        double totalRevenue = completed.stream()
                .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0)
                .sum();

        LocalDate today = LocalDate.now();
        double todayRevenue = completed.stream()
                .filter(b -> b.getEndTime() != null && b.getEndTime().toLocalDate().equals(today))
                .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0)
                .sum();

        List<Map<String, Object>> revenueByParking = completed.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getParking().getName(),
                        Collectors.summingDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0)
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("parking", e.getKey());
                    m.put("revenue", e.getValue());
                    m.put("percentage", totalRevenue > 0 ? Math.round((e.getValue() / totalRevenue) * 100) : 0);
                    return m;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> revenueByVehicle = completed.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getSlot().getVehicleType().name(),
                        Collectors.summingDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0)
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("vehicleType", e.getKey());
                    m.put("revenue", e.getValue());
                    m.put("percentage", totalRevenue > 0 ? Math.round((e.getValue() / totalRevenue) * 100) : 0);
                    return m;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> dailyRevenue = completed.stream()
                .filter(b -> b.getEndTime() != null)
                .collect(Collectors.groupingBy(
                        b -> b.getEndTime().toLocalDate(),
                        Collectors.summingDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0)
                ))
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("date", e.getKey().toString());
                    m.put("day", e.getKey().getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
                    m.put("amount", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> transactions = completed.stream()
                .sorted(Comparator.comparing(Booking::getEndTime, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(b -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("bookingId", b.getId());
                    m.put("userName", b.getUser().getName());
                    m.put("parkingName", b.getParking().getName());
                    m.put("slotCode", b.getSlot().getSlotCode());
                    m.put("vehicleType", b.getSlot().getVehicleType().name());
                    m.put("vehicleNumber", b.getVehicleNumber());
                    m.put("amount", b.getAmount() != null ? b.getAmount() : 0.0);
                    m.put("startTime", b.getStartTime() != null ? b.getStartTime().toString() : null);
                    m.put("endTime", b.getEndTime() != null ? b.getEndTime().toString() : null);
                    m.put("date", b.getEndTime() != null ? b.getEndTime().toLocalDate().toString() : null);
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalRevenue", totalRevenue);
        result.put("todayRevenue", todayRevenue);
        result.put("totalTransactions", completed.size());
        result.put("revenueByParking", revenueByParking);
        result.put("revenueByVehicle", revenueByVehicle);
        result.put("dailyRevenue", dailyRevenue);
        result.put("transactions", transactions);
        return result;
    }
}
