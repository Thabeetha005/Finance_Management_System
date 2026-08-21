package com.kalpanaaafinance.modules.admin.controller;

import com.kalpanaaafinance.modules.shared.entity.Role;
import com.kalpanaaafinance.modules.shared.entity.User;
import com.kalpanaaafinance.modules.shared.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final UserRepository userRepository;
    private final LoanRepository loanRepository;
    private final InvestmentRepository investmentRepository;
    private final ActivityLogRepository activityLogRepository;
    private final DocumentRepository documentRepository;

    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // ── KPI CARDS ──────────────────────────────────────────────
        List<User> customers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .limit(15)
                .collect(Collectors.toList());

        long totalUsers = customers.size();
        stats.put("totalUsers", totalUsers);
        stats.put("totalCustomers", totalUsers);

        // Active loans count
        long activeLoans = loanRepository.findAll().stream()
                .filter(l -> "ACTIVE".equalsIgnoreCase(l.getStatus()) || "APPROVED".equalsIgnoreCase(l.getStatus()))
                .count();
        stats.put("activeLoans", activeLoans);

        // Total loan amount (Cr)
        BigDecimal totalLoanAmount = loanRepository.findAll().stream()
                .filter(l -> "ACTIVE".equalsIgnoreCase(l.getStatus()) || "APPROVED".equalsIgnoreCase(l.getStatus()))
                .map(l -> l.getAmount() != null ? l.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalLoanAmountCr", totalLoanAmount.divide(BigDecimal.valueOf(10_000_000), 2, RoundingMode.HALF_UP));

        // Total investments amount (Cr)
        BigDecimal totalInvestments = investmentRepository.findAll().stream()
                .map(i -> i.getInvestedAmount() != null ? i.getInvestedAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalInvestmentsCr", totalInvestments.divide(BigDecimal.valueOf(10_000_000), 2, RoundingMode.HALF_UP));

        // Total wallet balance (Cr)
        BigDecimal totalWallet = customers.stream()
                .map(u -> u.getBalance() != null ? u.getBalance() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalWalletBalanceCr", totalWallet.divide(BigDecimal.valueOf(10_000_000), 2, RoundingMode.HALF_UP));

        // ── LOAN OVERVIEW (monthly count last 6 months) ────────────
        List<Map<String, Object>> loanMonthly = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate month = LocalDate.now().minusMonths(i);
            int m = month.getMonthValue();
            int y = month.getYear();
            long count = loanRepository.findAll().stream()
                    .filter(l -> l.getAppliedAt() != null &&
                            l.getAppliedAt().getMonthValue() == m &&
                            l.getAppliedAt().getYear() == y)
                    .count();
            Map<String, Object> entry = new HashMap<>();
            entry.put("month", month.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            entry.put("loans", count);
            loanMonthly.add(entry);
        }
        stats.put("loanMonthly", loanMonthly);

        // ── INVESTMENT OVERVIEW (by type) ──────────────────────────
        Map<String, BigDecimal> byType = new LinkedHashMap<>();
        byType.put("Equity", BigDecimal.ZERO);
        byType.put("Gold", BigDecimal.ZERO);
        byType.put("Debt", BigDecimal.ZERO);
        byType.put("Others", BigDecimal.ZERO);

        investmentRepository.findAll().forEach(inv -> {
            String type = inv.getType() != null ? inv.getType() : "Others";
            BigDecimal amt = inv.getInvestedAmount() != null ? inv.getInvestedAmount() : BigDecimal.ZERO;
            if (type.equalsIgnoreCase("Equity") || type.equalsIgnoreCase("SIP") || type.equalsIgnoreCase("Stocks")) {
                byType.merge("Equity", amt, BigDecimal::add);
            } else if (type.equalsIgnoreCase("Gold") || type.equalsIgnoreCase("Digital Gold")) {
                byType.merge("Gold", amt, BigDecimal::add);
            } else if (type.equalsIgnoreCase("Debt") || type.equalsIgnoreCase("Bonds") || type.equalsIgnoreCase("Fixed Deposit")) {
                byType.merge("Debt", amt, BigDecimal::add);
            } else {
                byType.merge("Others", amt, BigDecimal::add);
            }
        });

        BigDecimal totalInv = byType.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        List<Map<String, Object>> investmentBreakdown = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> e : byType.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("name", e.getKey());
            item.put("value", totalInv.compareTo(BigDecimal.ZERO) == 0 ? 0 :
                    e.getValue().multiply(BigDecimal.valueOf(100))
                            .divide(totalInv, 1, RoundingMode.HALF_UP));
            investmentBreakdown.add(item);
        }
        stats.put("investmentBreakdown", investmentBreakdown);

        // ── RECENT ACTIVITY (last 5) ────────────────────────────────
        List<Map<String, Object>> recentActivity = activityLogRepository.findAll().stream()
                .sorted(Comparator.comparing(a -> ((com.kalpanaaafinance.modules.shared.entity.ActivityLog) a).getCreatedAt()).reversed())
                .limit(5)
                .map(a -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("description", a.getDescription());
                    item.put("createdAt", a.getCreatedAt());
                    item.put("type", a.getAction());
                    return item;
                })
                .collect(Collectors.toList());
        stats.put("recentActivity", recentActivity);

        // ── SYSTEM ALERTS ────────────────────────────────────────────
        long pendingLoanApps = loanRepository.findAll().stream()
                .filter(l -> "APPLIED".equalsIgnoreCase(l.getStatus()) || "UNDER_REVIEW".equalsIgnoreCase(l.getApplicationStatus()))
                .count();

        long resubmissionDocs = documentRepository.findAll().stream()
                .filter(d -> "RESUBMISSION_REQUIRED".equalsIgnoreCase(d.getVerificationStatus()))
                .count();

        long lowWalletUsers = customers.stream()
                .filter(u -> u.getBalance() != null && u.getBalance().compareTo(BigDecimal.valueOf(1000)) < 0)
                .count();

        List<Map<String, Object>> alerts = new ArrayList<>();
        if (pendingLoanApps > 0) {
            Map<String, Object> a = new HashMap<>();
            a.put("type", "info"); a.put("message", pendingLoanApps + " loan application" + (pendingLoanApps > 1 ? "s" : "") + " pending verification");
            alerts.add(a);
        }
        if (resubmissionDocs > 0) {
            Map<String, Object> a = new HashMap<>();
            a.put("type", "warning"); a.put("message", resubmissionDocs + " document" + (resubmissionDocs > 1 ? "s" : "") + " require resubmission");
            alerts.add(a);
        }
        if (lowWalletUsers > 0) {
            Map<String, Object> a = new HashMap<>();
            a.put("type", "warning"); a.put("message", "Low wallet balance alerts: " + lowWalletUsers + " user" + (lowWalletUsers > 1 ? "s" : ""));
            alerts.add(a);
        }
        if (alerts.isEmpty()) {
            Map<String, Object> a = new HashMap<>();
            a.put("type", "success"); a.put("message", "All systems normal. No alerts.");
            alerts.add(a);
        }
        stats.put("systemAlerts", alerts);

        return stats;
    }
}
