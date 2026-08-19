package com.kalpanaafinance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "installment_id", nullable = false)
    private LoanInstallment installment;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @CreationTimestamp
    private LocalDateTime attemptedAt;

    @Column(nullable = false)
    private String status; // SUCCESS, FAILED
}
