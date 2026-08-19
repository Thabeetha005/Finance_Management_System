package com.kalpanaafinance.dto;

import lombok.Data;

@Data
public class SupportTicketRequest {
    private String category;
    private String subject;
    private String description;
    private String priority;
    private Long transactionId;
    private Long loanId;
    private Long investmentId;
    private Long paymentId;
}
