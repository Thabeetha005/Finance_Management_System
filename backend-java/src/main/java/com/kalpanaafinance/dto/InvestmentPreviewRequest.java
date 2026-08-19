package com.kalpanaafinance.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestmentPreviewRequest {

    @NotNull(message = "Plan ID is required")
    private Long planId;

    @NotNull(message = "Invested amount is required")
    @DecimalMin(value = "1.00", message = "Investment amount must be greater than 0")
    private BigDecimal investedAmount;

    @NotNull(message = "Duration in months is required")
    private Integer durationMonths;
}
