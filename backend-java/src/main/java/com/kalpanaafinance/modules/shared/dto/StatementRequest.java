package com.kalpanaafinance.modules.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatementRequest {
    private String period; // LAST_30_DAYS, LAST_3_MONTHS, LAST_6_MONTHS, CURRENT_FY, PREVIOUS_FY, CUSTOM
    private LocalDate fromDate;
    private LocalDate toDate;
    private String transactionType; // ALL, DEPOSIT, WITHDRAWAL, INVESTMENT, LOAN_DISBURSEMENT, EMI_PAYMENT, WALLET_TRANSFER
    private String format; // PDF, CSV
}
