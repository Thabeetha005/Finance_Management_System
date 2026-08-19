package com.kalpanaafinance.modules.shared.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletSummaryResponse {
    private BigDecimal availableWalletBalance;
    private BigDecimal bonusBalance;
    private BigDecimal depositBalance;
    private BigDecimal withdrawableBalance;
    private BigDecimal pendingWithdrawalAmount;
    private BigDecimal totalInvestedAmount;
    private BigDecimal totalPortfolioValue;
    private BigDecimal totalLoanOutstanding;
    private BigDecimal totalProfit;

    public static WalletSummaryResponseBuilder builder() {
        return new WalletSummaryResponseBuilder();
    }
}
