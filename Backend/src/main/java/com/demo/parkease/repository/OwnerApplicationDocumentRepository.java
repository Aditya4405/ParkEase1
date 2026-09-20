package com.demo.parkease.repository;

import com.demo.parkease.entity.OwnerApplicationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OwnerApplicationDocumentRepository extends JpaRepository<OwnerApplicationDocument, Long> {

    List<OwnerApplicationDocument> findByApplicationId(Long applicationId);
}
