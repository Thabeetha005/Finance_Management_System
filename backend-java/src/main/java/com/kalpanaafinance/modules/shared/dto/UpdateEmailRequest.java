package com.kalpanaafinance.modules.shared.dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateEmailRequest {
    private String newEmail;
    private String currentPassword;

    public String getNewEmail() { return newEmail; }
    public void setNewEmail(String newEmail) { this.newEmail = newEmail; }

    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
}
