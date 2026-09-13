package com.demo.parkease.repository;

import com.demo.parkease.entity.ParkingSlot;
import com.demo.parkease.entity.SlotStatus;
import com.demo.parkease.entity.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {

    // Used by UserParkingService — get all slots for a parking
    List<ParkingSlot> findByParking_Id(Long parkingId);

    // Used by ParkingService.addSlot() — count existing slots of same type
    // so the new slot code is correctly numbered (e.g. CAR-03 if 2 exist)
    // matches ParkingService call: parkingSlotRepository.countByParkingIdAndVehicleType(...)
    long countByParkingIdAndVehicleType(Long parkingId, VehicleType vehicleType);

    // Used by AdminDashboardService — slot health overview
    List<ParkingSlot> findByStatus(SlotStatus status);

    // Used by BookingExpiryScheduler — find reserved slots to release
    List<ParkingSlot> findByParking_IdAndStatus(Long parkingId, SlotStatus status);
}