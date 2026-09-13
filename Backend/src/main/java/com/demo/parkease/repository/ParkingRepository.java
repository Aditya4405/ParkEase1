package com.demo.parkease.repository;

import com.demo.parkease.entity.Parking;
import com.demo.parkease.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingRepository extends JpaRepository<Parking, Long> {

    // ── JOIN FETCH versions — eagerly loads slots in ONE SQL query ────────────
    // Fixes: LazyInitializationException on Parking.slots outside a transaction

    @Query("SELECT DISTINCT p FROM Parking p LEFT JOIN FETCH p.slots WHERE p.owner = :owner")
    List<Parking> findByOwnerWithSlots(@Param("owner") User owner);

    @Query("SELECT DISTINCT p FROM Parking p LEFT JOIN FETCH p.slots")
    List<Parking> findAllWithSlots();

    @Query("SELECT DISTINCT p FROM Parking p LEFT JOIN FETCH p.slots WHERE p.id = :id")
    Optional<Parking> findByIdWithSlots(@Param("id") Long id);

    // ── Plain versions (kept for services that don't need slots) ─────────────
    List<Parking> findByOwner(User owner);

    List<Parking> findByOwner_Id(Long ownerId);
}