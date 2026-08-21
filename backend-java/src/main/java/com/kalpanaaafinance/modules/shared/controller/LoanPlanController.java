package com.kalpanaaafinance.modules.shared.controller;

import com.kalpanaaafinance.modules.shared.entity.LoanPlan;
import com.kalpanaaafinance.modules.shared.repository.LoanPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loan-plans")
@RequiredArgsConstructor
public class LoanPlanController {

    private final LoanPlanRepository loanPlanRepository;

    @GetMapping
    public ResponseEntity<List<LoanPlan>> getActiveLoanPlans() {
        List<LoanPlan> plans = loanPlanRepository.findAll().stream()
                .filter(LoanPlan::getIsActive)
                .toList();
        return ResponseEntity.ok(plans);
    }
}
