package com.kalpanaafinance.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawalEligibilityResponse {
    private Boolean isCustomerVerified;
    private Boolean isBankAccountVerified;
    private Boolean isWithdrawalUnlocked;
    private BigDecimal totalWalletBalance;
    private BigDecimal pendingWithdrawalAmount;
    private BigDecimal availableToWithdraw;
    private BigDecimal minWithdrawalLimit;
    private BigDecimal maxTxnLimit;
    private BigDecimal dailyLimit;
    private BigDecimal dailyWithdrawnToday;
    private BigDecimal dailyLimitRemaining;
    private List<BankAccountSnapshotDTO> verifiedBankAccounts;
    private List<String> lockReasons;
}
