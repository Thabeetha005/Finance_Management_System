package com.kalpanaafinance.dto;

import lombok.Data;

@Data
public class ConsultationNoteRequest {
    private String content;
    private Boolean isPrivate;
}
