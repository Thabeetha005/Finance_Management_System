package com.kalpanaafinance.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LinkDocumentRequest {
    private Long applicationId;
    private String applicationType;
    private Long documentId;
    private String documentType;
}
