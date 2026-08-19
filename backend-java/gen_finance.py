import os

base_dir = r"C:\Users\thabe\.gemini\antigravity\scratch\kalpanaa-finance\backend-java\src\main\java\com\kalpanaafinance"
resources_dir = r"C:\Users\thabe\.gemini\antigravity\scratch\kalpanaa-finance\backend-java\src\main\resources\db\migration"

os.makedirs(os.path.join(base_dir, "entity"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "repository"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "service"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "controller"), exist_ok=True)
os.makedirs(resources_dir, exist_ok=True)

files = {
    "entity/Account.java": """package com.kalpanaafinance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String name;

    @Column(precision = 14, scale = 2)
    private BigDecimal balance;
    
    private String type; // e.g. CHECKING, SAVINGS
}
""",
    "entity/Transaction.java": """package com.kalpanaafinance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(precision = 14, scale = 2)
    private BigDecimal amount;
    
    private String type; // DEPOSIT, WITHDRAWAL, TRANSFER
    private LocalDateTime date;
    private String description;
}
""",
    "entity/Income.java": """package com.kalpanaafinance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "incomes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Income {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(precision = 14, scale = 2)
    private BigDecimal amount;
    
    private String source;
    private LocalDate date;
    private String description;
}
""",
    "entity/Expense.java": """package com.kalpanaafinance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(precision = 14, scale = 2)
    private BigDecimal amount;
    
    private String category;
    private LocalDate date;
    private String description;
}
""",
    "entity/Budget.java": """package com.kalpanaafinance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "budgets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(precision = 14, scale = 2)
    private BigDecimal amount;
    
    private String category;
    private LocalDate startDate;
    private LocalDate endDate;
}
""",
    "entity/Invoice.java": """package com.kalpanaafinance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(precision = 14, scale = 2)
    private BigDecimal amount;
    
    private String clientName;
    private String status;
    private LocalDate dueDate;
}
""",
    "repository/AccountRepository.java": """package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserId(Long userId);
}
""",
    "repository/TransactionRepository.java": """package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByAccountId(Long accountId);
}
""",
    "repository/IncomeRepository.java": """package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IncomeRepository extends JpaRepository<Income, Long> {
    List<Income> findByUserId(Long userId);
}
""",
    "repository/ExpenseRepository.java": """package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUserId(Long userId);
}
""",
    "repository/BudgetRepository.java": """package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserId(Long userId);
}
""",
    "repository/InvoiceRepository.java": """package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByUserId(Long userId);
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

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }
    
    public Account getAccountById(Long id) {
        return accountRepository.findById(id).orElseThrow(() -> new RuntimeException("Account not found"));
    }
    
    public Account createAccount(Account account) {
        return accountRepository.save(account);
    }
    
    public Account updateAccount(Long id, Account accountDetails) {
        Account account = getAccountById(id);
        account.setName(accountDetails.getName());
        account.setBalance(accountDetails.getBalance());
        account.setType(accountDetails.getType());
        return accountRepository.save(account);
    }
    
    public void deleteAccount(Long id) {
        accountRepository.deleteById(id);
    }

    @Transactional
    public void transferFunds(Long fromAccountId, Long toAccountId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transfer amount must be positive");
        }
        
        Account fromAccount = getAccountById(fromAccountId);
        Account toAccount = getAccountById(toAccountId);
        
        if (fromAccount.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds in source account");
        }
        
        fromAccount.setBalance(fromAccount.getBalance().subtract(amount));
        toAccount.setBalance(toAccount.getBalance().add(amount));
        
        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);
    }
}
""",
    "service/TransactionService.java": """package com.kalpanaafinance.service;

import com.kalpanaafinance.entity.Transaction;
import com.kalpanaafinance.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }
    
    public Transaction getTransactionById(Long id) {
        return transactionRepository.findById(id).orElseThrow(() -> new RuntimeException("Transaction not found"));
    }
    
    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }
    
    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }
}
""",
    "controller/AccountController.java": """package com.kalpanaafinance.controller;

import com.kalpanaafinance.entity.Account;
import com.kalpanaafinance.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Account>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Account> getAccountById(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.getAccountById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Account> createAccount(@RequestBody Account account) {
        return ResponseEntity.ok(accountService.createAccount(account));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Account> updateAccount(@PathVariable Long id, @RequestBody Account accountDetails) {
        return ResponseEntity.ok(accountService.updateAccount(id, accountDetails));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<String> transferFunds(
            @RequestParam Long fromAccountId,
            @RequestParam Long toAccountId,
            @RequestParam BigDecimal amount) {
        accountService.transferFunds(fromAccountId, toAccountId, amount);
        return ResponseEntity.ok("Transfer successful");
    }
}
""",
    "controller/TransactionController.java": """package com.kalpanaafinance.controller;

import com.kalpanaafinance.entity.Transaction;
import com.kalpanaafinance.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getTransactionById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction) {
        return ResponseEntity.ok(transactionService.createTransaction(transaction));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}
"""
}

migration_sql = """-- V2__finance_tables.sql
CREATE TABLE accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255),
    balance DECIMAL(14, 2) DEFAULT 0.00,
    type VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT NOT NULL,
    amount DECIMAL(14, 2) NOT NULL,
    type VARCHAR(50),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE incomes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(14, 2) NOT NULL,
    source VARCHAR(255),
    date DATE,
    description VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(14, 2) NOT NULL,
    category VARCHAR(255),
    date DATE,
    description VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE budgets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(14, 2) NOT NULL,
    category VARCHAR(255),
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(14, 2) NOT NULL,
    client_name VARCHAR(255),
    status VARCHAR(50),
    due_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
"""

for path, content in files.items():
    full_path = os.path.join(base_dir, path)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

with open(os.path.join(resources_dir, "V2__finance_tables.sql"), "w", encoding="utf-8") as f:
    f.write(migration_sql)
