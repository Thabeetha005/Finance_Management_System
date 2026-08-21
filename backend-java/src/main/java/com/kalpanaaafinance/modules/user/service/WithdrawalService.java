package com.kalpanaaafinance.modules.user.service;

import com.kalpanaaafinance.modules.shared.dto.*;
import com.kalpanaaafinance.modules.shared.entity.BankAccount;
import com.kalpanaaafinance.modules.shared.entity.Transaction;
import com.kalpanaaafinance.modules.shared.entity.User;
import com.kalpanaaafinance.modules.shared.entity.Withdrawal;
import com.kalpanaaafinance.modules.shared.entity.Notification;
import com.kalpanaaafinance.modules.shared.entity.AuditLog;
import com.kalpanaaafinance.modules.shared.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WithdrawalService {

    public static final BigDecimal MIN_WITHDRAWAL_AMOUNT = new BigDecimal("500.00");
    public static final BigDecimal MAX_TXN_WITHDRAWAL_AMOUNT = new BigDecimal("200000.00");
    public static final BigDecimal MAX_DAILY_WITHDRAWAL_LIMIT = new BigDecimal("200000.00");
    public static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final BankAccountRepository bankAccountRepository;
    private final WithdrawalRepository withdrawalRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;

    public WithdrawalEligibilityResponse getWithdrawalEligibility(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        List<BankAccount> verifiedAccounts = bankAccountRepository.findByUserIdAndIsVerifiedTrue(userId);
        List<BankAccountSnapshotDTO> bankSnapshots = verifiedAccounts.stream()
                .map(ba -> BankAccountSnapshotDTO.builder()
                        .bankAccountId(ba.getId())
                        .accountHolderName(ba.getAccountHolderName())
                        .bankName(ba.getBankName())
                        .accountNumberMasked(ba.getMaskedAccountNumber())
                        .ifscCode(ba.getIfscCode())
                        .build())
                .collect(Collectors.toList());

        BigDecimal totalWalletBalance = user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO;
        BigDecimal depositBalance = user.getDepositBalance() != null ? user.getDepositBalance() : BigDecimal.ZERO;
        BigDecimal pendingWithdrawalAmount = withdrawalRepository.sumPendingAndApprovedByUserId(userId);
        if (pendingWithdrawalAmount == null) pendingWithdrawalAmount = BigDecimal.ZERO;

        BigDecimal availableToWithdraw = depositBalance.subtract(pendingWithdrawalAmount);
        if (availableToWithdraw.compareTo(BigDecimal.ZERO) < 0) {
            availableToWithdraw = BigDecimal.ZERO;
        }

        ZonedDateTime nowIST = ZonedDateTime.now(IST_ZONE);
        LocalDateTime startOfDay = nowIST.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = nowIST.toLocalDate().atTime(LocalTime.MAX);

        BigDecimal dailyWithdrawnToday = withdrawalRepository.sumTodayWithdrawalsByUserId(userId, startOfDay, endOfDay);
        if (dailyWithdrawnToday == null) dailyWithdrawnToday = BigDecimal.ZERO;

        BigDecimal dailyLimitRemaining = MAX_DAILY_WITHDRAWAL_LIMIT.subtract(dailyWithdrawnToday);
        if (dailyLimitRemaining.compareTo(BigDecimal.ZERO) < 0) {
            dailyLimitRemaining = BigDecimal.ZERO;
        }

        boolean isCustomerVerified = Boolean.TRUE.equals(user.getIsVerified());
        boolean isBankVerified = !verifiedAccounts.isEmpty();
        boolean isUnlocked = isCustomerVerified && isBankVerified;

        List<String> lockReasons = new ArrayList<>();
        if (!isCustomerVerified) {
            lockReasons.add("Account identity verification (PAN/Aadhaar) is required.");
        }
        if (!isBankVerified) {
            lockReasons.add("A verified destination bank account is required.");
        }
        if (availableToWithdraw.compareTo(MIN_WITHDRAWAL_AMOUNT) < 0) {
            lockReasons.add("Insufficient available wallet balance (Min ₹500 required).");
        }

        return WithdrawalEligibilityResponse.builder()
                .isCustomerVerified(isCustomerVerified)
                .isBankAccountVerified(isBankVerified)
                .isWithdrawalUnlocked(isUnlocked)
                .totalWalletBalance(totalWalletBalance)
                .pendingWithdrawalAmount(pendingWithdrawalAmount)
                .availableToWithdraw(availableToWithdraw)
                .minWithdrawalLimit(MIN_WITHDRAWAL_AMOUNT)
                .maxTxnLimit(MAX_TXN_WITHDRAWAL_AMOUNT)
                .dailyLimit(MAX_DAILY_WITHDRAWAL_LIMIT)
                .dailyWithdrawnToday(dailyWithdrawnToday)
                .dailyLimitRemaining(dailyLimitRemaining)
                .verifiedBankAccounts(bankSnapshots)
                .lockReasons(lockReasons)
                .build();
    }

    public WithdrawalPreviewResponse previewWithdrawal(Long userId, WithdrawalRequest request) {
        WithdrawalEligibilityResponse eligibility = getWithdrawalEligibility(userId);
        BankAccount bankAccount = bankAccountRepository.findByIdAndUserId(request.getBankAccountId(), userId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or unauthorized bank account."));

        if (!Boolean.TRUE.equals(bankAccount.getIsVerified())) {
            throw new IllegalArgumentException("Selected bank account is not verified.");
        }

        BigDecimal requested = request.getAmount() != null ? request.getAmount() : BigDecimal.ZERO;
        List<String> rejectionReasons = new ArrayList<>();

        if (requested.compareTo(MIN_WITHDRAWAL_AMOUNT) < 0) {
            rejectionReasons.add("Requested amount is below minimum limit of ₹500.00.");
        }
        if (requested.compareTo(MAX_TXN_WITHDRAWAL_AMOUNT) > 0) {
            rejectionReasons.add("Requested amount exceeds maximum single transaction limit of ₹2,00,000.00.");
        }
        if (requested.compareTo(eligibility.getAvailableToWithdraw()) > 0) {
            rejectionReasons.add("Requested amount exceeds current available to withdraw balance of ₹" + eligibility.getAvailableToWithdraw() + ".");
        }
        if (requested.compareTo(eligibility.getDailyLimitRemaining()) > 0) {
            rejectionReasons.add("Requested amount exceeds remaining daily withdrawal limit of ₹" + eligibility.getDailyLimitRemaining() + ".");
        }

        boolean isEligible = rejectionReasons.isEmpty() && Boolean.TRUE.equals(eligibility.getIsWithdrawalUnlocked());

        BigDecimal remainingBalancePreview = eligibility.getAvailableToWithdraw().subtract(requested);
        if (remainingBalancePreview.compareTo(BigDecimal.ZERO) < 0) {
            remainingBalancePreview = BigDecimal.ZERO;
        }

        BankAccountSnapshotDTO bankSnapshot = BankAccountSnapshotDTO.builder()
                .bankAccountId(bankAccount.getId())
                .accountHolderName(bankAccount.getAccountHolderName())
                .bankName(bankAccount.getBankName())
                .accountNumberMasked(bankAccount.getMaskedAccountNumber())
                .ifscCode(bankAccount.getIfscCode())
                .build();

        return WithdrawalPreviewResponse.builder()
                .totalWalletBalance(eligibility.getTotalWalletBalance())
                .pendingWithdrawalAmount(eligibility.getPendingWithdrawalAmount())
                .availableToWithdraw(eligibility.getAvailableToWithdraw())
                .requestedAmount(requested)
                .remainingBalancePreview(remainingBalancePreview)
                .dailyLimit(MAX_DAILY_WITHDRAWAL_LIMIT)
                .dailyWithdrawnToday(eligibility.getDailyWithdrawnToday())
                .dailyLimitRemaining(eligibility.getDailyLimitRemaining())
                .isEligible(isEligible)
                .rejectionReasons(rejectionReasons)
                .bankAccount(bankSnapshot)
                .build();
    }

    @Transactional
    public WithdrawalResponse requestWithdrawal(Long userId, WithdrawalRequest request) {
        // Section 0 Concurrency Guard: Acquire FOR UPDATE lock on user record
        User user = userRepository.findByIdForUpdate(userId);
        if (user == null) {
            throw new IllegalArgumentException("User not found: " + userId);
        }

        BankAccount bankAccount = bankAccountRepository.findByIdAndUserId(request.getBankAccountId(), userId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid destination bank account."));

        if (!Boolean.TRUE.equals(bankAccount.getIsVerified())) {
            throw new IllegalArgumentException("Destination bank account is not verified.");
        }

        if (!Boolean.TRUE.equals(user.getIsVerified())) {
            throw new IllegalStateException("Withdrawals locked. Customer identity verification required.");
        }

        BigDecimal requested = request.getAmount();
        if (requested == null || requested.compareTo(MIN_WITHDRAWAL_AMOUNT) < 0) {
            throw new IllegalArgumentException("Minimum withdrawal amount is ₹500.00.");
        }
        if (requested.compareTo(MAX_TXN_WITHDRAWAL_AMOUNT) > 0) {
            throw new IllegalArgumentException("Maximum single withdrawal transaction limit is ₹2,00,000.00.");
        }

        BigDecimal depositBalance = user.getDepositBalance() != null ? user.getDepositBalance() : BigDecimal.ZERO;
        BigDecimal pendingSum = withdrawalRepository.sumPendingAndApprovedByUserId(userId);
        if (pendingSum == null) pendingSum = BigDecimal.ZERO;

        BigDecimal available = depositBalance.subtract(pendingSum);
        if (requested.compareTo(available) > 0) {
            throw new IllegalStateException("Insufficient withdrawable balance. (Bonus balance cannot be withdrawn). Available: ₹" + available);
        }

        ZonedDateTime nowIST = ZonedDateTime.now(IST_ZONE);
        LocalDateTime startOfDay = nowIST.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = nowIST.toLocalDate().atTime(LocalTime.MAX);

        BigDecimal dailyToday = withdrawalRepository.sumTodayWithdrawalsByUserId(userId, startOfDay, endOfDay);
        if (dailyToday == null) dailyToday = BigDecimal.ZERO;

        if (dailyToday.add(requested).compareTo(MAX_DAILY_WITHDRAWAL_LIMIT) > 0) {
            BigDecimal remaining = MAX_DAILY_WITHDRAWAL_LIMIT.subtract(dailyToday);
            throw new IllegalStateException("Withdrawal exceeds daily limit of ₹2,00,000. Remaining today: ₹" + remaining);
        }

        String reference = "WD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        LocalDateTime now = LocalDateTime.now();

        Withdrawal withdrawal = Withdrawal.builder()
                .userId(userId)
                .bankAccountId(bankAccount.getId())
                .accountHolderName(bankAccount.getAccountHolderName())
                .bankName(bankAccount.getBankName())
                .accountNumberMasked(bankAccount.getMaskedAccountNumber())
                .ifscCode(bankAccount.getIfscCode())
                .amount(requested)
                .status("PENDING")
                .referenceNumber(reference)
                .requestedAt(now)
                .build();

        withdrawal = withdrawalRepository.save(withdrawal);

        notificationRepository.save(Notification.builder()
                .user(user)
                .title("Withdrawal Request Submitted")
                .message("Your withdrawal request of ₹" + requested + " (Ref: " + reference + ") has been submitted and is currently pending admin review.")
                .type("INFO")
                .isRead(false)
                .build());

        auditLogRepository.save(AuditLog.builder()
                .adminUsername("system")
                .adminName("System")
                .action("WITHDRAWAL_REQUESTED")
                .targetType("WITHDRAWAL")
                .targetId(withdrawal.getId())
                .description("Created PENDING withdrawal " + reference + " for ₹" + requested)
                .build());

        return mapToResponse(withdrawal, user);
    }

    @Transactional
    public WithdrawalResponse approveWithdrawal(Long withdrawalId, Long adminId) {
        LocalDateTime now = LocalDateTime.now();
        // Section 13: Atomic Status Guard
        int rows = withdrawalRepository.atomicTransitionStatus(withdrawalId, "PENDING", "APPROVED", now);
        if (rows == 0) {
            throw new IllegalStateException("Withdrawal request has already been actioned or processed.");
        }

        Withdrawal withdrawal = withdrawalRepository.findById(withdrawalId)
                .orElseThrow(() -> new IllegalArgumentException("Withdrawal not found: " + withdrawalId));

        User user = userRepository.findByIdForUpdate(withdrawal.getUserId());
        if (user == null) {
            throw new IllegalArgumentException("Customer user not found.");
        }

        BigDecimal amount = withdrawal.getAmount();

        // Section 0 Phase 2: Perform atomic wallet balance decrement
        int userUpdated = userRepository.atomicDebitBalanceChecked(user.getId(), amount);
        int accountUpdated = accountRepository.atomicDebitBalanceChecked(user.getId(), amount);

        if (userUpdated == 0 || accountUpdated == 0) {
            throw new IllegalStateException("Atomic balance decrement failed. Insufficient stored balance at approval time.");
        }

        // Re-read user to capture exact balanceBefore and balanceAfter
        User updatedUser = userRepository.findById(user.getId()).orElseThrow();
        BigDecimal balanceAfter = updatedUser.getBalance();
        BigDecimal balanceBefore = balanceAfter.add(amount);

        // Section 14: Save COMPLETED Transaction Record
        Transaction tx = Transaction.builder()
                .userId(user.getId())
                .amount(amount.negate())
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .type("WITHDRAWAL")
                .status("COMPLETED")
                .description("Wallet Withdrawal Approved (Ref: " + withdrawal.getReferenceNumber() + ")")
                .referenceEntity("WITHDRAWAL")
                .referenceId(withdrawal.getId())
                .date(now)
                .build();
        transactionRepository.save(tx);

        // Transition status to COMPLETED
        withdrawalRepository.atomicComplete(withdrawalId, balanceBefore, balanceAfter, adminId, now);
        withdrawal.setStatus("COMPLETED");
        withdrawal.setBalanceBefore(balanceBefore);
        withdrawal.setBalanceAfter(balanceAfter);
        withdrawal.setAdminId(adminId);
        withdrawal.setCompletedAt(now);

        auditLogRepository.save(AuditLog.builder()
                .adminUsername("admin_" + adminId)
                .adminName("Admin #" + adminId)
                .action("WITHDRAWAL_APPROVED")
                .targetType("WITHDRAWAL")
                .targetId(withdrawal.getId())
                .description("Admin ID " + adminId + " approved withdrawal " + withdrawal.getReferenceNumber() + " of ₹" + amount)
                .build());

        notificationRepository.save(Notification.builder()
                .user(user)
                .title("Withdrawal Completed")
                .message("Your withdrawal of ₹" + amount + " (Ref: " + withdrawal.getReferenceNumber() + ") has been approved and successfully processed to " + withdrawal.getBankName() + " (" + withdrawal.getAccountNumberMasked() + ").")
                .type("SUCCESS")
                .isRead(false)
                .build());

        return mapToResponse(withdrawal, user);
    }

    @Transactional
    public WithdrawalResponse rejectWithdrawal(Long withdrawalId, Long adminId, String rejectionReason) {
        if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection reason is required.");
        }

        LocalDateTime now = LocalDateTime.now();
        // Section 15: Atomic Rejection Guard
        int rows = withdrawalRepository.atomicReject(withdrawalId, rejectionReason.trim(), adminId, now);
        if (rows == 0) {
            throw new IllegalStateException("Withdrawal request has already been actioned or approved.");
        }

        Withdrawal withdrawal = withdrawalRepository.findById(withdrawalId).orElseThrow();
        User user = userRepository.findById(withdrawal.getUserId()).orElse(null);

        auditLogRepository.save(AuditLog.builder()
                .adminUsername("admin_" + adminId)
                .adminName("Admin #" + adminId)
                .action("WITHDRAWAL_REJECTED")
                .targetType("WITHDRAWAL")
                .targetId(withdrawal.getId())
                .description("Admin ID " + adminId + " rejected withdrawal " + withdrawal.getReferenceNumber() + ". Reason: " + rejectionReason)
                .build());

        if (user != null) {
            notificationRepository.save(Notification.builder()
                    .user(user)
                    .title("Withdrawal Request Rejected")
                    .message("Your withdrawal request of ₹" + withdrawal.getAmount() + " (Ref: " + withdrawal.getReferenceNumber() + ") was rejected. Reason: " + rejectionReason)
                    .type("WARNING")
                    .isRead(false)
                    .build());
        }

        return mapToResponse(withdrawal, user);
    }

    public List<WithdrawalResponse> getMyWithdrawals(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        return withdrawalRepository.findByUserIdOrderByRequestedAtDesc(userId).stream()
                .map(w -> mapToResponse(w, user))
                .collect(Collectors.toList());
    }

    public List<WithdrawalResponse> getAllWithdrawalsForAdmin() {
        return withdrawalRepository.findAllByOrderByRequestedAtDesc().stream()
                .map(w -> {
                    User user = userRepository.findById(w.getUserId()).orElse(null);
                    return mapToResponse(w, user);
                })
                .collect(Collectors.toList());
    }

    private WithdrawalResponse mapToResponse(Withdrawal w, User user) {
        return WithdrawalResponse.builder()
                .id(w.getId())
                .userId(w.getUserId())
                .customerName(user != null ? user.getName() : "Customer #" + w.getUserId())
                .customerEmail(user != null ? user.getEmail() : "")
                .bankAccountId(w.getBankAccountId())
                .accountHolderName(w.getAccountHolderName())
                .bankName(w.getBankName())
                .accountNumberMasked(w.getAccountNumberMasked())
                .ifscCode(w.getIfscCode())
                .amount(w.getAmount())
                .status(w.getStatus())
                .balanceBefore(w.getBalanceBefore())
                .balanceAfter(w.getBalanceAfter())
                .referenceNumber(w.getReferenceNumber())
                .rejectionReason(w.getRejectionReason())
                .adminId(w.getAdminId())
                .requestedAt(w.getRequestedAt())
                .approvedAt(w.getApprovedAt())
                .processedAt(w.getProcessedAt())
                .completedAt(w.getCompletedAt())
                .rejectedAt(w.getRejectedAt())
                .build();
    }
}
