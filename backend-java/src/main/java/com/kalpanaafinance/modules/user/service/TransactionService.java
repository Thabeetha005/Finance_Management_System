package com.kalpanaafinance.modules.user.service;

import com.kalpanaafinance.modules.user.service.AccountService;

import com.kalpanaafinance.modules.shared.service.AuditService;

import com.kalpanaafinance.modules.shared.entity.Transaction;
import com.kalpanaafinance.modules.shared.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final AccountService accountService;
    private final AuditService auditService;

    public Page<Transaction> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAll(pageable);
    }
    
    public Transaction getTransactionById(Long id) {
        return transactionRepository.findById(id).orElseThrow(() -> new RuntimeException("Transaction not found"));
    }
    
    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        if (transaction.getDate() == null) {
            transaction.setDate(LocalDateTime.now());
        }
        Transaction saved = transactionRepository.save(transaction);
        
        // Update account balance
        BigDecimal amount = transaction.getAmount();
        if ("WITHDRAWAL".equalsIgnoreCase(transaction.getType()) || "EXPENSE".equalsIgnoreCase(transaction.getType())) {
            amount = amount.negate();
        }
        accountService.updateBalance(transaction.getAccount().getId(), amount);
        
        auditService.logAction("admin@kalpanaafinance.com", "CREATE", "Transaction", saved.getId(), "Created transaction of type " + transaction.getType(), null);
        return saved;
    }
    
    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
        auditService.logAction("admin@kalpanaafinance.com", "DELETE", "Transaction", id, "Deleted transaction", null);
    }
}
