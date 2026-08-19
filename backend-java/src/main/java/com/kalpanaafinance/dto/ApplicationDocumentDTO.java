package com.kalpanaafinance.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationDocumentDTO {
    private Long id;
    private Long applicationId;
    private String applicationType;
    private Long documentId;
    private String documentType;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private String verificationStatus;
    private LocalDateTime uploadedAt;
    private Boolean isNewlyUploaded;
    private Integer version;
}
