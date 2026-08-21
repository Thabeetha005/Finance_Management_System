package com.kalpanaaafinance.modules.admin.controller;

import com.kalpanaaafinance.modules.shared.entity.Transaction;
import com.kalpanaaafinance.modules.shared.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/transactions")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminTransactionController {

    private final TransactionRepository transactionRepository;

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllSystemTransactions() {
        List<Transaction> transactions = transactionRepository.findAllByOrderByDateDesc();
        return ResponseEntity.ok(transactions);
    }
}
