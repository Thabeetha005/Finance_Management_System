package com.kalpanaafinance.modules.shared.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangePasswordResponse {
    private String message;
    private String token;
}
