package com.kalpanaafinance.modules.shared.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "invoice_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    private String description;
    
    @Column(precision = 19, scale = 2)
    private BigDecimal quantity;
    
    @Column(precision = 19, scale = 2)
    private BigDecimal unitPrice;
    
    @Column(precision = 19, scale = 2)
    private BigDecimal total;
}
