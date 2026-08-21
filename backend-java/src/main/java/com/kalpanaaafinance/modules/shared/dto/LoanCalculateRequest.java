package com.kalpanaaafinance.modules.shared.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanCalculateRequest {
    private Long planId;
    private BigDecimal amount;
    private Integer durationMonths;
}
