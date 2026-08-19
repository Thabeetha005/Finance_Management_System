package com.kalpanaafinance.dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePhoneRequest {
    private String newPhone;
    private String currentPassword;

    public String getNewPhone() { return newPhone; }
    public void setNewPhone(String newPhone) { this.newPhone = newPhone; }

    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
}
