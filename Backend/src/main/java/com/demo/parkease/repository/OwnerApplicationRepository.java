package com.demo.parkease.repository;

import com.demo.parkease.entity.ApplicationStatus;
import com.demo.parkease.entity.OwnerApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OwnerApplicationRepository extends JpaRepository<OwnerApplication, Long> {

    /** Find all applications for a given applicant user ID */
    List<OwnerApplication> findByApplicantIdOrderBySubmittedAtDesc(Long applicantId);

    /** Find the most recent application for a given applicant */
    Optional<OwnerApplication> findTopByApplicantIdOrderBySubmittedAtDesc(Long applicantId);

    /** Find by application reference (e.g. PE-000042) */
    Optional<OwnerApplication> findByApplicationRef(String applicationRef);

    /** Find all by status */
    List<OwnerApplication> findByApplicationStatusOrderBySubmittedAtDesc(ApplicationStatus status);

    /** Find all ordered newest first */
    @Query("SELECT a FROM OwnerApplication a " +
           "LEFT JOIN FETCH a.applicant " +
           "LEFT JOIN FETCH a.reviewedBy " +
           "ORDER BY a.submittedAt DESC")
    List<OwnerApplication> findAllWithDetails();

    /** Find by ID with all relations */
    @Query("SELECT a FROM OwnerApplication a " +
           "LEFT JOIN FETCH a.applicant " +
           "LEFT JOIN FETCH a.reviewedBy " +
           "LEFT JOIN FETCH a.documents " +
           "WHERE a.id = :id")
    Optional<OwnerApplication> findByIdWithDetails(@Param("id") Long id);

    /** Check if applicant already has a PENDING application */
    boolean existsByApplicantIdAndApplicationStatus(Long applicantId, ApplicationStatus status);

    /** Count by status */
    long countByApplicationStatus(ApplicationStatus status);
}
