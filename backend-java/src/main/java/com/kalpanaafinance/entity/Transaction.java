package com.kalpanaafinance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions", indexes = {
    @Index(name = "idx_tx_user_date", columnList = "user_id, date"),
    @Index(name = "idx_tx_user_type", columnList = "user_id, type"),
    @Index(name = "idx_tx_user_status", columnList = "user_id, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = true)
    private Account account;

    @Column(precision = 19, scale = 2, nullable = false)
    private BigDecimal amount;
    
    @Column(precision = 19, scale = 2)
    private BigDecimal balanceBefore;
    
    @Column(precision = 19, scale = 2)
    private BigDecimal balanceAfter;
    
    @Column(precision = 19, scale = 2)
    private BigDecimal withdrawableBalanceBefore;

    @Column(precision = 19, scale = 2)
    private BigDecimal withdrawableBalanceAfter;

    @Column(name = "withdrawal_eligible")
    @Builder.Default
    private Boolean withdrawalEligible = true;

    @Column(length = 50)
    private String type; // BONUS, DEPOSIT, WITHDRAWAL, INVESTMENT_PURCHASE, LOAN_DISBURSEMENT, EMI_PAYMENT, REFUND, OTHER_CREDIT, OTHER_DEBIT
    
    @Column(length = 50, nullable = false)
    @Builder.Default
    private String status = "COMPLETED"; // COMPLETED, PENDING, REJECTED, FAILED

    @Column(name = "reference_entity", length = 255)
    private String referenceEntity; // e.g. "LOAN", "INVESTMENT", "EMI", "WITHDRAWAL", "DEPOSIT", "BONUS"

    @Column(name = "reference_id")
    private Long referenceId;

    private LocalDateTime date;

    @Column(length = 255)
    private String description;

    public Long getId() { return this.id; }
    public Long getUserId() { return this.userId; }
    public Account getAccount() { return this.account; }
    public LocalDateTime getDate() { return this.date; }
    public String getType() { return this.type; }
    public String getDescription() { return this.description; }
    public BigDecimal getAmount() { return this.amount; }
    public BigDecimal getBalanceBefore() { return this.balanceBefore; }
    public BigDecimal getBalanceAfter() { return this.balanceAfter; }
    public BigDecimal getWithdrawableBalanceBefore() { return this.withdrawableBalanceBefore; }
    public BigDecimal getWithdrawableBalanceAfter() { return this.withdrawableBalanceAfter; }
    public Boolean getWithdrawalEligible() { return this.withdrawalEligible; }
    public String getStatus() { return this.status; }
    public String getReferenceEntity() { return this.referenceEntity; }
    public Long getReferenceId() { return this.referenceId; }

    public void setId(Long id) { this.id = id; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setAccount(Account account) { this.account = account; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setBalanceBefore(BigDecimal balanceBefore) { this.balanceBefore = balanceBefore; }
    public void setBalanceAfter(BigDecimal balanceAfter) { this.balanceAfter = balanceAfter; }
    public void setWithdrawableBalanceBefore(BigDecimal withdrawableBalanceBefore) { this.withdrawableBalanceBefore = withdrawableBalanceBefore; }
    public void setWithdrawableBalanceAfter(BigDecimal withdrawableBalanceAfter) { this.withdrawableBalanceAfter = withdrawableBalanceAfter; }
    public void setWithdrawalEligible(Boolean withdrawalEligible) { this.withdrawalEligible = withdrawalEligible; }
    public void setType(String type) { this.type = type; }
    public void setStatus(String status) { this.status = status; }
    public void setReferenceEntity(String referenceEntity) { this.referenceEntity = referenceEntity; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public void setDescription(String description) { this.description = description; }
}
