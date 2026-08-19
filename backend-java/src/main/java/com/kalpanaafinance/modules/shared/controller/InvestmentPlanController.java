package com.kalpanaafinance.modules.shared.controller;

import com.kalpanaafinance.modules.shared.entity.InvestmentPlan;
import com.kalpanaafinance.modules.shared.repository.InvestmentPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/investment-plans")
@RequiredArgsConstructor
public class InvestmentPlanController {

    private final InvestmentPlanRepository investmentPlanRepository;

    @GetMapping
    public ResponseEntity<List<InvestmentPlan>> getActivePlans() {
        return ResponseEntity.ok(investmentPlanRepository.findAll());
    }
}
