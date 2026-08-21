package com.kalpanaaafinance.modules.shared.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "consultation_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultationAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "consultation_id", nullable = false)
    private Consultation consultation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "consultant_id", nullable = false)
    private ConsultantProfile consultant;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_by_admin_id")
    private User assignedByAdmin;

    @Column(nullable = false)
    private String status = "PENDING_APPROVAL";

    @CreationTimestamp
    private LocalDateTime assignedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
}
