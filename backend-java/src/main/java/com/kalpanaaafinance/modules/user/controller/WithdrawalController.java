package com.kalpanaaafinance.modules.user.controller;

import com.kalpanaaafinance.modules.shared.dto.*;
import com.kalpanaaafinance.modules.shared.entity.User;
import com.kalpanaaafinance.modules.shared.repository.UserRepository;
import com.kalpanaaafinance.modules.user.service.WithdrawalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/withdrawals")
@RequiredArgsConstructor
public class WithdrawalController {

    private final WithdrawalService withdrawalService;
    private final UserRepository userRepository;

    @GetMapping("/eligibility")
    public ResponseEntity<WithdrawalEligibilityResponse> getEligibility(Authentication auth) {
        User user = getUserFromAuth(auth);
        return ResponseEntity.ok(withdrawalService.getWithdrawalEligibility(user.getId()));
    }

    @PostMapping("/preview")
    public ResponseEntity<WithdrawalPreviewResponse> previewWithdrawal(
            @Valid @RequestBody WithdrawalRequest request,
            Authentication auth
    ) {
        User user = getUserFromAuth(auth);
        return ResponseEntity.ok(withdrawalService.previewWithdrawal(user.getId(), request));
    }

    @PostMapping("/request")
    public ResponseEntity<WithdrawalResponse> requestWithdrawal(
            @Valid @RequestBody WithdrawalRequest request,
            Authentication auth
    ) {
        User user = getUserFromAuth(auth);
        return ResponseEntity.ok(withdrawalService.requestWithdrawal(user.getId(), request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<WithdrawalResponse>> getMyWithdrawals(Authentication auth) {
        User user = getUserFromAuth(auth);
        return ResponseEntity.ok(withdrawalService.getMyWithdrawals(user.getId()));
    }

    private User getUserFromAuth(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not authenticated"));
    }
}
