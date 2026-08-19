package com.kalpanaafinance.modules.shared.dto;

import lombok.Data;

@Data
public class ConsultationNoteRequest {
    private String content;
    private Boolean isPrivate;
}
