package com.kalpanaafinance.modules.shared.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "loan_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "min_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal minAmount;

    @Column(name = "max_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal maxAmount;

    @Column(name = "allowed_purposes", nullable = false, columnDefinition = "TEXT")
    private String allowedPurposes;

    @Column(name = "requires_business_doc", nullable = false)
    @Builder.Default
    private Boolean requiresBusinessDoc = false;

    @Column(name = "requires_property_doc", nullable = false)
    @Builder.Default
    private Boolean requiresPropertyDoc = false;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "loanPlan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<LoanPlanRate> rates = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Boolean getIsActive() { return this.isActive; }
}
