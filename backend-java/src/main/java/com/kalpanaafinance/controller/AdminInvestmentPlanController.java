package com.kalpanaafinance.controller;

import com.kalpanaafinance.dto.*;
import com.kalpanaafinance.modules.shared.entity.InvestmentPlan;
import com.kalpanaafinance.modules.shared.entity.InvestmentPlanRate;
import com.kalpanaafinance.modules.shared.repository.InvestmentPlanRateRepository;
import com.kalpanaafinance.modules.shared.repository.InvestmentPlanRepository;
import com.kalpanaafinance.modules.user.service.InvestmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminInvestmentPlanController {

    private final InvestmentPlanRepository investmentPlanRepository;
    private final InvestmentPlanRateRepository investmentPlanRateRepository;
    private final InvestmentService investmentService;

    @GetMapping("/investment-plans")
    public ResponseEntity<List<InvestmentPlanDTO>> getAllPlans() {
        List<InvestmentPlanDTO> plans = investmentPlanRepository.findAll().stream()
                .map(this::mapPlanToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(plans);
    }

    @PostMapping("/investment-plans")
    @Transactional
    public ResponseEntity<InvestmentPlanDTO> createPlan(@Valid @RequestBody InvestmentPlanDTO request) {
        if (investmentPlanRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Plan name already exists");
        }

        InvestmentPlan plan = InvestmentPlan.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isVariable(Boolean.TRUE.equals(request.getIsVariable()))
                .variableRate(request.getVariableRate())
                .isActive(request.getIsActive() == null || request.getIsActive())
                .build();

        plan = investmentPlanRepository.save(plan);

        if (Boolean.FALSE.equals(plan.getIsVariable()) && request.getRates() != null) {
            for (InvestmentPlanDTO.InvestmentPlanRateDTO r : request.getRates()) {
                InvestmentPlanRate rateRow = InvestmentPlanRate.builder()
                        .plan(plan)
                        .durationMonths(r.getDurationMonths())
                        .returnRate(r.getReturnRate())
                        .build();
                investmentPlanRateRepository.save(rateRow);
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(mapPlanToDTO(plan));
    }

    @PutMapping("/investment-plans/{id}")
    @Transactional
    public ResponseEntity<InvestmentPlanDTO> updatePlan(@PathVariable Long id, @Valid @RequestBody InvestmentPlanDTO request) {
        InvestmentPlan plan = investmentPlanRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan not found"));

        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setIsVariable(Boolean.TRUE.equals(request.getIsVariable()));
        plan.setVariableRate(request.getVariableRate());
        if (request.getIsActive() != null) {
            plan.setIsActive(request.getIsActive());
        }

        plan = investmentPlanRepository.save(plan);

        if (Boolean.FALSE.equals(plan.getIsVariable()) && request.getRates() != null) {
            investmentPlanRateRepository.deleteByPlanId(plan.getId());
            for (InvestmentPlanDTO.InvestmentPlanRateDTO r : request.getRates()) {
                InvestmentPlanRate rateRow = InvestmentPlanRate.builder()
                        .plan(plan)
                        .durationMonths(r.getDurationMonths())
                        .returnRate(r.getReturnRate())
                        .build();
                investmentPlanRateRepository.save(rateRow);
            }
        }

        return ResponseEntity.ok(mapPlanToDTO(plan));
    }

    @GetMapping("/investments")
    public ResponseEntity<List<InvestmentDTO>> getAllInvestments() {
        return ResponseEntity.ok(investmentService.getAllInvestmentsForAdmin());
    }

    @GetMapping("/investments/legacy-unverified")
    public ResponseEntity<List<InvestmentDTO>> getLegacyUnverifiedInvestments() {
        return ResponseEntity.ok(investmentService.getLegacyUnverifiedInvestments());
    }

    @PutMapping("/investments/{id}/resolve-legacy")
    public ResponseEntity<InvestmentDTO> resolveLegacyInvestment(
            @PathVariable Long id,
            @Valid @RequestBody ResolveLegacyInvestmentRequest request) {
        return ResponseEntity.ok(investmentService.resolveLegacyInvestment(id, request));
    }

    private InvestmentPlanDTO mapPlanToDTO(InvestmentPlan plan) {
        return InvestmentPlanDTO.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .isVariable(plan.getIsVariable())
                .variableRate(plan.getVariableRate())
                .isActive(plan.getIsActive())
                .rates(plan.getRates() != null ? plan.getRates().stream()
                        .map(r -> InvestmentPlanDTO.InvestmentPlanRateDTO.builder()
                                .id(r.getId())
                                .durationMonths(r.getDurationMonths())
                                .returnRate(r.getReturnRate())
                                .build())
                        .collect(Collectors.toList()) : List.of())
                .build();
    }
}
