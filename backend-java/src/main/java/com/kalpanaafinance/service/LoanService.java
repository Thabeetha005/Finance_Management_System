package com.kalpanaafinance.service;

import com.kalpanaafinance.dto.*;
import com.kalpanaafinance.entity.*;
import com.kalpanaafinance.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanPlanRepository loanPlanRepository;
    private final LoanPlanRateRepository loanPlanRateRepository;
    private final LoanRepository loanRepository;
    private final LoanEmiRepository loanEmiRepository;
    private final LoanInstallmentRepository loanInstallmentRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final DocumentRepository documentRepository;
    private final ApplicationDocumentRepository applicationDocumentRepository;
    private final AuditService auditService;
    private final MessageService messageService;

    public LoanCalculateResponse calculateEmi(LoanCalculateRequest request) {
        if (request.getPlanId() == null || request.getAmount() == null || request.getDurationMonths() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Plan ID, Amount, and Duration Months are required");
        }

        LoanPlan plan = loanPlanRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Loan plan not found"));

        if (request.getAmount().compareTo(plan.getMinAmount()) < 0 || request.getAmount().compareTo(plan.getMaxAmount()) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Requested amount ₹" + request.getAmount() + " is outside plan limits (Min: ₹" + plan.getMinAmount() + ", Max: ₹" + plan.getMaxAmount() + ")");
        }

        LoanPlanRate rateConfig = loanPlanRateRepository.findByLoanPlanIdAndDurationMonths(plan.getId(), request.getDurationMonths())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                        "Duration " + request.getDurationMonths() + " months is not available for " + plan.getName()));

        BigDecimal annualRate = rateConfig.getAnnualInterestRate();
        int n = request.getDurationMonths();
        BigDecimal principal = request.getAmount();

        // Monthly Reducing-Balance Calculation using BigDecimal (RoundingMode.HALF_UP)
        // R = AnnualRate / (12 * 100) = AnnualRate / 1200
        BigDecimal monthlyRate = annualRate.divide(new BigDecimal("1200"), 10, RoundingMode.HALF_UP);

        BigDecimal monthlyEmi;
        if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
            monthlyEmi = principal.divide(new BigDecimal(n), 2, RoundingMode.HALF_UP);
        } else {
            // Formula: P * R * (1+R)^N / ((1+R)^N - 1)
            BigDecimal rPlusOne = BigDecimal.ONE.add(monthlyRate);
            BigDecimal compoundFactor = rPlusOne.pow(n); // (1+R)^N
            BigDecimal numerator = principal.multiply(monthlyRate).multiply(compoundFactor);
            BigDecimal denominator = compoundFactor.subtract(BigDecimal.ONE);
            monthlyEmi = numerator.divide(denominator, 2, RoundingMode.HALF_UP);
        }

        BigDecimal totalRepayment = monthlyEmi.multiply(new BigDecimal(n));
        BigDecimal totalInterest = totalRepayment.subtract(principal);

        LocalDate startDate = LocalDate.now();
        LocalDate firstEmiDate = startDate.plusMonths(1);
        LocalDate finalEmiDate = startDate.plusMonths(n);

        return LoanCalculateResponse.builder()
                .planId(plan.getId())
                .planName(plan.getName())
                .requestedAmount(principal)
                .durationMonths(n)
                .annualInterestRate(annualRate)
                .estimatedMonthlyEmi(monthlyEmi)
                .estimatedTotalInterest(totalInterest)
                .estimatedTotalRepayment(totalRepayment)
                .firstEmiDate(firstEmiDate)
                .finalEmiDate(finalEmiDate)
                .build();
    }

    @Transactional
    public Loan applyForLoan(User user, LoanApplyRequest request) {
        LoanCalculateResponse calc = calculateEmi(LoanCalculateRequest.builder()
                .planId(request.getPlanId())
                .amount(request.getAmount())
                .durationMonths(request.getDurationMonths())
                .build());

        LoanPlan plan = loanPlanRepository.findById(request.getPlanId()).orElseThrow();

        Loan loan = Loan.builder()
                .user(user)
                .loanPlan(plan)
                .amount(calc.getRequestedAmount())
                .durationMonths(calc.getDurationMonths())
                .tenureMonths(calc.getDurationMonths())
                .interestRate(calc.getAnnualInterestRate())
                .purpose(request.getPurpose() != null ? request.getPurpose() : plan.getName())
                .estimatedEmi(calc.getEstimatedMonthlyEmi())
                .estimatedInterest(calc.getEstimatedTotalInterest())
                .estimatedRepayment(calc.getEstimatedTotalRepayment())
                .firstEmiDate(calc.getFirstEmiDate())
                .finalEmiDate(calc.getFinalEmiDate())
                .overallOutstandingAmount(BigDecimal.ZERO)
                .overallPaidAmount(BigDecimal.ZERO)
                .status(com.kalpanaafinance.enums.LoanStatus.APPLICATION_SUBMITTED.name())
                .applicationStatus(com.kalpanaafinance.enums.LoanStatus.APPLICATION_SUBMITTED.name())
                .legacyUnverified(false)
                .build();

        Loan savedLoan = loanRepository.save(loan);

        // Automatic Document Reuse & Linking
        List<Document> userVerifiedDocs = documentRepository.findByUserId(user.getId()).stream()
                .filter(d -> "VERIFIED".equalsIgnoreCase(d.getVerificationStatus()) || "APPROVED".equalsIgnoreCase(d.getVerificationStatus()))
                .toList();

        for (Document verifiedDoc : userVerifiedDocs) {
            applicationDocumentRepository.findByApplicationIdAndApplicationTypeAndDocumentType(savedLoan.getId(), "LOAN", verifiedDoc.getDocumentType())
                    .orElseGet(() -> applicationDocumentRepository.save(ApplicationDocument.builder()
                            .applicationId(savedLoan.getId())
                            .applicationType("LOAN")
                            .document(verifiedDoc)
                            .documentType(verifiedDoc.getDocumentType())
                            .isNewlyUploaded(false)
                            .build()));
        }

        auditService.logAction(user.getEmail(), "LOAN_APPLICATION_SUBMITTED", "LOAN", savedLoan.getId(),
                "Submitted application for " + plan.getName() + " of ₹" + request.getAmount(), "127.0.0.1");

        messageService.sendSystemMessage(user.getId(), "Loan Application Submitted",
                "Your loan application has been successfully submitted.",
                Message.EntityType.LOAN, savedLoan.getId());

        return savedLoan;
    }

    @Transactional
    public Loan startReview(Long adminId, Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Loan application not found"));

        loan.setStatus(com.kalpanaafinance.enums.LoanStatus.UNDER_REVIEW.name());
        loan.setApplicationStatus(com.kalpanaafinance.enums.LoanStatus.UNDER_REVIEW.name());
        Loan saved = loanRepository.save(loan);

        auditService.logAction("admin-" + adminId, "LOAN_UNDER_REVIEW", "LOAN", loanId,
                "Admin started review for loan ID #" + loanId, "127.0.0.1");

        messageService.sendSystemMessage(loan.getUser().getId(), "Loan Application Under Review",
                "Your loan application is currently under review.",
                Message.EntityType.LOAN, loanId);

        return saved;
    }

    @Transactional
    public Loan approveLoan(Long adminId, Long loanId, BigDecimal approvedAmount) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Loan application not found"));

        LoanPlan plan = loan.getLoanPlan();
        if (plan == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loan is missing plan mapping");
        }

        // Lock Rate & Approved Principal
        LoanPlanRate currentRateConfig = loanPlanRateRepository.findByLoanPlanIdAndDurationMonths(plan.getId(), loan.getDurationMonths())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Plan rate configuration not found"));

        BigDecimal lockedAnnualRate = currentRateConfig.getAnnualInterestRate();
        BigDecimal principal = (approvedAmount != null && approvedAmount.compareTo(BigDecimal.ZERO) > 0) ? approvedAmount : loan.getAmount();
        int n = loan.getDurationMonths();

        // Calculate locked EMI
        BigDecimal monthlyRate = lockedAnnualRate.divide(new BigDecimal("1200"), 10, RoundingMode.HALF_UP);
        BigDecimal emiAmount;
        if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
            emiAmount = principal.divide(new BigDecimal(n), 2, RoundingMode.HALF_UP);
        } else {
            BigDecimal rPlusOne = BigDecimal.ONE.add(monthlyRate);
            BigDecimal compoundFactor = rPlusOne.pow(n);
            BigDecimal numerator = principal.multiply(monthlyRate).multiply(compoundFactor);
            BigDecimal denominator = compoundFactor.subtract(BigDecimal.ONE);
            emiAmount = numerator.divide(denominator, 2, RoundingMode.HALF_UP);
        }

        BigDecimal totalRepayment = emiAmount.multiply(new BigDecimal(n));

        // Lock Approved Status
        loan.setInterestRate(lockedAnnualRate);
        loan.setApprovedAmount(principal);
        loan.setEstimatedEmi(emiAmount);
        loan.setOutstandingBalance(totalRepayment);
        loan.setOverallOutstandingAmount(totalRepayment);
        loan.setOverallPaidAmount(BigDecimal.ZERO);
        loan.setStatus(com.kalpanaafinance.enums.LoanStatus.APPROVED.name());
        loan.setApplicationStatus(com.kalpanaafinance.enums.LoanStatus.APPROVED.name());
        loan.setApprovedAt(LocalDateTime.now());

        User customer = loan.getUser();
        customer.setIsVerified(true);
        userRepository.save(customer);

        Loan approvedLoan = loanRepository.save(loan);

        auditService.logAction("admin-" + adminId, "LOAN_APPROVED", "LOAN", loan.getId(),
                "Approved loan ID #" + loan.getId() + " of ₹" + principal + " with locked rate " + lockedAnnualRate + "%", "127.0.0.1");

        messageService.sendSystemMessage(customer.getId(), "Loan Application Approved",
                "Your loan application of ₹" + principal + " has been approved and is awaiting disbursement.",
                Message.EntityType.LOAN, loan.getId());

        return approvedLoan;
    }

    @Transactional
    public Loan disburseLoan(Long adminId, Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Loan application not found"));

        if (!com.kalpanaafinance.enums.LoanStatus.APPROVED.name().equals(loan.getStatus()) &&
            !com.kalpanaafinance.enums.LoanStatus.DISBURSED.name().equals(loan.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loan must be in APPROVED state before disbursement.");
        }

        User customer = loan.getUser();
        BigDecimal principal = loan.getApprovedAmount() != null ? loan.getApprovedAmount() : loan.getAmount();

        // Credit Principal to Customer Wallet via dual-table atomic credit
        Account customerAccount = accountRepository.findByUserIdAndTypeForUpdate(customer.getId(), "WALLET")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer wallet account not found"));

        BigDecimal balanceBefore = customerAccount.getBalance();
        int accountsUpdated = accountRepository.atomicCreditBalance(customer.getId(), principal);
        int usersUpdated = userRepository.atomicCreditBalance(customer.getId(), principal);
        userRepository.atomicCreditDepositBalance(customer.getId(), principal);

        if (accountsUpdated != 1 || usersUpdated != 1) {
            throw new IllegalStateException("CRITICAL BALANCE DESYNC ALERT: Dual-table loan disbursement credit failed.");
        }

        // Record Transaction Audit Log
        Transaction tx = Transaction.builder()
                .userId(customer.getId())
                .account(customerAccount)
                .amount(principal)
                .type("LOAN_DISBURSEMENT")
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceBefore.add(principal))
                .withdrawableBalanceBefore(balanceBefore)
                .withdrawableBalanceAfter(balanceBefore.add(principal))
                .withdrawalEligible(true)
                .status("COMPLETED")
                .date(LocalDateTime.now())
                .description("Disbursement for approved " + (loan.getLoanPlan() != null ? loan.getLoanPlan().getName() : loan.getPurpose()) + " (Loan ID #" + loan.getId() + ")")
                .referenceEntity("LOAN")
                .referenceId(loan.getId())
                .build();
        transactionRepository.save(tx);

        // Generate EMI Schedule starting from disbursement date
        LocalDate startDate = LocalDate.now();
        int fixedDueDay = startDate.getDayOfMonth();
        int n = loan.getDurationMonths();
        BigDecimal emiAmount = loan.getEstimatedEmi();
        BigDecimal totalRepayment = loan.getOutstandingBalance();
        BigDecimal sumEmi = BigDecimal.ZERO;

        // Clear existing EMIs if any
        List<LoanInstallment> existingInstallments = loanInstallmentRepository.findByLoanIdOrderByInstallmentNumberAsc(loan.getId());
        if (!existingInstallments.isEmpty()) {
            loanInstallmentRepository.deleteAll(existingInstallments);
        }

        for (int i = 1; i <= n; i++) {
            BigDecimal currentEmiAmount = emiAmount;
            if (i == n && totalRepayment != null && totalRepayment.compareTo(BigDecimal.ZERO) > 0) {
                currentEmiAmount = totalRepayment.subtract(sumEmi);
            }
            sumEmi = sumEmi.add(currentEmiAmount);

            LocalDate currentDueDate = startDate.plusMonths(i);
            int targetMonthLen = currentDueDate.lengthOfMonth();
            int dayToSet = Math.min(fixedDueDay, targetMonthLen);
            currentDueDate = LocalDate.of(currentDueDate.getYear(), currentDueDate.getMonth(), dayToSet);

            String initialStatus = (i == 1) ? com.kalpanaafinance.enums.EmiStatus.PENDING.name() : com.kalpanaafinance.enums.EmiStatus.UPCOMING.name();

            LoanInstallment installment = LoanInstallment.builder()
                    .loan(loan)
                    .installmentNumber(i)
                    .monthYear(currentDueDate.getMonth().name() + " " + currentDueDate.getYear())
                    .amount(currentEmiAmount)
                    .amountDue(currentEmiAmount)
                    .amountPaid(BigDecimal.ZERO)
                    .dueDate(currentDueDate)
                    .status(initialStatus)
                    .build();
            loanInstallmentRepository.save(installment);
        }

        loan.setFirstEmiDate(startDate.plusMonths(1));
        loan.setFinalEmiDate(startDate.plusMonths(n));
        loan.setDisbursedAt(LocalDateTime.now());
        loan.setStatus(com.kalpanaafinance.enums.LoanStatus.ACTIVE.name());
        loan.setApplicationStatus(com.kalpanaafinance.enums.LoanStatus.ACTIVE.name());
        Loan disbursedLoan = loanRepository.save(loan);

        auditService.logAction("admin-" + adminId, "LOAN_DISBURSED", "LOAN", loan.getId(),
                "Disbursed loan ID #" + loan.getId() + " of ₹" + principal + " to customer wallet.", "127.0.0.1");

        messageService.sendSystemMessage(customer.getId(), "Loan Disbursed & Active!",
                "Your loan of ₹" + principal + " has been disbursed to your wallet. Your loan is now active. Your next EMI of ₹" + emiAmount + " is due on " + startDate.plusMonths(1) + ".",
                Message.EntityType.LOAN, loan.getId());

        return disbursedLoan;
    }

    @Transactional
    public Loan requestResubmission(Long adminId, Long loanId, String reason) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Loan application not found"));

        loan.setStatus(com.kalpanaafinance.enums.LoanStatus.DOCUMENTS_REQUIRED.name());
        loan.setApplicationStatus(com.kalpanaafinance.enums.LoanStatus.DOCUMENTS_REQUIRED.name());
        loan.setResubmissionReason(reason);
        Loan saved = loanRepository.save(loan);

        auditService.logAction("admin-" + adminId, "LOAN_DOCUMENTS_REQUIRED", "LOAN", loanId,
                "Requested document resubmission for loan ID #" + loanId, "127.0.0.1");

        messageService.sendSystemMessage(loan.getUser().getId(), "Documents Required",
                "Additional documents are required for your loan application. Reason: " + reason,
                Message.EntityType.LOAN, loanId);

        return saved;
    }

    @Transactional
    public Loan rejectLoan(Long adminId, Long loanId, String reason) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Loan application not found"));

        loan.setStatus(com.kalpanaafinance.enums.LoanStatus.REJECTED.name());
        loan.setApplicationStatus(com.kalpanaafinance.enums.LoanStatus.REJECTED.name());
        loan.setResubmissionReason(reason);
        Loan saved = loanRepository.save(loan);

        auditService.logAction("admin-" + adminId, "LOAN_REJECTED", "LOAN", loanId,
                "Rejected loan application ID #" + loanId, "127.0.0.1");

        messageService.sendSystemMessage(loan.getUser().getId(), "Loan Application Rejected",
                "Your loan application has been rejected. Reason: " + reason,
                Message.EntityType.LOAN, loanId);

        return saved;
    }

    @Transactional(readOnly = true)
    public EmiOverviewDTO getEmiOverview(Long userId, Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Loan not found"));

        if (!loan.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized access to loan");
        }

        List<LoanInstallment> allInstallments = loanInstallmentRepository.findByLoanIdOrderByInstallmentNumberAsc(loanId);

        // Find the SINGLE current actionable EMI:
        // Priority 1: Oldest OVERDUE installment
        // Priority 2: Lowest installmentNumber PENDING installment
        // Priority 3: Next UPCOMING installment
        LoanInstallment currentActionable = allInstallments.stream()
                .filter(i -> "OVERDUE".equalsIgnoreCase(i.getStatus()))
                .findFirst()
                .orElseGet(() -> allInstallments.stream()
                        .filter(i -> "PENDING".equalsIgnoreCase(i.getStatus()))
                        .findFirst()
                        .orElseGet(() -> allInstallments.stream()
                                .filter(i -> "UPCOMING".equalsIgnoreCase(i.getStatus()))
                                .findFirst()
                                .orElse(null)));

        LoanEmiDTO currentEmiDto = currentActionable != null ? mapToEmiDto(currentActionable) : null;

        List<LoanEmiDTO> historyDtos = allInstallments.stream()
                .filter(i -> "PAID".equalsIgnoreCase(i.getStatus()))
                .map(this::mapToEmiDto)
                .toList();

        return EmiOverviewDTO.builder()
                .currentEmi(currentEmiDto)
                .history(historyDtos)
                .build();
    }

    private LoanEmiDTO mapToEmiDto(LoanInstallment inst) {
        return LoanEmiDTO.builder()
                .id(inst.getId())
                .loanId(inst.getLoan().getId())
                .installmentNumber(inst.getInstallmentNumber())
                .monthYear(inst.getMonthYear())
                .amount(inst.getAmount() != null ? inst.getAmount() : inst.getAmountDue())
                .dueDate(inst.getDueDate())
                .status(inst.getStatus())
                .paidDate(inst.getPaidDate())
                .transactionId(inst.getTransactionId())
                .build();
    }

    @Transactional
    public LoanEmiDTO payEmi(User user, Long emiId) {
        LoanInstallment emi = loanInstallmentRepository.findById(emiId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "EMI installment not found"));

        Loan loan = emi.getLoan();
        if (!loan.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized loan payment attempt");
        }

        if ("PAID".equalsIgnoreCase(emi.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This EMI has already been paid.");
        }

        // Sequential check: Check if there is an older unpaid/overdue installment
        List<LoanInstallment> allInstallments = loanInstallmentRepository.findByLoanIdOrderByInstallmentNumberAsc(loan.getId());
        LoanInstallment olderUnpaid = allInstallments.stream()
                .filter(i -> i.getInstallmentNumber() < emi.getInstallmentNumber() && !"PAID".equalsIgnoreCase(i.getStatus()))
                .findFirst()
                .orElse(null);

        if (olderUnpaid != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "You cannot skip an unpaid EMI. Please pay Installment #" + olderUnpaid.getInstallmentNumber() + " (" + olderUnpaid.getMonthYear() + ") first.");
        }

        BigDecimal emiAmount = emi.getAmount() != null ? emi.getAmount() : emi.getAmountDue();
        BigDecimal availableBalance = user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO;

        // Balance Check & Shortfall Exception
        if (availableBalance.compareTo(emiAmount) < 0) {
            BigDecimal shortfall = emiAmount.subtract(availableBalance);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "SHORTFALL:" + emiAmount + ":" + availableBalance + ":" + shortfall);
        }

        LocalDateTime now = LocalDateTime.now();

        // Perform atomic balance debit
        int accountsUpdated = accountRepository.atomicDebitBalance(user.getId(), emiAmount);
        int usersUpdated = userRepository.atomicDebitBalance(user.getId(), emiAmount);

        if (accountsUpdated != 1 || usersUpdated != 1) {
            throw new IllegalStateException("Atomic wallet balance debit failed.");
        }

        User updatedUser = userRepository.findById(user.getId()).orElseThrow();
        BigDecimal balanceAfter = updatedUser.getBalance();
        BigDecimal balanceBefore = balanceAfter.add(emiAmount);

        // Record LOAN_EMI_PAYMENT Transaction
        Account account = accountRepository.findByUserIdAndType(user.getId(), "WALLET").orElse(null);
        Transaction tx = Transaction.builder()
                .userId(user.getId())
                .account(account)
                .amount(emiAmount.negate())
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .withdrawableBalanceBefore(balanceBefore)
                .withdrawableBalanceAfter(balanceAfter)
                .withdrawalEligible(true)
                .type("LOAN_EMI_PAYMENT")
                .status("COMPLETED")
                .description("EMI Payment for " + loan.getPurpose() + " (" + emi.getMonthYear() + ")")
                .referenceEntity("LOAN_EMI")
                .referenceId(emiId)
                .date(now)
                .build();
        Transaction savedTx = transactionRepository.save(tx);

        // Update EMI installment record
        emi.setStatus("PAID");
        emi.setPaidDate(now);
        emi.setTransactionId(savedTx.getId());
        loanInstallmentRepository.save(emi);

        // Transition next sequential EMI to PENDING if it was UPCOMING
        allInstallments.stream()
                .filter(i -> i.getInstallmentNumber() == emi.getInstallmentNumber() + 1 && "UPCOMING".equalsIgnoreCase(i.getStatus()))
                .findFirst()
                .ifPresent(next -> {
                    next.setStatus("PENDING");
                    loanInstallmentRepository.save(next);
                });

        // Update Loan Outstanding Balance
        BigDecimal newOutstanding = loan.getOutstandingBalance().subtract(emiAmount);
        if (newOutstanding.compareTo(BigDecimal.ZERO) < 0) newOutstanding = BigDecimal.ZERO;
        loan.setOutstandingBalance(newOutstanding);
        loan.setOverallOutstandingAmount(newOutstanding);
        loan.setOverallPaidAmount(loan.getOverallPaidAmount().add(emiAmount));

        if (newOutstanding.compareTo(BigDecimal.ZERO) == 0) {
            loan.setStatus("COMPLETED");
            loan.setCompletedAt(now);
        }
        loanRepository.save(loan);

        // AuditLog & Notification
        auditService.logAction(user.getEmail(), "EMI_PAYMENT_COMPLETED", "LOAN_EMI", emiId,
                "Paid EMI #" + emi.getInstallmentNumber() + " (" + emi.getMonthYear() + ") of ₹" + emiAmount + " for Loan #" + loan.getId(), "127.0.0.1");

        messageService.sendSystemMessage(user.getId(), "EMI Payment Successful",
                "Your " + emi.getMonthYear() + " EMI of ₹" + emiAmount + " has been successfully paid.",
                Message.EntityType.LOAN, loan.getId());

        return mapToEmiDto(emi);
    }

    @Transactional
    public void payoffLoan(User user, Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Loan not found"));

        if (!loan.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized loan payoff attempt");
        }

        if (!"ACTIVE".equals(loan.getStatus()) && !"APPROVED".equals(loan.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loan is not active");
        }

        List<LoanEmi> emis = loanEmiRepository.findByLoanIdOrderByDueDateAsc(loanId);
        List<LoanEmi> pendingEmis = emis.stream().filter(e -> "PENDING".equals(e.getStatus())).toList();

        if (pendingEmis.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No pending installments to pay off");
        }

        // Calculate Accrued Interest & Early Payoff Amount
        // Outstanding Principal = Approved Principal - Principal Paid
        BigDecimal outstandingPrincipal = loan.getOutstandingBalance(); 

        // Calculate Days Accrued since last payment or approved date
        LocalDateTime lastPaymentDate = loan.getApprovedAt();
        List<LoanEmi> paidEmis = emis.stream().filter(e -> "PAID".equals(e.getStatus())).toList();
        if (!paidEmis.isEmpty()) {
            LoanEmi lastPaid = paidEmis.get(paidEmis.size() - 1);
            if (lastPaid.getPaidDate() != null) {
                lastPaymentDate = lastPaid.getPaidDate();
            }
        }

        long daysAccrued = ChronoUnit.DAYS.between(lastPaymentDate != null ? lastPaymentDate : LocalDateTime.now().minusDays(1), LocalDateTime.now());
        if (daysAccrued < 1) daysAccrued = 1;

        // Accrued Interest = Outstanding Principal * (annualRate/100) * (days/365)
        BigDecimal annualRate = loan.getInterestRate();
        BigDecimal dailyRate = annualRate.divide(new BigDecimal("100"), 10, RoundingMode.HALF_UP)
                .divide(new BigDecimal("365"), 10, RoundingMode.HALF_UP);
        BigDecimal accruedInterest = outstandingPrincipal.multiply(dailyRate).multiply(new BigDecimal(daysAccrued))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal payoffAmount = outstandingPrincipal.add(accruedInterest).setScale(2, RoundingMode.HALF_UP);

        // Acquire lock and debit wallet
        Account account = accountRepository.findByUserIdAndTypeForUpdate(user.getId(), "WALLET")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet account not found"));

        if (account.getBalance().compareTo(payoffAmount) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Insufficient wallet balance to pay off loan of ₹" + payoffAmount + ". Available: ₹" + account.getBalance());
        }

        BigDecimal balanceBefore = account.getBalance();
        int accountsUpdated = accountRepository.atomicDebitBalance(user.getId(), payoffAmount);
        int usersUpdated = userRepository.atomicDebitBalance(user.getId(), payoffAmount);

        if (accountsUpdated != 1 || usersUpdated != 1) {
            throw new IllegalStateException("CRITICAL BALANCE DESYNC ALERT: Dual-table loan payoff debit failed.");
        }

        // Cancel remaining pending EMIs
        for (LoanEmi e : pendingEmis) {
            e.setStatus("CANCELLED_EARLY_PAYOFF");
            loanEmiRepository.save(e);
        }

        // Log Transaction
        Transaction tx = Transaction.builder()
                .account(account)
                .amount(payoffAmount)
                .type("LOAN_EARLY_PAYOFF")
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceBefore.subtract(payoffAmount))
                .date(LocalDateTime.now())
                .description("Early Payoff for Loan ID #" + loan.getId())
                .referenceEntity("LOAN")
                .referenceId(loanId)
                .build();
        transactionRepository.save(tx);

        loan.setOutstandingBalance(BigDecimal.ZERO);
        loan.setOverallOutstandingAmount(BigDecimal.ZERO);
        loan.setOverallPaidAmount(loan.getOverallPaidAmount().add(payoffAmount));
        loan.setStatus("COMPLETED");
        loan.setCompletedAt(LocalDateTime.now());
        loanRepository.save(loan);

        auditService.logAction(user.getEmail(), "LOAN_EARLY_PAYOFF", "LOAN", loanId, "Executed early payoff of ₹" + payoffAmount + " for loan #" + loanId, "127.0.0.1");
        messageService.sendSystemMessage(user.getId(), "Loan Paid Off!", 
                "Congratulations! Your loan #" + loanId + " has been paid off in full (Payoff Amount: ₹" + payoffAmount + ").", 
                Message.EntityType.LOAN, loanId);
    }
}
