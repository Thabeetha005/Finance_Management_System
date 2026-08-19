package com.kalpanaafinance.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "loan_installments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanInstallment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Loan loan;

    @Column(nullable = false)
    private Integer installmentNumber;

    @Column(name = "month_year", length = 50)
    private String monthYear;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal amountDue = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "UPCOMING"; // UPCOMING, PENDING, PAID, OVERDUE

    @Column(name = "paid_date")
    private java.time.LocalDateTime paidDate;

    @Column(name = "transaction_id")
    private Long transactionId;

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @org.hibernate.annotations.UpdateTimestamp
    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;
}
