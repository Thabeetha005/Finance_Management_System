package com.kalpanaaafinance.modules.shared.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmiOverviewDTO {
    private LoanEmiDTO currentEmi;
    private List<LoanEmiDTO> history;
}
