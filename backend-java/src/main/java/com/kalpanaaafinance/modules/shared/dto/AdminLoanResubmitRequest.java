package com.kalpanaaafinance.modules.shared.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminLoanResubmitRequest {
    private String reason;
}
