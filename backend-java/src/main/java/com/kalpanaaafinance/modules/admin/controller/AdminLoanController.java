package com.kalpanaaafinance.modules.admin.controller;

import com.kalpanaaafinance.modules.shared.dto.AdminLoanResubmitRequest;
import com.kalpanaaafinance.modules.shared.entity.Loan;
import com.kalpanaaafinance.modules.shared.entity.LoanEmi;
import com.kalpanaaafinance.modules.shared.entity.User;
import com.kalpanaaafinance.modules.shared.repository.LoanEmiRepository;
import com.kalpanaaafinance.modules.shared.repository.LoanRepository;
import com.kalpanaaafinance.modules.shared.repository.UserRepository;
import com.kalpanaaafinance.modules.user.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/loans")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or hasRole('admin')")
public class AdminLoanController {

    private final LoanRepository loanRepository;
    private final LoanEmiRepository loanEmiRepository;
    private final LoanService loanService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Loan>> getAll() {
        List<User> activeUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == com.kalpanaaafinance.modules.shared.entity.Role.CUSTOMER)
                .limit(15)
                .collect(java.util.stream.Collectors.toList());

        java.util.Set<Long> activeUserIds = activeUsers.stream()
                .map(User::getId)
                .collect(java.util.stream.Collectors.toSet());

        List<Loan> loans = loanRepository.findAll().stream()
                .filter(l -> l.getUser() != null && activeUserIds.contains(l.getUser().getId()))
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(loans);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Loan> getById(@PathVariable Long id) {
        return loanRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/emis")
    public ResponseEntity<List<LoanEmi>> getEmis(@PathVariable Long id) {
        return ResponseEntity.ok(loanEmiRepository.findByLoanIdOrderByDueDateAsc(id));
    }

    @PostMapping("/{id}/start-review")
    public ResponseEntity<Loan> startReview(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        User admin = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Admin not found"));
        return ResponseEntity.ok(loanService.startReview(admin.getId(), id));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Loan> approveLoan(
            @PathVariable Long id, 
            @RequestParam(required = false) BigDecimal approvedAmount,
            Authentication authentication) {
        String email = authentication.getName();
        User admin = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Admin not found"));
        Loan approvedLoan = loanService.approveLoan(admin.getId(), id, approvedAmount);
        return ResponseEntity.ok(approvedLoan);
    }

    @PostMapping("/{id}/disburse")
    public ResponseEntity<Loan> disburseLoan(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        User admin = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Admin not found"));
        Loan disbursedLoan = loanService.disburseLoan(admin.getId(), id);
        return ResponseEntity.ok(disbursedLoan);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Loan> rejectLoan(
            @PathVariable Long id, 
            @RequestParam(required = false, defaultValue = "Application requirements not met") String reason,
            Authentication authentication) {
        String email = authentication.getName();
        User admin = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Admin not found"));
        Loan rejectedLoan = loanService.rejectLoan(admin.getId(), id, reason);
        return ResponseEntity.ok(rejectedLoan);
    }

    @PostMapping("/{id}/request-resubmission")
    public ResponseEntity<Loan> requestResubmission(
            @PathVariable Long id,
            @RequestBody(required = false) AdminLoanResubmitRequest request,
            @RequestParam(required = false) String reasonParam,
            Authentication authentication) {
        String email = authentication.getName();
        User admin = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Admin not found"));
        String reason = (request != null && request.getReason() != null) ? request.getReason() 
                : (reasonParam != null ? reasonParam : "Additional documentation required");
        Loan loan = loanService.requestResubmission(admin.getId(), id, reason);
        return ResponseEntity.ok(loan);
    }
}
