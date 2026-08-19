package com.kalpanaafinance;

import com.kalpanaafinance.dto.LoanCalculateRequest;
import com.kalpanaafinance.dto.LoanCalculateResponse;
import com.kalpanaafinance.entity.*;
import com.kalpanaafinance.repository.*;
import com.kalpanaafinance.service.LoanService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class LoanSystemTest {

    @Autowired
    private LoanService loanService;

    @Autowired
    private LoanPlanRepository loanPlanRepository;

    @Autowired
    private LoanPlanRateRepository loanPlanRateRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private LoanEmiRepository loanEmiRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    private User testUser;
    private Account testAccount;
    private User adminUser;
    private LoanPlan personalPlan;
    private LoanPlan homePlan;

    @BeforeEach
    void setUp() {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        testUser = userRepository.saveAndFlush(User.builder()
                .email("testuser_" + unique + "@example.com")
                .passwordHash("password123")
                .name("Test Customer")
                .role(Role.CUSTOMER)
                .balance(new BigDecimal("100000.00"))
                .isVerified(true)
                .build());

        testAccount = accountRepository.saveAndFlush(Account.builder()
                .user(testUser)
                .name("Savings Account")
                .balance(new BigDecimal("100000.00"))
                .type("WALLET")
                .build());

        adminUser = userRepository.saveAndFlush(User.builder()
                .email("admin_" + unique + "@example.com")
                .passwordHash("admin123")
                .name("Test Admin")
                .role(Role.ADMIN)
                .balance(new BigDecimal("1000000.00"))
                .isVerified(true)
                .build());

        personalPlan = loanPlanRepository.findByNameIgnoreCase("Personal Loan")
                .orElseGet(() -> loanPlanRepository.saveAndFlush(LoanPlan.builder()
                        .name("Personal Loan")
                        .minAmount(new BigDecimal("10000.00"))
                        .maxAmount(new BigDecimal("500000.00"))
                        .allowedPurposes("Personal,Medical")
                        .isActive(true)
                        .build()));

        homePlan = loanPlanRepository.findByNameIgnoreCase("Home Loan")
                .orElseGet(() -> loanPlanRepository.saveAndFlush(LoanPlan.builder()
                        .name("Home Loan")
                        .minAmount(new BigDecimal("100000.00"))
                        .maxAmount(new BigDecimal("2500000.00"))
                        .allowedPurposes("Home purchase,Renovation")
                        .isActive(true)
                        .build()));
    }

    @Test
    @DisplayName("Test 1: Server-side Reducing Balance EMI & 120-Month LocalDate Arithmetic")
    void testReducingBalanceEmiCalculationAnd120MonthArithmetic() {
        LoanCalculateResponse calc = loanService.calculateEmi(LoanCalculateRequest.builder()
                .planId(homePlan.getId())
                .amount(new BigDecimal("1000000.00"))
                .durationMonths(120)
                .build());

        assertNotNull(calc);
        assertEquals(120, calc.getDurationMonths());
        assertTrue(calc.getEstimatedMonthlyEmi().compareTo(BigDecimal.ZERO) > 0);
        assertTrue(calc.getEstimatedTotalRepayment().compareTo(calc.getRequestedAmount()) > 0);

        // Verify 120-month date arithmetic via LocalDate
        LocalDate expectedFinalDate = LocalDate.now().plusMonths(120);
        assertEquals(expectedFinalDate, calc.getFinalEmiDate());
    }

    @Test
    @DisplayName("Test 2: Rate Locking Rule at Approval Time")
    void testRateLockingAtApprovalTime() {
        Loan loan = loanService.applyForLoan(testUser, com.kalpanaafinance.dto.LoanApplyRequest.builder()
                .planId(personalPlan.getId())
                .amount(new BigDecimal("100000.00"))
                .durationMonths(12)
                .purpose("Medical")
                .build());

        assertNotNull(loan);
        assertEquals("UNDER_REVIEW", loan.getStatus());

        // Update rate in database before approval
        LoanPlanRate rateConfig = loanPlanRateRepository.findByLoanPlanIdAndDurationMonths(personalPlan.getId(), 12)
                .orElseThrow();
        rateConfig.setAnnualInterestRate(new BigDecimal("14.50"));
        loanPlanRateRepository.saveAndFlush(rateConfig);

        // Admin approves loan -> Rate Locking Rule triggers
        Loan approved = loanService.approveLoan(adminUser.getId(), loan.getId(), new BigDecimal("100000.00"));

        assertEquals("ACTIVE", approved.getStatus());
        assertEquals(0, new BigDecimal("14.50").compareTo(approved.getInterestRate()), "Approved loan must lock current DB rate at approval time");
    }

    @Test
    @DisplayName("Test 3: Atomic Dual-Table Wallet Disbursement")
    void testAtomicLoanDisbursementDualTable() {
        BigDecimal initialUserBal = testUser.getBalance();
        BigDecimal initialAccBal = testAccount.getBalance();

        Loan loan = loanService.applyForLoan(testUser, com.kalpanaafinance.dto.LoanApplyRequest.builder()
                .planId(personalPlan.getId())
                .amount(new BigDecimal("50000.00"))
                .durationMonths(12)
                .purpose("Medical")
                .build());

        Loan approved = loanService.approveLoan(adminUser.getId(), loan.getId(), new BigDecimal("50000.00"));

        User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
        Account updatedAcc = accountRepository.findById(testAccount.getId()).orElseThrow();

        assertEquals(0, updatedUser.getBalance().compareTo(initialUserBal.add(new BigDecimal("50000.00"))));
        assertEquals(0, updatedAcc.getBalance().compareTo(initialAccBal.add(new BigDecimal("50000.00"))));
    }

    @Test
    @DisplayName("Test 4: Pay-EMI Atomic Concurrency Guard (2 Parallel Threads)")
    void testConcurrentDoubleEmiPayment() throws InterruptedException {
        // Setup approved loan with funds
        Loan loan = loanService.applyForLoan(testUser, com.kalpanaafinance.dto.LoanApplyRequest.builder()
                .planId(personalPlan.getId())
                .amount(new BigDecimal("10000.00"))
                .durationMonths(6)
                .purpose("Personal")
                .build());

        Loan approved = loanService.approveLoan(adminUser.getId(), loan.getId(), new BigDecimal("10000.00"));
        List<LoanEmi> emis = loanEmiRepository.findByLoanIdOrderByDueDateAsc(approved.getId());
        LoanEmi emiToPay = emis.get(0);

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch latch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);

        for (int i = 0; i < 2; i++) {
            executor.submit(() -> {
                try {
                    latch.await();
                    User u = userRepository.findById(testUser.getId()).orElseThrow();
                    loanService.payEmi(u, emiToPay.getId());
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failCount.incrementAndGet();
                }
            });
        }

        latch.countDown(); // Release threads simultaneously
        executor.shutdown();
        assertTrue(executor.awaitTermination(10, TimeUnit.SECONDS));

        assertEquals(1, successCount.get(), "Exactly ONE thread must succeed paying the EMI");
        assertEquals(1, failCount.get(), "Exactly ONE thread must fail due to atomic conditional status update");

        LoanEmi updatedEmi = loanEmiRepository.findById(emiToPay.getId()).orElseThrow();
        assertEquals("PAID", updatedEmi.getStatus());
    }

    @Test
    @DisplayName("Test 5: Early Payoff Calculation & Cancellation of Remaining EMIs")
    void testEarlyPayoffCalculationAndCancellation() {
        Loan loan = loanService.applyForLoan(testUser, com.kalpanaafinance.dto.LoanApplyRequest.builder()
                .planId(personalPlan.getId())
                .amount(new BigDecimal("10000.00"))
                .durationMonths(6)
                .purpose("Personal")
                .build());

        Loan approved = loanService.approveLoan(adminUser.getId(), loan.getId(), new BigDecimal("10000.00"));

        // User executes early loan payoff
        loanService.payoffLoan(testUser, approved.getId());

        Loan completedLoan = loanRepository.findById(approved.getId()).orElseThrow();
        assertEquals("COMPLETED", completedLoan.getStatus());
        assertEquals(0, completedLoan.getOutstandingBalance().compareTo(BigDecimal.ZERO));

        List<LoanEmi> emis = loanEmiRepository.findByLoanIdOrderByDueDateAsc(approved.getId());
        assertTrue(emis.stream().allMatch(e -> "CANCELLED_EARLY_PAYOFF".equals(e.getStatus()) || "PAID".equals(e.getStatus())));
    }
}
