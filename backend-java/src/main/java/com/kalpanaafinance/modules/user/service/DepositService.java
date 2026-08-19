package com.kalpanaafinance.modules.user.service;

import com.kalpanaafinance.modules.shared.service.AuditService;
import com.kalpanaafinance.modules.shared.service.MessageService;

import com.kalpanaafinance.dto.DepositCreateRequest;
import com.kalpanaafinance.modules.shared.entity.*;
import com.kalpanaafinance.modules.shared.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DepositService {

    private final DepositRepository depositRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final AuditService auditService;
    private final MessageService messageService;

    private static final BigDecimal MIN_DEPOSIT = new BigDecimal("500.00");
    private static final BigDecimal MAX_DEPOSIT = new BigDecimal("100000.00");

    @Transactional
    public Deposit createDeposit(Long userId, DepositCreateRequest request) {
        if (request.getAmount() == null ||
            request.getAmount().compareTo(MIN_DEPOSIT) < 0 ||
            request.getAmount().compareTo(MAX_DEPOSIT) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deposit amount must be between ₹500 and ₹1,00,000");
        }

        String paymentMethod = (request.getPaymentMethod() != null && !request.getPaymentMethod().trim().isEmpty())
                ? request.getPaymentMethod().trim().toUpperCase()
                : "UPI";

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String referenceNumber = "DEP-" + datePrefix + "-" + randomSuffix;

        Deposit deposit = Deposit.builder()
                .user(user)
                .referenceNumber(referenceNumber)
                .amount(request.getAmount())
                .paymentMethod(paymentMethod)
                .status("PENDING")
                .gatewayReference("GW-" + System.currentTimeMillis())
                .build();

        Deposit savedDeposit = depositRepository.save(deposit);

        messageService.sendSystemMessage(userId, "Payment Initiated",
                "Your payment of ₹" + request.getAmount() + " is currently pending. Reference: " + referenceNumber,
                Message.EntityType.WALLET, savedDeposit.getId());

        auditService.logAction(user.getEmail(), "DEPOSIT_INITIATED", "DEPOSIT", savedDeposit.getId(),
                "Initiated " + paymentMethod + " deposit of ₹" + request.getAmount() + " (" + referenceNumber + ")", "127.0.0.1");

        return savedDeposit;
    }

    @Transactional(readOnly = true)
    public List<Deposit> getUserDeposits(Long userId) {
        return depositRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public Deposit getDepositById(Long userId, Long depositId) {
        return depositRepository.findByIdAndUserId(depositId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deposit record not found"));
    }

    @Transactional
    public Deposit processDemoSuccess(Long userId, Long depositId) {
        Deposit deposit = getDepositById(userId, depositId);

        // IDEMPOTENCY CHECK: If already SUCCESS, return existing deposit record without crediting twice!
        if ("SUCCESS".equalsIgnoreCase(deposit.getStatus())) {
            return deposit;
        }

        if (!"PENDING".equalsIgnoreCase(deposit.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deposit is not in PENDING state");
        }

        BigDecimal amount = deposit.getAmount();

        // Atomic Dual-Table Wallet Balance Credit
        Account account = accountRepository.findByUserIdAndTypeForUpdate(userId, "WALLET")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet account not found"));

        BigDecimal balanceBefore = account.getBalance();
        int accountsUpdated = accountRepository.atomicCreditBalance(userId, amount);
        int usersUpdated = userRepository.atomicCreditBalance(userId, amount);
        userRepository.atomicCreditDepositBalance(userId, amount);

        if (accountsUpdated != 1 || usersUpdated != 1) {
            throw new IllegalStateException("CRITICAL BALANCE DESYNC ALERT: Dual-table deposit credit failed.");
        }

        BigDecimal balanceAfter = balanceBefore.add(amount);

        // Mark Deposit as SUCCESS
        deposit.setStatus("SUCCESS");
        deposit.setCompletedAt(LocalDateTime.now());
        Deposit updatedDeposit = depositRepository.save(deposit);

        // Create WALLET_CREDIT Transaction Record
        Transaction tx = Transaction.builder()
                .userId(userId)
                .account(account)
                .amount(amount)
                .type("WALLET_CREDIT")
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .withdrawableBalanceBefore(balanceBefore)
                .withdrawableBalanceAfter(balanceAfter)
                .withdrawalEligible(deposit.getUser() != null && Boolean.TRUE.equals(deposit.getUser().getIsVerified()))
                .status("COMPLETED")
                .date(LocalDateTime.now())
                .description("Wallet Deposit via " + deposit.getPaymentMethod() + " (" + deposit.getReferenceNumber() + ")")
                .referenceEntity("DEPOSIT")
                .referenceId(deposit.getId())
                .build();
        transactionRepository.save(tx);

        // Create Customer Inbox Notification
        messageService.sendSystemMessage(userId, "Wallet Credited Successfully",
                "Your wallet has been credited with ₹" + amount.setScale(2) + " successfully. Reference: " + deposit.getReferenceNumber(),
                Message.EntityType.WALLET, deposit.getId());

        auditService.logAction(deposit.getUser().getEmail(), "DEPOSIT_SUCCESS", "DEPOSIT", deposit.getId(),
                "Successfully completed " + deposit.getPaymentMethod() + " deposit of ₹" + amount + " (" + deposit.getReferenceNumber() + ")", "127.0.0.1");

        return updatedDeposit;
    }

    @Transactional
    public Deposit processDemoFailure(Long userId, Long depositId, String reason) {
        Deposit deposit = getDepositById(userId, depositId);

        if ("SUCCESS".equalsIgnoreCase(deposit.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot fail an already successful deposit");
        }

        String failureReason = (reason != null && !reason.trim().isEmpty()) ? reason.trim() : "Simulated payment gateway failure";

        deposit.setStatus("FAILED");
        deposit.setCompletedAt(LocalDateTime.now());
        deposit.setFailureReason(failureReason);
        Deposit updatedDeposit = depositRepository.save(deposit);

        messageService.sendSystemMessage(userId, "Payment Failed",
                "Your payment of ₹" + deposit.getAmount().setScale(2) + " could not be completed. Reason: " + failureReason,
                Message.EntityType.WALLET, deposit.getId());

        auditService.logAction(deposit.getUser().getEmail(), "DEPOSIT_FAILED", "DEPOSIT", deposit.getId(),
                "Payment failed for " + deposit.getPaymentMethod() + " deposit of ₹" + deposit.getAmount() + " (" + deposit.getReferenceNumber() + ")", "127.0.0.1");

        return updatedDeposit;
    }

    @Transactional(readOnly = true)
    public List<Deposit> getAllDepositsForAdmin() {
        return depositRepository.findAllByOrderByCreatedAtDesc();
    }
}
