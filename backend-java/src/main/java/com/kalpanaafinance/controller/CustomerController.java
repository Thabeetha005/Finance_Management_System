package com.kalpanaafinance.controller;

import com.kalpanaafinance.modules.shared.entity.Account;
import com.kalpanaafinance.modules.shared.entity.Invoice;
import com.kalpanaafinance.modules.shared.entity.Transaction;
import com.kalpanaafinance.modules.shared.repository.AccountRepository;
import com.kalpanaafinance.modules.shared.repository.InvoiceRepository;
import com.kalpanaafinance.modules.shared.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerController {

    private final TransactionRepository transactionRepository;
    private final InvoiceRepository invoiceRepository;
    private final AccountRepository accountRepository;

    @GetMapping("/transactions")
    public List<Transaction> getTransactions(@AuthenticationPrincipal UserDetails userDetails) {
        return transactionRepository.findByAccountUserEmail(userDetails.getUsername());
    }

    @GetMapping("/invoices")
    public List<Invoice> getInvoices(@AuthenticationPrincipal UserDetails userDetails) {
        return invoiceRepository.findByUserEmail(userDetails.getUsername());
    }

    @GetMapping("/accounts")
    public List<Account> getAccounts(@AuthenticationPrincipal UserDetails userDetails) {
        return accountRepository.findByUserEmail(userDetails.getUsername());
    }
}
