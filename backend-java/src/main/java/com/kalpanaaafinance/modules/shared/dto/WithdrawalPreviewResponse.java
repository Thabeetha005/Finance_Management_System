package com.kalpanaaafinance.modules.shared.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawalPreviewResponse {
    private BigDecimal totalWalletBalance;
    private BigDecimal pendingWithdrawalAmount;
    private BigDecimal availableToWithdraw;
    private BigDecimal requestedAmount;
    private BigDecimal remainingBalancePreview;
    private BigDecimal dailyLimit;
    private BigDecimal dailyWithdrawnToday;
    private BigDecimal dailyLimitRemaining;
    private Boolean isEligible;
    private List<String> rejectionReasons;
    private BankAccountSnapshotDTO bankAccount;
}
