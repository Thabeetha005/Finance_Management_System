package com.kalpanaafinance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestmentDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long planId;
    private String planName;
    private String type;
    private Integer durationMonths;
    private BigDecimal investedAmount;
    private BigDecimal lockedRate;
    private BigDecimal estimatedProfit;
    private BigDecimal maturityValue;
    private BigDecimal currentValue;
    private LocalDateTime startDate;
    private LocalDateTime maturityDate;
    private LocalDateTime redeemedAt;
    private Boolean legacyUnverified;
    private String status; // ACTIVE, MATURED, REDEEMED (computed)
    private LocalDateTime createdAt;
}
