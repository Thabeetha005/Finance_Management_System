package com.kalpanaafinance.controller;

import com.kalpanaafinance.dto.WalletSummaryResponse;
import com.kalpanaafinance.dto.WalletTransactionResponse;
import com.kalpanaafinance.modules.shared.entity.Deposit;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.repository.UserRepository;
import com.kalpanaafinance.service.DepositService;
import com.kalpanaafinance.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class WalletController {

    private final WalletService walletService;
    private final DepositService depositService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        String email = auth != null ? auth.getName() : SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated user"));
    }

    @PostMapping({"/deposit", "/deposits", "/add-funds", "/me/deposit"})
    public ResponseEntity<Deposit> createDeposit(
            @RequestBody com.kalpanaafinance.dto.DepositCreateRequest request,
            Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Deposit deposit = depositService.createDeposit(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(deposit);
    }

    @PostMapping({"/deposits/{id}/demo-success", "/deposit/{id}/demo-success", "/me/deposit/{id}/demo-success"})
    public ResponseEntity<Deposit> processDemoSuccess(
            @PathVariable Long id, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Deposit deposit = depositService.processDemoSuccess(user.getId(), id);
        return ResponseEntity.ok(deposit);
    }

    @PostMapping({"/deposits/{id}/demo-failure", "/deposit/{id}/demo-failure", "/me/deposit/{id}/demo-failure"})
    public ResponseEntity<Deposit> processDemoFailure(
            @PathVariable Long id, @RequestBody(required = false) Map<String, String> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        String reason = body != null ? body.get("reason") : "Simulated payment gateway failure";
        Deposit deposit = depositService.processDemoFailure(user.getId(), id, reason);
        return ResponseEntity.ok(deposit);
    }

    @GetMapping("/summary")
    public ResponseEntity<WalletSummaryResponse> getWalletSummary(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        WalletSummaryResponse summary = walletService.getWalletSummary(user.getId());
        return ResponseEntity.ok(summary);
    }

    @GetMapping({"/transactions", "/me/transactions/filtered"})
    public ResponseEntity<Page<WalletTransactionResponse>> getWalletTransactions(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "newest") String sort,
            Authentication auth) {

        User user = getAuthenticatedUser(auth);

        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(LocalTime.MAX) : null;

        Page<WalletTransactionResponse> txPage = walletService.getWalletTransactions(
                user.getId(), type, status, search, startDateTime, endDateTime, page, size, sort
        );

        return ResponseEntity.ok(txPage);
    }

    @GetMapping("/activity")
    public ResponseEntity<List<WalletTransactionResponse>> getRecentActivity(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        List<WalletTransactionResponse> activity = walletService.getRecentActivity(user.getId());
        return ResponseEntity.ok(activity);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getWalletMe(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        WalletSummaryResponse summary = walletService.getWalletSummary(user.getId());

        Map<String, Object> map = new HashMap<>();
        map.put("availableBalance", summary.getAvailableWalletBalance());
        map.put("totalPortfolioValue", summary.getTotalPortfolioValue());
        map.put("investedAmount", summary.getTotalInvestedAmount());
        map.put("totalProfit", summary.getTotalProfit());
        map.put("totalLoanOutstanding", summary.getTotalLoanOutstanding());
        
        return ResponseEntity.ok(map);
    }
}
