package com.kalpanaafinance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestmentPlanDTO {

    private Long id;
    private String name;
    private String description;
    private Boolean isVariable;
    private BigDecimal variableRate;
    private Boolean isActive;
    private List<InvestmentPlanRateDTO> rates;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InvestmentPlanRateDTO {
        private Long id;
        private Integer durationMonths;
        private BigDecimal returnRate;
    }
}
