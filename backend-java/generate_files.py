import os

base_dir = r"C:\Users\thabe\.gemini\antigravity\scratch\kalpanaa-finance\backend-java\src\main\java\com\kalpanaafinance"

files = {
    "entity/AuditLog.java": """package com.kalpanaafinance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action;
    private String entityName;
    private Long entityId;
    private String username;
    private LocalDateTime timestamp;
    private String details;
}
""",
    "entity/InvoiceItem.java": """package com.kalpanaafinance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "invoice_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    private String description;
    
    @Column(precision = 19, scale = 2)
    private BigDecimal quantity;
    
    @Column(precision = 19, scale = 2)
    private BigDecimal unitPrice;
    
    @Column(precision = 19, scale = 2)
    private BigDecimal total;
}
""",
    "repository/AuditLogRepository.java": """package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}
""",
    "repository/AccountRepository.java": """package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
}
""",
    "repository/ClientRepository.java": """package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
}
""",
    "repository/IncomeRepository.java": """package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {
}
""",
    "repository/ExpenseRepository.java": """package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
}
""",
    "repository/InvoiceRepository.java": """package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
}
""",
    "repository/BudgetRepository.java": """package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
}
""",
    "repository/NotificationRepository.java": """package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
""",
    "repository/TransactionRepository.java": """package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
}
""",
    "service/AuditService.java": """package com.kalpanaafinance.service;

import com.kalpanaafinance.entity.AuditLog;
import com.kalpanaafinance.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditLogRepository auditLogRepository;

    public void logAction(String action, String entityName, Long entityId, String username, String details) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .entityName(entityName)
                .entityId(entityId)
                .username(username)
                .timestamp(LocalDateTime.now())
                .details(details)
                .build();
        auditLogRepository.save(log);
    }
}
""",
    "service/AccountService.java": """package com.kalpanaafinance.service;

import com.kalpanaafinance.entity.Account;
import com.kalpanaafinance.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountRepository accountRepository;
    private final AuditService auditService;

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }
    
    public Account getAccountById(Long id) {
        return accountRepository.findById(id).orElseThrow(() -> new RuntimeException("Account not found"));
    }
    
    public Account createAccount(Account account) {
        Account saved = accountRepository.save(account);
        auditService.logAction("CREATE", "Account", saved.getId(), "system", "Created account");
        return saved;
    }
    
    @Transactional
    public void updateBalance(Long accountId, BigDecimal amount) {
        Account account = getAccountById(accountId);
        if (account.getBalance() == null) {
            account.setBalance(BigDecimal.ZERO);
        }
        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);
        auditService.logAction("UPDATE_BALANCE", "Account", accountId, "system", "Balance updated by " + amount);
    }

    @Transactional
    public void transfer(Long fromAccountId, Long toAccountId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Transfer amount must be positive");
        }
        updateBalance(fromAccountId, amount.negate());
        updateBalance(toAccountId, amount);
        auditService.logAction("TRANSFER", "Account", fromAccountId, "system", "Transferred " + amount + " to account " + toAccountId);
    }
}
""",
    "service/TransactionService.java": """package com.kalpanaafinance.service;

import com.kalpanaafinance.entity.Transaction;
import com.kalpanaafinance.repository.TransactionRepository;
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
        
        auditService.logAction("CREATE", "Transaction", saved.getId(), "system", "Created transaction of type " + transaction.getType());
        return saved;
    }
    
    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
        auditService.logAction("DELETE", "Transaction", id, "system", "Deleted transaction");
    }
}
""",
    "controller/AccountController.java": """package com.kalpanaafinance.controller;

import com.kalpanaafinance.entity.Account;
import com.kalpanaafinance.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;

    @GetMapping
    public List<Account> getAllAccounts() {
        return accountService.getAllAccounts();
    }

    @PostMapping
    public Account createAccount(@RequestBody Account account) {
        return accountService.createAccount(account);
    }

    @PostMapping("/transfer")
    public void transfer(@RequestBody Map<String, Object> request) {
        Long fromAccountId = Long.valueOf(request.get("fromAccountId").toString());
        Long toAccountId = Long.valueOf(request.get("toAccountId").toString());
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        accountService.transfer(fromAccountId, toAccountId, amount);
    }
}
""",
    "controller/TransactionController.java": """package com.kalpanaafinance.controller;

import com.kalpanaafinance.entity.Transaction;
import com.kalpanaafinance.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;

    @GetMapping
    public Page<Transaction> getAllTransactions(Pageable pageable) {
        return transactionService.getAllTransactions(pageable);
    }

    @PostMapping
    public Transaction createTransaction(@RequestBody Transaction transaction) {
        return transactionService.createTransaction(transaction);
    }
}
""",
    "controller/DashboardController.java": """package com.kalpanaafinance.controller;

import com.kalpanaafinance.repository.AccountRepository;
import com.kalpanaafinance.repository.TransactionRepository;
import com.kalpanaafinance.repository.UserRepository;
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
""",
    "exception/GlobalExceptionHandler.java": """package com.kalpanaafinance.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleAllExceptions(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Object> handleRuntimeException(RuntimeException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
}
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Files generated successfully.")
