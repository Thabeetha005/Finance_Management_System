package com.kalpanaafinance.modules.shared.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanEmiDTO {
    private Long id;
    private Long loanId;
    private Integer installmentNumber;
    private String monthYear;
    private BigDecimal amount;
    private LocalDate dueDate;
    private String status; // UPCOMING, PENDING, PAID, OVERDUE
    private LocalDateTime paidDate;
    private Long transactionId;
}
