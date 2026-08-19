package com.kalpanaafinance;

import com.kalpanaafinance.modules.shared.dto.WalletSummaryResponse;
import com.kalpanaafinance.modules.shared.dto.WalletTransactionResponse;
import com.kalpanaafinance.modules.shared.entity.Account;
import com.kalpanaafinance.modules.shared.entity.Role;
import com.kalpanaafinance.modules.shared.entity.Transaction;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.repository.AccountRepository;
import com.kalpanaafinance.modules.shared.repository.TransactionRepository;
import com.kalpanaafinance.modules.shared.repository.UserRepository;
import com.kalpanaafinance.modules.user.service.WalletService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class WalletSystemTest {

    @Autowired
    private WalletService walletService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    private User customer;
    private Account account;

    @BeforeEach
    void setUp() {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        customer = userRepository.saveAndFlush(User.builder()
                .email("walletUser_" + unique + "@example.com")
                .passwordHash("password123")
                .name("Wallet Customer")
                .role(Role.CUSTOMER)
                .balance(new BigDecimal("150000.00"))
                .isVerified(true)
                .build());

        account = accountRepository.saveAndFlush(Account.builder()
                .user(customer)
                .name("Main Wallet")
                .type("WALLET")
                .balance(new BigDecimal("150000.00"))
                .build());

        transactionRepository.saveAndFlush(Transaction.builder()
                .userId(customer.getId())
                .account(account)
                .amount(new BigDecimal("50000.00"))
                .balanceBefore(new BigDecimal("100000.00"))
                .balanceAfter(new BigDecimal("150000.00"))
                .type("DEPOSIT")
                .status("COMPLETED")
                .description("Initial Wallet Credit")
                .date(LocalDateTime.now().minusDays(1))
                .build());

        transactionRepository.saveAndFlush(Transaction.builder()
                .userId(customer.getId())
                .account(account)
                .amount(new BigDecimal("200000.00"))
                .balanceBefore(new BigDecimal("150000.00"))
                .balanceAfter(new BigDecimal("150000.00"))
                .type("WITHDRAWAL")
                .status("FAILED")
                .description("Insufficient Balance Withdrawal Attempt")
                .date(LocalDateTime.now())
                .build());
    }

    @Test
    @DisplayName("Test 1: Wallet Summary Reads Source of Truth Stored User Balance")
    void testGetWalletSummarySourceOfTruth() {
        WalletSummaryResponse summary = walletService.getWalletSummary(customer.getId());
        assertNotNull(summary);
        assertEquals(0, new BigDecimal("150000.00").compareTo(summary.getAvailableWalletBalance()), "Available wallet balance must read stored source of truth balance");
        assertEquals(0, BigDecimal.ZERO.compareTo(summary.getTotalInvestedAmount()));
        assertEquals(0, BigDecimal.ZERO.compareTo(summary.getTotalLoanOutstanding()));
    }

    @Test
    @DisplayName("Test 2: Paginated Backend Filtered Wallet Transactions")
    void testGetFilteredPaginatedTransactions() {
        Page<WalletTransactionResponse> txPage = walletService.getWalletTransactions(
                customer.getId(), "DEPOSIT", "COMPLETED", null, null, null, 0, 10, "newest"
        );

        assertNotNull(txPage);
        assertEquals(1, txPage.getTotalElements());
        assertEquals("DEPOSIT", txPage.getContent().get(0).getType());
        assertEquals("COMPLETED", txPage.getContent().get(0).getStatus());
    }

    @Test
    @DisplayName("Test 3: FAILED Transactions Have Unchanged Balance Before == Balance After")
    void testFailedTransactionAuditOnly() {
        Page<WalletTransactionResponse> failedPage = walletService.getWalletTransactions(
                customer.getId(), null, "FAILED", null, null, null, 0, 10, "newest"
        );

        assertNotNull(failedPage);
        assertEquals(1, failedPage.getTotalElements());

        WalletTransactionResponse failedTx = failedPage.getContent().get(0);
        assertEquals("FAILED", failedTx.getStatus());
        assertEquals(failedTx.getBalanceBefore(), failedTx.getBalanceAfter(), "FAILED transactions must have balanceBefore == balanceAfter");
    }
}
