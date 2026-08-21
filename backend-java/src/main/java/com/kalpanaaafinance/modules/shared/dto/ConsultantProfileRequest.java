package com.kalpanaaafinance.modules.shared.dto;

import lombok.Data;

@Data
public class ConsultantProfileRequest {
    private String name;
    private String email;
    private String password;
    private String phone;
    private String specialization;
    private Integer experienceYears;
    private String qualification;
    private String bio;
    private String profileImageUrl;
    private String workingDays;
    private String workingHoursStart;
    private String workingHoursEnd;
    private Integer maxSessionsPerDay;
    private String status;
}
