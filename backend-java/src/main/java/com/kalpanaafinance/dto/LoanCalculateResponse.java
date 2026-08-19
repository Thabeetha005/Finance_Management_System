package com.kalpanaafinance.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanCalculateResponse {
    private Long planId;
    private String planName;
    private BigDecimal requestedAmount;
    private Integer durationMonths;
    private BigDecimal annualInterestRate;
    private BigDecimal estimatedMonthlyEmi;
    private BigDecimal estimatedTotalInterest;
    private BigDecimal estimatedTotalRepayment;
    private LocalDate firstEmiDate;
    private LocalDate finalEmiDate;
}
