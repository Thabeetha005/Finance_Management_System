package com.kalpanaafinance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "loans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "plan_id")
    private LoanPlan loanPlan;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(name = "duration_months", nullable = false)
    @Builder.Default
    private Integer durationMonths = 12;

    @Column(name = "interest_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(name = "tenure_months", nullable = false)
    @Builder.Default
    private Integer tenureMonths = 12;

    private String purpose;

    @Column(name = "estimated_emi", precision = 14, scale = 2)
    private BigDecimal estimatedEmi;

    @Column(name = "estimated_interest", precision = 14, scale = 2)
    private BigDecimal estimatedInterest;

    @Column(name = "estimated_repayment", precision = 14, scale = 2)
    private BigDecimal estimatedRepayment;

    @Column(name = "first_emi_date")
    private LocalDate firstEmiDate;

    @Column(name = "final_emi_date")
    private LocalDate finalEmiDate;

    @Column(name = "approved_amount", precision = 19, scale = 2)
    private BigDecimal approvedAmount;

    @Column(name = "outstanding_balance", precision = 19, scale = 2)
    private BigDecimal outstandingBalance;

    @Column(name = "overall_outstanding_amount", nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal overallOutstandingAmount = BigDecimal.ZERO;

    @Column(name = "overall_paid_amount", nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal overallPaidAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private String status; // DRAFT, APPLIED, DOCUMENTS_SUBMITTED, UNDER_REVIEW, APPROVED, RESUBMISSION_REQUIRED, REJECTED, ACTIVE, COMPLETED

    @Column(name = "application_status")
    private String applicationStatus;

    @Column(name = "resubmission_reason", columnDefinition = "TEXT")
    private String resubmissionReason;

    @Column(name = "resubmitted_at")
    private LocalDateTime resubmittedAt;

    @CreationTimestamp
    @Column(name = "applied_at")
    private LocalDateTime appliedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "disbursed_at")
    private LocalDateTime disbursedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "legacy_unverified", nullable = false)
    @Builder.Default
    private Boolean legacyUnverified = false;

    public String getStatus() { return this.status; }
    public BigDecimal getOutstandingBalance() { return this.outstandingBalance; }
    public BigDecimal getAmount() { return this.amount; }
}
