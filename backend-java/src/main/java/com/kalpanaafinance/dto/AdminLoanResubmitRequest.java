package com.kalpanaafinance.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminLoanResubmitRequest {
    private String reason;
}
