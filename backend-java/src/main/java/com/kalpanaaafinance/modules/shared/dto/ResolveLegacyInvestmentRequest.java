package com.kalpanaaafinance.modules.shared.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
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
public class ResolveLegacyInvestmentRequest {

    @NotNull(message = "Plan ID is required")
    private Long planId;

    @NotNull(message = "Duration in months is required")
    @Min(value = 1, message = "Duration must be at least 1 month")
    private Integer durationMonths;

    @NotNull(message = "Locked rate is required")
    @DecimalMin(value = "0.01", message = "Locked rate must be greater than 0")
    private BigDecimal lockedRate;

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "Maturity date is required")
    private LocalDateTime maturityDate;

    public Long getPlanId() { return this.planId; }
    public Integer getDurationMonths() { return this.durationMonths; }
    public BigDecimal getLockedRate() { return this.lockedRate; }
    public LocalDateTime getStartDate() { return this.startDate; }
    public LocalDateTime getMaturityDate() { return this.maturityDate; }
}
