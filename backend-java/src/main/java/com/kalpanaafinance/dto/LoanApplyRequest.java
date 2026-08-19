package com.kalpanaafinance.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanApplyRequest {
    private Long planId;
    private BigDecimal amount;
    private Integer durationMonths;
    private String purpose;
}
