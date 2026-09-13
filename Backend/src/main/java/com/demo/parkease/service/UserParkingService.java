package com.demo.parkease.service;

import com.demo.parkease.dto.UserParkingResponse;
import com.demo.parkease.entity.Parking;
import com.demo.parkease.entity.ParkingSlot;
import com.demo.parkease.entity.SlotStatus;
import com.demo.parkease.repository.ParkingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)   // ← FIXES LazyInitializationException
// keeps session open while slots are mapped
public class UserParkingService {

    private final ParkingRepository parkingRepository;

    private static final Map<String, String> VEHICLE_LABELS = Map.of(
            "CAR",   "Car",
            "BIKE",  "Bike",
            "LARGE", "Large",
            "SMALL", "Small"
    );

    public UserParkingService(ParkingRepository parkingRepository) {
        this.parkingRepository = parkingRepository;
    }

    // ✅ GET ALL PARKINGS — UserDashboard.jsx browse list
    // Uses JOIN FETCH to load slots in one SQL query — no lazy load needed
    public List<UserParkingResponse> getAllParkings() {
        return parkingRepository.findAllWithSlots()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ✅ GET SINGLE PARKING WITH SLOTS — ParkingSlots.jsx slot grid
    public UserParkingResponse getParkingById(Long parkingId) {
        Parking parking = parkingRepository.findByIdWithSlots(parkingId)
                .orElseThrow(() -> new RuntimeException("Parking not found"));
        return mapToResponse(parking);
    }

    // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────

    private UserParkingResponse mapToResponse(Parking parking) {

        List<ParkingSlot> slots = parking.getSlots() != null
                ? parking.getSlots() : List.of();

        int availableSlots = (int) slots.stream()
                .filter(s -> s.getStatus() == SlotStatus.AVAILABLE && !s.getDisabled())
                .count();

        int occupiedSlots = (int) slots.stream()
                .filter(s -> s.getStatus() == SlotStatus.OCCUPIED && !s.getDisabled())
                .count();

        List<String> vehicleTypes = slots.stream()
                .map(s -> s.getVehicleType().name())
                .distinct()
                .collect(Collectors.toList());

        Double minCost = slots.stream()
                .filter(s -> !s.getDisabled())
                .mapToDouble(ParkingSlot::getCostPerHour)
                .min().orElse(0.0);

        Double maxCost = slots.stream()
                .filter(s -> !s.getDisabled())
                .mapToDouble(ParkingSlot::getCostPerHour)
                .max().orElse(0.0);

        List<UserParkingResponse.UserSlotResponse> slotResponses = slots.stream()
                .map(this::mapSlotToResponse)
                .collect(Collectors.toList());

        UserParkingResponse response = new UserParkingResponse();
        response.setId(parking.getId());
        response.setName(parking.getName());
        response.setLocation(parking.getLocation());
        response.setDescription(parking.getDescription());
        response.setTotalSlots(slots.size());
        response.setAvailableSlots(availableSlots);
        response.setOccupiedSlots(occupiedSlots);
        response.setVehicleTypes(vehicleTypes);
        response.setMinCostPerHour(minCost);
        response.setMaxCostPerHour(maxCost);
        response.setSlots(slotResponses);
        return response;
    }

    private UserParkingResponse.UserSlotResponse mapSlotToResponse(ParkingSlot slot) {
        UserParkingResponse.UserSlotResponse r = new UserParkingResponse.UserSlotResponse();
        r.setId(slot.getId());
        r.setSlotCode(slot.getSlotCode());
        r.setVehicleType(slot.getVehicleType().name());
        r.setVehicleTypeLabel(
                VEHICLE_LABELS.getOrDefault(slot.getVehicleType().name(), slot.getVehicleType().name())
        );
        r.setCostPerHour(slot.getCostPerHour());
        r.setStatus(slot.getStatus().name());
        r.setDisabled(slot.getDisabled());
        r.setBookable(slot.getStatus() == SlotStatus.AVAILABLE && !slot.getDisabled());
        return r;
    }
}