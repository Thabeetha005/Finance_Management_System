package com.kalpanaaafinance.modules.shared.dto;

import lombok.*;
import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepositCreateRequest {
    private BigDecimal amount;
    private String paymentMethod; // UPI, DEBIT_CARD, NET_BANKING

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
