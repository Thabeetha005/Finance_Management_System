package com.kalpanaafinance.modules.shared.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "investments")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Investment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private InvestmentPlan plan;

    @Column(nullable = false)
    private String type;

    @Column(name = "duration_months", nullable = false)
    private Integer durationMonths;

    @Column(name = "invested_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal investedAmount;

    @Column(name = "locked_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal lockedRate;

    @Column(name = "estimated_profit", nullable = false, precision = 14, scale = 2)
    private BigDecimal estimatedProfit;

    @Column(name = "maturity_value", nullable = false, precision = 14, scale = 2)
    private BigDecimal maturityValue;

    @Column(name = "current_value", nullable = false, precision = 14, scale = 2)
    private BigDecimal currentValue;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "maturity_date")
    private LocalDateTime maturityDate;

    @Column(name = "redeemed_at")
    private LocalDateTime redeemedAt;

    @Column(name = "legacy_unverified", nullable = false)
    @Builder.Default
    private Boolean legacyUnverified = false;

    @Column(nullable = false)
    private String status; // ACTIVE, MATURED, REDEEMED

    @Column(name = "application_status")
    private String applicationStatus;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public InvestmentPlan getPlan() { return plan; }
    public void setPlan(InvestmentPlan plan) { this.plan = plan; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getDurationMonths() { return durationMonths; }
    public void setDurationMonths(Integer durationMonths) { this.durationMonths = durationMonths; }

    public BigDecimal getInvestedAmount() { return investedAmount; }
    public void setInvestedAmount(BigDecimal investedAmount) { this.investedAmount = investedAmount; }

    public BigDecimal getLockedRate() { return lockedRate; }
    public void setLockedRate(BigDecimal lockedRate) { this.lockedRate = lockedRate; }

    public BigDecimal getEstimatedProfit() { return estimatedProfit; }
    public void setEstimatedProfit(BigDecimal estimatedProfit) { this.estimatedProfit = estimatedProfit; }

    public BigDecimal getMaturityValue() { return maturityValue; }
    public void setMaturityValue(BigDecimal maturityValue) { this.maturityValue = maturityValue; }

    public BigDecimal getCurrentValue() { return currentValue; }
    public void setCurrentValue(BigDecimal currentValue) { this.currentValue = currentValue; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getMaturityDate() { return maturityDate; }
    public void setMaturityDate(LocalDateTime maturityDate) { this.maturityDate = maturityDate; }

    public LocalDateTime getRedeemedAt() { return redeemedAt; }
    public void setRedeemedAt(LocalDateTime redeemedAt) { this.redeemedAt = redeemedAt; }

    public Boolean getLegacyUnverified() { return legacyUnverified; }
    public void setLegacyUnverified(Boolean legacyUnverified) { this.legacyUnverified = legacyUnverified; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getApplicationStatus() { return applicationStatus; }
    public void setApplicationStatus(String applicationStatus) { this.applicationStatus = applicationStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
