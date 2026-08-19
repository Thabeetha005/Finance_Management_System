package com.kalpanaafinance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.time.LocalDate;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "consultations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash", "authorities"})
    private User user;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private LocalDate preferredDate;

    @Column(nullable = false)
    private String preferredTime;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "duration_minutes")
    private Integer durationMinutes = 60;

    @Column(name = "communication_method")
    private String communicationMethod = "Video Call";

    @Column
    private String priority = "NORMAL";

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Transient
    private Boolean clientSeenStatus;

    @Transient
    private String adminActionTaken;

    @Transient
    private String assignedConsultantName;
}
