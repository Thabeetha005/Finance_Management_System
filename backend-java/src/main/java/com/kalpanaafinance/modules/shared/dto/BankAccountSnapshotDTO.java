package com.kalpanaafinance.modules.shared.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankAccountSnapshotDTO {
    private Long bankAccountId;
    private String accountHolderName;
    private String bankName;
    private String accountNumberMasked;
    private String ifscCode;
}
