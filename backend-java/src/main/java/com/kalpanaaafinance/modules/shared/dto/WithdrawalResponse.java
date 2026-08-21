package com.kalpanaaafinance.modules.shared.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawalResponse {
    private Long id;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private Long bankAccountId;
    private String accountHolderName;
    private String bankName;
    private String accountNumberMasked;
    private String ifscCode;
    private BigDecimal amount;
    private String status;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private String referenceNumber;
    private String rejectionReason;
    private Long adminId;
    private LocalDateTime requestedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime processedAt;
    private LocalDateTime completedAt;
    private LocalDateTime rejectedAt;
}
