package com.kalpanaafinance.service;

import com.kalpanaafinance.modules.shared.entity.Account;
import com.kalpanaafinance.modules.shared.repository.AccountRepository;
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
        auditService.logAction("admin@kalpanaafinance.com", "CREATE", "Account", saved.getId(), "Created account", null);
        return saved;
    }

    public Account updateBalance(Long accountId, BigDecimal amount) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        account.setBalance(account.getBalance().add(amount));
        Account updated = accountRepository.save(account);
        auditService.logAction("admin@kalpanaafinance.com", "UPDATE_BALANCE", "Account", accountId, "Balance updated by " + amount, null);
        return updated;
    }

    @Transactional
    public void transfer(Long fromAccountId, Long toAccountId, BigDecimal amount) {
        Account fromAccount = accountRepository.findById(fromAccountId)
                .orElseThrow(() -> new RuntimeException("Source account not found"));
        Account toAccount = accountRepository.findById(toAccountId)
                .orElseThrow(() -> new RuntimeException("Destination account not found"));

        if (fromAccount.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        fromAccount.setBalance(fromAccount.getBalance().subtract(amount));
        toAccount.setBalance(toAccount.getBalance().add(amount));

        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);
        auditService.logAction("admin@kalpanaafinance.com", "TRANSFER", "Account", fromAccountId, "Transferred " + amount + " to account " + toAccountId, null);
    }
}
