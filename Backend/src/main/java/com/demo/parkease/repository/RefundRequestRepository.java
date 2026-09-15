package com.demo.parkease.repository;

import com.demo.parkease.entity.RefundRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefundRequestRepository extends JpaRepository<RefundRequest, Long> {
    List<RefundRequest> findAllByOrderByCreatedAtDesc();
    long countByStatus(RefundRequest.RefundStatus status);
}
