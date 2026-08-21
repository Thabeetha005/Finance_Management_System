package com.kalpanaaafinance.modules.shared.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "consultant_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultantProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String specialization;

    @Column(name = "experience_years")
    private Integer experienceYears = 0;

    @Column
    private String qualification;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "working_days")
    private String workingDays;

    @Column(name = "working_hours_start")
    private String workingHoursStart;

    @Column(name = "working_hours_end")
    private String workingHoursEnd;

    @Column(name = "max_sessions_per_day")
    private Integer maxSessionsPerDay = 5;

    @Column
    private String status = "ACTIVE";

    @Column(name = "termination_reason", columnDefinition = "TEXT")
    private String terminationReason;

    private Double rating = 4.8;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
