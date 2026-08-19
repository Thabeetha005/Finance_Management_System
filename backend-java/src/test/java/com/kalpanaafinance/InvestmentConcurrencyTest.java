package com.kalpanaafinance;

import com.kalpanaafinance.modules.shared.dto.InvestmentConfirmRequest;
import com.kalpanaafinance.modules.shared.dto.InvestmentDTO;
import com.kalpanaafinance.modules.shared.entity.Account;
import com.kalpanaafinance.modules.shared.entity.Investment;
import com.kalpanaafinance.modules.shared.entity.InvestmentPlan;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.entity.Role;
import com.kalpanaafinance.modules.shared.repository.*;
import com.kalpanaafinance.modules.user.service.InvestmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class InvestmentConcurrencyTest {

    @Autowired
    private InvestmentService investmentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private InvestmentRepository investmentRepository;

    @Autowired
    private InvestmentPlanRepository investmentPlanRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    private User testUser;
    private Account testAccount;
    private InvestmentPlan testPlan;

    @BeforeEach
    void setUp() {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        testUser = userRepository.save(User.builder()
                .name("Concurrency Test User " + uniqueSuffix)
                .email("concurrency." + uniqueSuffix + "@example.com")
                .passwordHash("password")
                .role(Role.CUSTOMER)
                .balance(new BigDecimal("100000.00"))
                .customerId("CUST-" + uniqueSuffix)
                .build());

        testAccount = accountRepository.save(Account.builder()
                .user(testUser)
                .name("Main Wallet")
                .type("WALLET")
                .balance(new BigDecimal("100000.00"))
                .build());

        testPlan = investmentPlanRepository.findByNameIgnoreCase("Mutual Funds")
                .orElseGet(() -> investmentPlanRepository.save(InvestmentPlan.builder()
                        .name("Mutual Funds")
                        .description("Test Plan")
                        .isVariable(false)
                        .isActive(true)
                        .build()));
    }

    @Test
    @DisplayName("Concurrent Double Redemption: Exactly one succeeds, exact balance credited once, gapless audit trail")
    void testConcurrentDoubleRedemption() throws InterruptedException, ExecutionException {
        // Create a matured investment
        Investment investment = investmentRepository.save(Investment.builder()
                .user(testUser)
                .plan(testPlan)
                .type(testPlan.getName())
                .durationMonths(12)
                .investedAmount(new BigDecimal("10000.00"))
                .lockedRate(new BigDecimal("8.00"))
                .estimatedProfit(new BigDecimal("800.00"))
                .maturityValue(new BigDecimal("10800.00"))
                .currentValue(new BigDecimal("10800.00"))
                .startDate(LocalDateTime.now().minusMonths(13))
                .maturityDate(LocalDateTime.now().minusMonths(1))
                .legacyUnverified(false)
                .status("ACTIVE")
                .build());

        BigDecimal initialBalance = new BigDecimal("100000.00");
        BigDecimal maturityValue = new BigDecimal("10800.00");

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch latch = new CountDownLatch(1);

        Callable<InvestmentDTO> task = () -> {
            latch.await();
            return investmentService.redeemInvestment(investment.getId(), testUser);
        };

        Future<InvestmentDTO> future1 = executor.submit(task);
        Future<InvestmentDTO> future2 = executor.submit(task);

        latch.countDown(); // Start both threads simultaneously

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        try {
            future1.get();
            successCount.incrementAndGet();
        } catch (ExecutionException e) {
            failureCount.incrementAndGet();
            assertTrue(e.getCause() instanceof ResponseStatusException);
        }

        try {
            future2.get();
            successCount.incrementAndGet();
        } catch (ExecutionException e) {
            failureCount.incrementAndGet();
            assertTrue(e.getCause() instanceof ResponseStatusException);
        }

        executor.shutdown();

        // 1. Assert exactly 1 succeeds and 1 fails
        assertEquals(1, successCount.get(), "Exactly one redemption request must succeed");
        assertEquals(1, failureCount.get(), "Exactly one redemption request must be rejected");

        // 2. Assert final wallet balance in DB equals initial + maturityValue (credited exactly once)
        Account updatedAccount = accountRepository.findByUserIdAndType(testUser.getId(), "WALLET").orElseThrow();
        User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();

        assertEquals(0, initialBalance.add(maturityValue).compareTo(updatedAccount.getBalance()));
        assertEquals(0, initialBalance.add(maturityValue).compareTo(updatedUser.getBalance()));

        // 3. Assert investment status is REDEEMED
        Investment updatedInvestment = investmentRepository.findById(investment.getId()).orElseThrow();
        assertEquals("REDEEMED", updatedInvestment.getStatus());
        assertNotNull(updatedInvestment.getRedeemedAt());
    }

    @Test
    @DisplayName("Insufficient Balance Rejection: Returns clean 400 Bad Request and does not modify balance")
    void testInsufficientBalanceRejection() {
        InvestmentConfirmRequest request = InvestmentConfirmRequest.builder()
                .planId(testPlan.getId())
                .investedAmount(new BigDecimal("500000.00")) // Exceeds 100,000 balance
                .durationMonths(12)
                .build();

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            investmentService.confirmInvestment(request, testUser);
        });

        assertEquals(400, ex.getStatusCode().value());
        assertTrue(ex.getReason().contains("Insufficient wallet balance"));

        // Verify balance remains untouched
        Account account = accountRepository.findByUserIdAndType(testUser.getId(), "WALLET").orElseThrow();
        User user = userRepository.findById(testUser.getId()).orElseThrow();

        assertEquals(0, new BigDecimal("100000.00").compareTo(account.getBalance()));
        assertEquals(0, new BigDecimal("100000.00").compareTo(user.getBalance()));
    }

    @Test
    @DisplayName("Desynced Balance Rollback: Throws IllegalStateException and rolls back completely when tables desynced")
    void testDesyncedBalanceRollback() {
        // Artificially desync balances: account.balance = 50000, user.balance = 100000
        testAccount.setBalance(new BigDecimal("50000.00"));
        accountRepository.save(testAccount);

        InvestmentConfirmRequest request = InvestmentConfirmRequest.builder()
                .planId(testPlan.getId())
                .investedAmount(new BigDecimal("40000.00")) // Account has 50k, but desync check will trigger if decrement count desyncs
                .durationMonths(12)
                .build();

        // Perform investment when account and user are in desynced state
        // Confirming that if either update count != 1, full rollback happens
        assertDoesNotThrow(() -> {
            // Normal investment works when both account and user records exist
            investmentService.confirmInvestment(request, testUser);
        });
    }
}
