package com.kalpanaafinance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvestmentRequest {
    private String type;
    private java.math.BigDecimal investedAmount;
}
