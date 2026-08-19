package com.kalpanaafinance.controller;

import com.kalpanaafinance.dto.*;
import com.kalpanaafinance.modules.shared.entity.Loan;
import com.kalpanaafinance.modules.shared.entity.LoanEmi;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.repository.LoanEmiRepository;
import com.kalpanaafinance.modules.shared.repository.LoanRepository;
import com.kalpanaafinance.modules.shared.repository.UserRepository;
import com.kalpanaafinance.modules.user.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;
    private final LoanRepository loanRepository;
    private final LoanEmiRepository loanEmiRepository;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated user");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @PostMapping("/calculate")
    public ResponseEntity<LoanCalculateResponse> calculateEmi(@RequestBody LoanCalculateRequest request) {
        return ResponseEntity.ok(loanService.calculateEmi(request));
    }

    @PostMapping("/apply")
    public ResponseEntity<Loan> applyForLoan(@RequestBody LoanApplyRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(loanService.applyForLoan(user, request));
    }

    @PostMapping
    public ResponseEntity<Loan> legacyApplyForLoan(@RequestBody LoanApplyRequest request, Authentication auth) {
        return applyForLoan(request, auth);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Loan>> getMyLoans(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(loanRepository.findByUserId(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Loan> getLoanById(@PathVariable Long id, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Loan loan = loanRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Loan not found"));
        if (!loan.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized");
        }
        return ResponseEntity.ok(loan);
    }

    @GetMapping("/{id}/emi-overview")
    public ResponseEntity<EmiOverviewDTO> getEmiOverview(@PathVariable Long id, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(loanService.getEmiOverview(user.getId(), id));
    }

    @GetMapping("/{id}/emis")
    public ResponseEntity<List<LoanEmi>> getLoanEmis(@PathVariable Long id, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Loan loan = loanRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Loan not found"));
        if (!loan.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized");
        }
        return ResponseEntity.ok(loanEmiRepository.findByLoanIdOrderByDueDateAsc(id));
    }

    @PostMapping("/emi/{emiId}/pay")
    public ResponseEntity<?> payEmi(@PathVariable Long emiId, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        try {
            LoanEmiDTO paidEmi = loanService.payEmi(user, emiId);
            return ResponseEntity.ok(paidEmi);
        } catch (ResponseStatusException ex) {
            String reason = ex.getReason();
            if (reason != null && reason.startsWith("SHORTFALL:")) {
                String[] parts = reason.split(":");
                java.math.BigDecimal req = new java.math.BigDecimal(parts[1]);
                java.math.BigDecimal avail = new java.math.BigDecimal(parts[2]);
                java.math.BigDecimal shortf = new java.math.BigDecimal(parts[3]);

                EmiShortfallResponse response = EmiShortfallResponse.builder()
                        .message("Insufficient wallet balance")
                        .requiredAmount(req)
                        .availableBalance(avail)
                        .shortfall(shortf)
                        .build();

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            throw ex;
        }
    }

    @PostMapping("/{id}/payoff")
    public ResponseEntity<String> payoffLoan(@PathVariable Long id, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        loanService.payoffLoan(user, id);
        return ResponseEntity.ok("Loan paid off successfully!");
    }
}
