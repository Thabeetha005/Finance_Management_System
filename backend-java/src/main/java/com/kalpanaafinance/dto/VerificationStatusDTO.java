package com.kalpanaafinance.dto;

import lombok.*;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationStatusDTO {
    private Boolean isCustomerVerified;
    private Boolean isBankVerified;
    private String overallStatus; // VERIFIED, NOT_SUBMITTED, UNDER_REVIEW, RESUBMISSION_REQUIRED
    private String panStatus;
    private String aadhaarStatus;
    private String bankAccountStatus;
    private String rejectionReason;
    private List<String> pendingActions;

    public Boolean getIsCustomerVerified() { return isCustomerVerified; }
    public void setIsCustomerVerified(Boolean isCustomerVerified) { this.isCustomerVerified = isCustomerVerified; }

    public Boolean getIsBankVerified() { return isBankVerified; }
    public void setIsBankVerified(Boolean isBankVerified) { this.isBankVerified = isBankVerified; }

    public String getOverallStatus() { return overallStatus; }
    public void setOverallStatus(String overallStatus) { this.overallStatus = overallStatus; }

    public String getPanStatus() { return panStatus; }
    public void setPanStatus(String panStatus) { this.panStatus = panStatus; }

    public String getAadhaarStatus() { return aadhaarStatus; }
    public void setAadhaarStatus(String aadhaarStatus) { this.aadhaarStatus = aadhaarStatus; }

    public String getBankAccountStatus() { return bankAccountStatus; }
    public void setBankAccountStatus(String bankAccountStatus) { this.bankAccountStatus = bankAccountStatus; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public List<String> getPendingActions() { return pendingActions; }
    public void setPendingActions(List<String> pendingActions) { this.pendingActions = pendingActions; }
}
