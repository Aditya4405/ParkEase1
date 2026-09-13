package com.demo.parkease.service;

import com.demo.parkease.dto.CreateParkingRequest;
import com.demo.parkease.dto.CreateSlotRequest;
import com.demo.parkease.dto.ParkingResponse;
import com.demo.parkease.dto.ParkingSlotResponse;
import com.demo.parkease.entity.*;
import com.demo.parkease.repository.ParkingRepository;
import com.demo.parkease.repository.ParkingSlotRepository;
import com.demo.parkease.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional   // ← keeps Hibernate session open for all methods
public class ParkingService {

    private final ParkingRepository     parkingRepository;
    private final UserRepository        userRepository;
    private final ParkingSlotRepository parkingSlotRepository;

    private static final Map<String, String> VEHICLE_LABELS = Map.of(
            "CAR",   "Car",
            "BIKE",  "Bike",
            "LARGE", "Large",
            "SMALL", "Small"
    );

    private static final Map<String, String> SLOT_PREFIXES = Map.of(
            "CAR",   "CAR",
            "BIKE",  "BIKE",
            "LARGE", "LRG",
            "SMALL", "SML"
    );

    public ParkingService(ParkingRepository parkingRepository,
                          UserRepository userRepository,
                          ParkingSlotRepository parkingSlotRepository) {
        this.parkingRepository     = parkingRepository;
        this.userRepository        = userRepository;
        this.parkingSlotRepository = parkingSlotRepository;
    }

    // ✅ CREATE PARKING
    public ParkingResponse createParking(CreateParkingRequest request, Long ownerId) {

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        Parking parking = new Parking();
        parking.setName(request.getName());
        parking.setLocation(request.getLocation());
        parking.setDescription(request.getDescription());
        parking.setOwner(owner);

        List<ParkingSlot> slots = new ArrayList<>();
        for (CreateParkingRequest.SlotConfig config : request.getSlotConfigs()) {
            String prefix      = SLOT_PREFIXES.getOrDefault(config.getVehicleType(), config.getVehicleType());
            VehicleType vType  = VehicleType.valueOf(config.getVehicleType());
            for (int i = 1; i <= config.getNumberOfSlots(); i++) {
                ParkingSlot slot = new ParkingSlot();
                slot.setSlotCode(prefix + "-" + String.format("%02d", i));
                slot.setVehicleType(vType);
                slot.setCostPerHour(config.getCostPerHour());
                slot.setStatus(SlotStatus.AVAILABLE);
                slot.setDisabled(false);
                slot.setParking(parking);
                slots.add(slot);
            }
        }
        parking.setSlots(slots);

        // @Transactional keeps session open — CascadeAll saves slots too
        Parking saved = parkingRepository.save(parking);
        return mapToResponse(saved);
    }

    // ✅ GET ALL OWNER PARKINGS — uses JOIN FETCH to avoid LazyInitializationException
    public List<ParkingResponse> getOwnerParkings(Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        return parkingRepository.findByOwnerWithSlots(owner)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ✅ GET SINGLE PARKING — uses JOIN FETCH
    public ParkingResponse getParkingById(Long parkingId, Long ownerId) {
        Parking parking = parkingRepository.findByIdWithSlots(parkingId)
                .orElseThrow(() -> new RuntimeException("Parking not found"));

        if (!parking.getOwner().getId().equals(ownerId))
            throw new RuntimeException("Access denied");

        return mapToResponse(parking);
    }

    // ✅ ADD SLOT to existing parking
    public ParkingSlotResponse addSlot(Long parkingId, CreateSlotRequest request, Long ownerId) {
        Parking parking = parkingRepository.findById(parkingId)
                .orElseThrow(() -> new RuntimeException("Parking not found"));

        if (!parking.getOwner().getId().equals(ownerId))
            throw new RuntimeException("Access denied");

        long count = parkingSlotRepository.countByParkingIdAndVehicleType(
                parkingId, VehicleType.valueOf(request.getVehicleType()));

        String prefix = SLOT_PREFIXES.getOrDefault(request.getVehicleType(), request.getVehicleType());

        ParkingSlot slot = new ParkingSlot();
        slot.setParking(parking);
        slot.setVehicleType(VehicleType.valueOf(request.getVehicleType()));
        slot.setCostPerHour(request.getCostPerHour());
        slot.setStatus(SlotStatus.AVAILABLE);
        slot.setDisabled(false);
        slot.setSlotCode(prefix + "-" + String.format("%02d", count + 1));

        return mapSlotToResponse(parkingSlotRepository.save(slot));
    }

    // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────

    private ParkingResponse mapToResponse(Parking parking) {
        List<ParkingSlot> slots = parking.getSlots() != null
                ? parking.getSlots() : new ArrayList<>();

        int totalSlots    = slots.size();
        int occupied      = (int) slots.stream()
                .filter(s -> s.getStatus() == SlotStatus.OCCUPIED && !s.getDisabled()).count();
        int occupancyRate = totalSlots > 0
                ? (int) Math.round((occupied * 100.0) / totalSlots) : 0;

        List<ParkingSlotResponse> slotResponses = slots.stream()
                .map(this::mapSlotToResponse)
                .collect(Collectors.toList());

        ParkingResponse response = new ParkingResponse();
        response.setId(parking.getId());
        response.setName(parking.getName());
        response.setLocation(parking.getLocation());
        response.setDescription(parking.getDescription());
        response.setTotalSlots(totalSlots);
        response.setOccupied(occupied);
        response.setOccupancyRate(occupancyRate);
        response.setCreatedAt(parking.getCreatedAt() != null
                ? parking.getCreatedAt().toString() : null);
        response.setSlots(slotResponses);
        return response;
    }

    private ParkingSlotResponse mapSlotToResponse(ParkingSlot slot) {
        ParkingSlotResponse r = new ParkingSlotResponse();
        r.setId(slot.getId());
        r.setSlotCode(slot.getSlotCode());
        r.setVehicleType(slot.getVehicleType().name());
        r.setVehicleTypeLabel(
                VEHICLE_LABELS.getOrDefault(slot.getVehicleType().name(), slot.getVehicleType().name()));
        r.setCostPerHour(slot.getCostPerHour());
        r.setStatus(slot.getStatus().name());
        r.setDisabled(slot.getDisabled());
        return r;
    }
}
