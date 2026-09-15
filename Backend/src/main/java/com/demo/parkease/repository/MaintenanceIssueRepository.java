package com.demo.parkease.repository;

import com.demo.parkease.entity.MaintenanceIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceIssueRepository extends JpaRepository<MaintenanceIssue, Long> {
    List<MaintenanceIssue> findAllByOrderByCreatedAtDesc();
    long countByStatus(MaintenanceIssue.Status status);
}
