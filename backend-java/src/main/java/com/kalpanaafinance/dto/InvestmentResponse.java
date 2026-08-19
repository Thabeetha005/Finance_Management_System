package com.kalpanaafinance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvestmentResponse {
    private Long id;
    private String userName;
    private String userEmail;
    private String type;
    private java.math.BigDecimal investedAmount;
    private java.math.BigDecimal currentValue;
    private String status;
    private LocalDateTime createdAt;
}
