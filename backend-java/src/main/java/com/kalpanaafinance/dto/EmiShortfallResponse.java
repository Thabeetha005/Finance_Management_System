package com.kalpanaafinance.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmiShortfallResponse {
    private String message;
    private BigDecimal requiredAmount;
    private BigDecimal availableBalance;
    private BigDecimal shortfall;
}
