package com.kalpanaaafinance.modules.shared.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawalRequest {

    @NotNull(message = "Withdrawal amount is required")
    @DecimalMin(value = "500.00", message = "Minimum withdrawal amount is ₹500.00")
    private BigDecimal amount;

    @NotNull(message = "Destination Bank Account ID is required")
    private Long bankAccountId;
}
