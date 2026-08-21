package com.kalpanaaafinance.modules.shared.dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUsernameRequest {
    private String username;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}
