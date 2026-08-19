package com.kalpanaafinance.controller;

import com.kalpanaafinance.modules.shared.repository.AccountRepository;
import com.kalpanaafinance.modules.shared.repository.TransactionRepository;
import com.kalpanaafinance.modules.shared.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    @GetMapping
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalTransactions", transactionRepository.count());
        
        BigDecimal totalBalance = accountRepository.findAll().stream()
                .map(a -> a.getBalance() != null ? a.getBalance() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalBalance", totalBalance);
        
        return stats;
    }
}
