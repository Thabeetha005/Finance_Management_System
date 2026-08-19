package com.kalpanaafinance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String name;

    @Column(precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal balance = new BigDecimal("100000.00");
    
    private String type; // e.g. CHECKING, SAVINGS

    public Long getId() { return this.id; }
    public BigDecimal getBalance() { return this.balance; }
}
