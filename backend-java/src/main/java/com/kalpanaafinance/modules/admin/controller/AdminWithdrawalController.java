package com.kalpanaafinance.modules.admin.controller;

import com.kalpanaafinance.dto.WithdrawalResponse;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.repository.UserRepository;
import com.kalpanaafinance.modules.user.service.WithdrawalService;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/withdrawals")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminWithdrawalController {

    private final WithdrawalService withdrawalService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<WithdrawalResponse>> getAllWithdrawals() {
        return ResponseEntity.ok(withdrawalService.getAllWithdrawalsForAdmin());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<WithdrawalResponse> approveWithdrawal(
            @PathVariable Long id,
            Authentication auth
    ) {
        User admin = getUserFromAuth(auth);
        return ResponseEntity.ok(withdrawalService.approveWithdrawal(id, admin.getId()));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<WithdrawalResponse> rejectWithdrawal(
            @PathVariable Long id,
            @RequestBody RejectionRequest request,
            Authentication auth
    ) {
        User admin = getUserFromAuth(auth);
        return ResponseEntity.ok(withdrawalService.rejectWithdrawal(id, admin.getId(), request.getReason()));
    }

    private User getUserFromAuth(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not authenticated"));
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class RejectionRequest {
        private String reason;
    }
}
