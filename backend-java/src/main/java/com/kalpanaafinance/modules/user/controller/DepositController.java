package com.kalpanaafinance.modules.user.controller;

import com.kalpanaafinance.dto.DepositCreateRequest;
import com.kalpanaafinance.modules.shared.entity.Deposit;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.repository.UserRepository;
import com.kalpanaafinance.modules.user.service.DepositService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/wallet/deposits", "/api/deposits"})
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class DepositController {

    private final DepositService depositService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        String email = auth != null ? auth.getName() : SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated user"));
    }

    @PostMapping({"", "/"})
    public ResponseEntity<Deposit> createDeposit(@RequestBody DepositCreateRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Deposit deposit = depositService.createDeposit(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(deposit);
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<Deposit>> getUserDeposits(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        List<Deposit> deposits = depositService.getUserDeposits(user.getId());
        return ResponseEntity.ok(deposits);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Deposit> getDepositById(@PathVariable Long id, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Deposit deposit = depositService.getDepositById(user.getId(), id);
        return ResponseEntity.ok(deposit);
    }

    @PostMapping("/{id}/demo-success")
    public ResponseEntity<Deposit> processDemoSuccess(@PathVariable Long id, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Deposit deposit = depositService.processDemoSuccess(user.getId(), id);
        return ResponseEntity.ok(deposit);
    }

    @PostMapping("/{id}/demo-failure")
    public ResponseEntity<Deposit> processDemoFailure(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        String reason = body != null ? body.get("reason") : "Simulated payment gateway failure";
        Deposit deposit = depositService.processDemoFailure(user.getId(), id, reason);
        return ResponseEntity.ok(deposit);
    }
}
