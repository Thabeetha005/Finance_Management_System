package com.kalpanaafinance.controller;

import com.kalpanaafinance.entity.Transaction;
import com.kalpanaafinance.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public Page<Transaction> getAllTransactions(Pageable pageable) {
        return transactionService.getAllTransactions(pageable);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER')")
    @PostMapping
    public Transaction createTransaction(@RequestBody Transaction transaction) {
        return transactionService.createTransaction(transaction);
    }
}
