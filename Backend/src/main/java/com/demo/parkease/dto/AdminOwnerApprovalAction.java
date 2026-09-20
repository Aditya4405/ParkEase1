package com.demo.parkease.dto;

import lombok.Data;

/** Admin action DTO for approval or rejection */
@Data
public class AdminOwnerApprovalAction {

    /** Reason for rejection — required when action = REJECT */
    private String rejectionReason;

    /** Optional admin notes */
    private String adminNotes;
}
