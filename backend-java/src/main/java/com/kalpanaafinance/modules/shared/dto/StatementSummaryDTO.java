package com.kalpanaafinance.modules.shared.dto;

import com.kalpanaafinance.modules.shared.entity.Transaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatementSummaryDTO {
    private String statementReference; // STMT-20260819-8F42C1
    private Long userId;
    private String customerName;
    private String customerId;
    private String maskedEmail;
    private LocalDate fromDate;
    private LocalDate toDate;
    private LocalDateTime generatedAt;
    
    private BigDecimal openingBalance;
    private BigDecimal totalCredits;
    private BigDecimal totalDebits;
    private BigDecimal closingBalance;

    private List<Transaction> transactions;
    private boolean reconciled;
}
