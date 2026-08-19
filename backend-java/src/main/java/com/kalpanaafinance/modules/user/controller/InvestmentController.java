package com.kalpanaafinance.modules.user.controller;

import com.kalpanaafinance.dto.*;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.repository.UserRepository;
import com.kalpanaafinance.modules.user.service.InvestmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/investments")
@RequiredArgsConstructor
public class InvestmentController {

    private final InvestmentService investmentService;
    private final UserRepository userRepository;

    @GetMapping("/plans")
    public ResponseEntity<List<InvestmentPlanDTO>> getPlans() {
        return ResponseEntity.ok(investmentService.getActivePlans());
    }

    @PostMapping("/preview")
    public ResponseEntity<InvestmentPreviewResponse> getPreview(
            @Valid @RequestBody InvestmentPreviewRequest request,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        return ResponseEntity.ok(investmentService.getPreview(request, user));
    }

    @PostMapping("/confirm")
    public ResponseEntity<InvestmentDTO> confirmInvestment(
            @Valid @RequestBody InvestmentConfirmRequest request,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        return ResponseEntity.ok(investmentService.confirmInvestment(request, user));
    }

    @PostMapping("/{id}/redeem")
    public ResponseEntity<InvestmentDTO> redeemInvestment(
            @PathVariable Long id,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        return ResponseEntity.ok(investmentService.redeemInvestment(id, user));
    }

    @GetMapping("/me")
    public ResponseEntity<List<InvestmentDTO>> getMyInvestments(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        return ResponseEntity.ok(investmentService.getUserInvestments(user.getId()));
    }
}
