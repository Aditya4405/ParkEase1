package com.demo.parkease.service;

import com.demo.parkease.dto.ParkingSlotResponse;
import com.demo.parkease.dto.SlotPriceRequest;
import com.demo.parkease.dto.SlotStatusRequest;
import com.demo.parkease.entity.ParkingSlot;
import com.demo.parkease.entity.SlotStatus;
import com.demo.parkease.repository.ParkingSlotRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class SlotService {

    private final ParkingSlotRepository parkingSlotRepository;

    private static final Map<String, String> VEHICLE_LABELS = Map.of(
            "CAR", "Car",
            "BIKE", "Bike",
            "LARGE", "Large",
            "SMALL", "Small"
    );

    public SlotService(ParkingSlotRepository parkingSlotRepository) {
        this.parkingSlotRepository = parkingSlotRepository;
    }

    // ✅ CHANGE SLOT STATUS
    public ParkingSlotResponse updateSlotStatus(Long slotId,
                                                SlotStatusRequest request,
                                                Long ownerId) {

        ParkingSlot slot = getSlotAndVerifyOwner(slotId, ownerId);

        if (slot.getDisabled()) {
            throw new RuntimeException(
                    "Slot is disabled. Enable it first before changing status."
            );
        }

        try {
            SlotStatus newStatus = SlotStatus.valueOf(request.getStatus());
            slot.setStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + request.getStatus());
        }

        parkingSlotRepository.save(slot);
        return mapToResponse(slot);
    }

    // ✅ UPDATE SLOT PRICE
    public ParkingSlotResponse updateSlotPrice(Long slotId,
                                               SlotPriceRequest request,
                                               Long ownerId) {

        ParkingSlot slot = getSlotAndVerifyOwner(slotId, ownerId);

        if (request.getCostPerHour() == null || request.getCostPerHour() <= 0) {
            throw new RuntimeException("Cost per hour must be greater than 0");
        }

        slot.setCostPerHour(request.getCostPerHour());
        parkingSlotRepository.save(slot);
        return mapToResponse(slot);
    }

    // ✅ TOGGLE ENABLE / DISABLE SLOT
    public ParkingSlotResponse toggleSlotDisabled(Long slotId, Long ownerId) {

        ParkingSlot slot = getSlotAndVerifyOwner(slotId, ownerId);

        boolean nowDisabled = !slot.getDisabled();
        slot.setDisabled(nowDisabled);

        // If disabling → force status to MAINTENANCE
        // If enabling  → reset status to AVAILABLE
        if (nowDisabled) {
            slot.setStatus(SlotStatus.MAINTENANCE);
        } else {
            slot.setStatus(SlotStatus.AVAILABLE);
        }

        parkingSlotRepository.save(slot);
        return mapToResponse(slot);
    }

    // ✅ GET SINGLE SLOT
    public ParkingSlotResponse getSlotById(Long slotId, Long ownerId) {
        ParkingSlot slot = getSlotAndVerifyOwner(slotId, ownerId);
        return mapToResponse(slot);
    }

    // ─── PRIVATE HELPERS ────────────────────────────────────────────

    // Find slot and verify it belongs to this owner
    private ParkingSlot getSlotAndVerifyOwner(Long slotId, Long ownerId) {
        ParkingSlot slot = parkingSlotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        // Check the slot's parking belongs to this owner
        if (!slot.getParking().getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Access denied");
        }

        return slot;
    }

    // Map entity → response DTO
    private ParkingSlotResponse mapToResponse(ParkingSlot slot) {
        ParkingSlotResponse r = new ParkingSlotResponse();
        r.setId(slot.getId());
        r.setSlotCode(slot.getSlotCode());
        r.setVehicleType(slot.getVehicleType().name());
        r.setVehicleTypeLabel(
                VEHICLE_LABELS.getOrDefault(
                        slot.getVehicleType().name(),
                        slot.getVehicleType().name()
                )
        );
        r.setCostPerHour(slot.getCostPerHour());
        r.setStatus(slot.getStatus().name());
        r.setDisabled(slot.getDisabled());
        return r;
    }
}