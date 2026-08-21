package com.kalpanaaafinance;

import com.kalpanaaafinance.modules.shared.dto.WithdrawalEligibilityResponse;
import com.kalpanaaafinance.modules.shared.dto.WithdrawalRequest;
import com.kalpanaaafinance.modules.shared.dto.WithdrawalResponse;
import com.kalpanaaafinance.modules.shared.entity.Account;
import com.kalpanaaafinance.modules.shared.entity.BankAccount;
import com.kalpanaaafinance.modules.shared.entity.Role;
import com.kalpanaaafinance.modules.shared.entity.User;
import com.kalpanaaafinance.modules.shared.repository.AccountRepository;
import com.kalpanaaafinance.modules.shared.repository.BankAccountRepository;
import com.kalpanaaafinance.modules.shared.repository.UserRepository;
import com.kalpanaaafinance.modules.user.service.WithdrawalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class WithdrawalSystemTest {

    @Autowired
    private WithdrawalService withdrawalService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private BankAccountRepository bankAccountRepository;

    private User customer;
    private User admin;
    private BankAccount bankAccount;

    @BeforeEach
    void setUp() {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        customer = userRepository.saveAndFlush(User.builder()
                .email("withdrawCustomer_" + unique + "@example.com")
                .passwordHash("password123")
                .name("Withdrawal Customer")
                .role(Role.CUSTOMER)
                .balance(new BigDecimal("10000.00")) // ₹10,000 balance
                .isVerified(true)
                .build());

        accountRepository.saveAndFlush(Account.builder()
                .user(customer)
                .name("Main Wallet")
                .type("WALLET")
                .balance(new BigDecimal("10000.00"))
                .build());

        admin = userRepository.saveAndFlush(User.builder()
                .email("withdrawAdmin_" + unique + "@example.com")
                .passwordHash("adminpass123")
                .name("Withdrawal Admin")
                .role(Role.ADMIN)
                .balance(BigDecimal.ZERO)
                .isVerified(true)
                .build());

        bankAccount = bankAccountRepository.saveAndFlush(BankAccount.builder()
                .userId(customer.getId())
                .accountHolderName("Withdrawal Customer")
                .bankName("HDFC Bank")
                .accountNumber("987654321099")
                .ifscCode("HDFC0001234")
                .isVerified(true)
                .verifiedAt(LocalDateTime.now())
                .build());
    }

    @Test
    @DisplayName("Test 1: Reserve-at-Request & Deduct-at-Approval Model")
    void testReserveAtRequestDeductAtApproval() {
        // Step 1: Request ₹6,000 withdrawal (Stored balance ₹10,000)
        WithdrawalRequest req = WithdrawalRequest.builder()
                .amount(new BigDecimal("6000.00"))
                .bankAccountId(bankAccount.getId())
                .build();

        WithdrawalResponse resp = withdrawalService.requestWithdrawal(customer.getId(), req);
        assertNotNull(resp);
        assertEquals("PENDING", resp.getStatus());

        // Assert Phase 1: Real stored balance is NOT deducted at request creation
        User userAfterReq = userRepository.findById(customer.getId()).orElseThrow();
        assertEquals(0, new BigDecimal("10000.00").compareTo(userAfterReq.getBalance()), "Real stored balance must remain untouched at request creation");

        // Assert Available to Withdraw balance is reduced by PENDING amount: 10,000 - 6,000 = 4,000
        WithdrawalEligibilityResponse eligibility = withdrawalService.getWithdrawalEligibility(customer.getId());
        assertEquals(0, new BigDecimal("4000.00").compareTo(eligibility.getAvailableToWithdraw()), "Available balance must subtract PENDING request amount");

        // Step 2: Admin approves withdrawal
        WithdrawalResponse approvedResp = withdrawalService.approveWithdrawal(resp.getId(), admin.getId());
        assertEquals("COMPLETED", approvedResp.getStatus());

        // Assert Phase 2: Real stored balance IS debited at approval time: 10,000 - 6,000 = 4,000
        User userAfterApprove = userRepository.findById(customer.getId()).orElseThrow();
        assertEquals(0, new BigDecimal("4000.00").compareTo(userAfterApprove.getBalance()), "Real stored balance must be debited at approval time");
    }

    @Test
    @DisplayName("Test Concurrency (a): Two Simultaneous Requests Exceeding Available Balance")
    void testSimultaneousRequestsExceedingAvailableBalance() throws InterruptedException {
        // Customer balance: ₹10,000. Each thread requests ₹6,000 simultaneously. Total = ₹12,000 > ₹10,000.
        int numThreads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(numThreads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(numThreads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        for (int i = 0; i < numThreads; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    WithdrawalRequest req = WithdrawalRequest.builder()
                            .amount(new BigDecimal("6000.00"))
                            .bankAccountId(bankAccount.getId())
                            .build();
                    withdrawalService.requestWithdrawal(customer.getId(), req);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        doneLatch.await();
        executor.shutdown();

        assertEquals(1, successCount.get(), "Exactly ONE request must succeed when sum exceeds available balance");
        assertEquals(1, failureCount.get(), "Second request must fail due to pessimistic row lock guard");
    }

    @Test
    @DisplayName("Test Concurrency (b): Two Simultaneous Admin Approval Clicks on Same Withdrawal")
    void testSimultaneousAdminApprovals() throws InterruptedException {
        // Create PENDING withdrawal of ₹4,000
        WithdrawalRequest req = WithdrawalRequest.builder()
                .amount(new BigDecimal("4000.00"))
                .bankAccountId(bankAccount.getId())
                .build();
        WithdrawalResponse withdrawal = withdrawalService.requestWithdrawal(customer.getId(), req);

        int numThreads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(numThreads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(numThreads);

        AtomicInteger approvalSuccessCount = new AtomicInteger(0);
        AtomicInteger approvalFailureCount = new AtomicInteger(0);

        for (int i = 0; i < numThreads; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    withdrawalService.approveWithdrawal(withdrawal.getId(), admin.getId());
                    approvalSuccessCount.incrementAndGet();
                } catch (Exception e) {
                    approvalFailureCount.incrementAndGet();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        doneLatch.await();
        executor.shutdown();

        assertEquals(1, approvalSuccessCount.get(), "Exactly ONE admin approval must succeed");
        assertEquals(1, approvalFailureCount.get(), "Second admin approval must be blocked by atomic status guard");

        User userAfter = userRepository.findById(customer.getId()).orElseThrow();
        assertEquals(0, new BigDecimal("6000.00").compareTo(userAfter.getBalance()), "Balance must be debited exactly once for ₹4,000");
    }
}
