package com.kalpanaafinance.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletTransactionResponse {
    private Long id;
    private Long userId;
    private LocalDateTime date;
    private String type;
    private String description;
    private BigDecimal amount;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private BigDecimal withdrawableBalanceBefore;
    private BigDecimal withdrawableBalanceAfter;
    private Boolean withdrawalEligible;
    private String status;
    private String referenceEntity;
    private Long referenceId;

    public static WalletTransactionResponseBuilder builder() {
        return new WalletTransactionResponseBuilder();
    }
}
