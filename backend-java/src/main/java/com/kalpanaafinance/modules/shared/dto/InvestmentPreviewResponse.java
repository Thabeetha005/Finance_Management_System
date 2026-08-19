package com.kalpanaafinance.modules.shared.dto;

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
public class InvestmentPreviewResponse {
    private Long planId;
    private String planName;
    private BigDecimal investedAmount;
    private Integer durationMonths;
    private BigDecimal returnRate;
    private BigDecimal estimatedProfit;
    private BigDecimal maturityValue;
    private LocalDateTime startDate;
    private LocalDateTime maturityDate;
    private BigDecimal currentWalletBalance;
    private Boolean isVariable;
}
