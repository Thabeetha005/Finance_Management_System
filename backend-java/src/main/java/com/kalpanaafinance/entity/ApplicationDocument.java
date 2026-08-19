package com.kalpanaafinance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "application_documents", uniqueConstraints = {
    @UniqueConstraint(name = "uk_app_doc_type", columnNames = {"application_id", "application_type", "document_type"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "application_id", nullable = false)
    private Long applicationId;

    @Column(name = "application_type", nullable = false, length = 50)
    private String applicationType; // LOAN or INVESTMENT

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(name = "document_type", nullable = false, length = 100)
    private String documentType;

    @Column(name = "is_newly_uploaded", nullable = false)
    @Builder.Default
    private Boolean isNewlyUploaded = false;

    @CreationTimestamp
    @Column(name = "selected_at")
    private LocalDateTime selectedAt;
}
