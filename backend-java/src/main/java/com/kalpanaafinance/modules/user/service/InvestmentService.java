package com.kalpanaafinance.modules.user.service;

import com.kalpanaafinance.modules.shared.service.ProfileService;

import com.kalpanaafinance.modules.shared.dto.*;
import com.kalpanaafinance.modules.shared.entity.*;
import com.kalpanaafinance.modules.shared.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvestmentService {

    private final InvestmentPlanRepository investmentPlanRepository;
    private final InvestmentPlanRateRepository investmentPlanRateRepository;
    private final InvestmentRepository investmentRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final ProfileService profileService;

    @Transactional(readOnly = true)
    public List<InvestmentPlanDTO> getActivePlans() {
        return investmentPlanRepository.findByIsActiveTrue().stream()
                .map(this::mapPlanToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvestmentPreviewResponse getPreview(InvestmentPreviewRequest request, User user) {
        InvestmentPlan plan = investmentPlanRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Investment plan not found"));

        if (Boolean.FALSE.equals(plan.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected investment plan is currently inactive");
        }

        BigDecimal rate = resolveRate(plan, request.getDurationMonths());
        BigDecimal profit = calculateProfit(request.getInvestedAmount(), rate, request.getDurationMonths());
        BigDecimal maturityValue = request.getInvestedAmount().add(profit);

        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime maturityDate = startDate.plusMonths(request.getDurationMonths());

        Account account = accountRepository.findByUserIdAndType(user.getId(), "WALLET")
                .orElse(null);
        BigDecimal currentBalance = account != null ? account.getBalance() : (user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO);

        return InvestmentPreviewResponse.builder()
                .planId(plan.getId())
                .planName(plan.getName())
                .investedAmount(request.getInvestedAmount())
                .durationMonths(request.getDurationMonths())
                .returnRate(rate)
                .estimatedProfit(profit)
                .maturityValue(maturityValue)
                .startDate(startDate)
                .maturityDate(maturityDate)
                .currentWalletBalance(currentBalance)
                .isVariable(plan.getIsVariable())
                .build();
    }

    @Transactional
    public InvestmentDTO confirmInvestment(InvestmentConfirmRequest request, User user) {
        // Step 0: BACKEND MANDATORY DOCUMENT VERIFICATION CHECK
        VerificationStatusDTO verificationStatus = profileService.getVerificationStatus(user.getId());
        if (!"VERIFIED".equalsIgnoreCase(verificationStatus.getOverallStatus()) 
                && !Boolean.TRUE.equals(user.getIsVerified())) {
            log.warn("BLOCKED INVESTMENT SUBMISSION: User id={} verificationStatus={}", user.getId(), verificationStatus.getOverallStatus());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "DOCUMENTS_NOT_VERIFIED: You cannot submit an investment until your required KYC documents (PAN, Aadhaar, Bank Statement) are submitted and verified.");
        }

        // Step 1: Acquire FOR UPDATE lock on user's wallet Account
        Account account = accountRepository.findByUserIdAndTypeForUpdate(user.getId(), "WALLET")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet account not found for user"));

        BigDecimal balanceBefore = account.getBalance();

        // Step 2: Explicit Insufficient Funds Check under Lock
        if (balanceBefore.compareTo(request.getInvestedAmount()) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient wallet balance");
        }

        // Step 3: Resolve Plan & Rate
        InvestmentPlan plan = investmentPlanRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Investment plan not found"));

        if (Boolean.FALSE.equals(plan.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected investment plan is currently inactive");
        }

        BigDecimal rate = resolveRate(plan, request.getDurationMonths());
        BigDecimal profit = calculateProfit(request.getInvestedAmount(), rate, request.getDurationMonths());
        BigDecimal maturityValue = request.getInvestedAmount().add(profit);

        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime maturityDate = startDate.plusMonths(request.getDurationMonths());

        // Step 4: Execute Unconditional Atomic Updates (Sufficiency verified under lock)
        int accountsUpdated = accountRepository.decrementAccountBalance(user.getId(), "WALLET", request.getInvestedAmount());
        int usersUpdated = userRepository.decrementUserBalance(user.getId(), request.getInvestedAmount());

        if (accountsUpdated != 1 || usersUpdated != 1) {
            log.error("CRITICAL BALANCE DESYNC ALERT: userId={}. accountsUpdated={}, usersUpdated={}", user.getId(), accountsUpdated, usersUpdated);
            throw new IllegalStateException("Critical balance desynchronization detected. Transaction rolled back.");
        }

        BigDecimal balanceAfter = balanceBefore.subtract(request.getInvestedAmount());

        // Step 5: Save Investment
        Investment investment = Investment.builder()
                .user(user)
                .plan(plan)
                .type(plan.getName())
                .durationMonths(request.getDurationMonths())
                .investedAmount(request.getInvestedAmount())
                .lockedRate(rate)
                .estimatedProfit(profit)
                .maturityValue(maturityValue)
                .currentValue(maturityValue)
                .startDate(startDate)
                .maturityDate(maturityDate)
                .legacyUnverified(false)
                .status("ACTIVE")
                .applicationStatus("APPROVED")
                .build();

        investment = investmentRepository.save(investment);

        // Step 6: Create Wallet Transaction Audit Log
        com.kalpanaafinance.modules.shared.entity.Transaction tx = com.kalpanaafinance.modules.shared.entity.Transaction.builder()
                .account(account)
                .amount(request.getInvestedAmount())
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .type("INVESTMENT_DEBIT")
                .referenceEntity("INVESTMENT")
                .referenceId(investment.getId())
                .description("Investment in " + plan.getName() + " (" + request.getDurationMonths() + "m @ " + rate + "%)")
                .date(LocalDateTime.now())
                .build();

        transactionRepository.save(tx);

        return mapInvestmentToDTO(investment);
    }

    @Transactional
    public InvestmentDTO redeemInvestment(Long investmentId, User user) {
        Investment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Investment not found"));

        if (!investment.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this investment");
        }

        // Step 1: Conditional Atomic Status Update Guard
        int rowsAffected = investmentRepository.atomicRedeemInvestment(investmentId, user.getId());
        if (rowsAffected == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Investment has already been redeemed or is not eligible for redemption");
        }

        // Step 2: Acquire FOR UPDATE lock on user's wallet Account
        Account account = accountRepository.findByUserIdAndTypeForUpdate(user.getId(), "WALLET")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet account not found for user"));

        BigDecimal balanceBefore = account.getBalance();
        BigDecimal maturityValue = investment.getMaturityValue();

        // Step 3: Execute Unconditional Atomic Balance Updates
        int accountsUpdated = accountRepository.incrementAccountBalance(user.getId(), "WALLET", maturityValue);
        int usersUpdated = userRepository.incrementUserBalance(user.getId(), maturityValue);

        if (accountsUpdated != 1 || usersUpdated != 1) {
            log.error("CRITICAL BALANCE DESYNC ALERT: userId={}. accountsUpdated={}, usersUpdated={}", user.getId(), accountsUpdated, usersUpdated);
            throw new IllegalStateException("Critical balance desynchronization detected. Transaction rolled back.");
        }

        BigDecimal balanceAfter = balanceBefore.add(maturityValue);

        // Update local object for response
        investment.setStatus("REDEEMED");
        investment.setRedeemedAt(LocalDateTime.now());

        // Step 4: Create Wallet Transaction Audit Log
        com.kalpanaafinance.modules.shared.entity.Transaction tx = com.kalpanaafinance.modules.shared.entity.Transaction.builder()
                .account(account)
                .amount(maturityValue)
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .type("INVESTMENT_REDEMPTION")
                .referenceEntity("INVESTMENT")
                .referenceId(investmentId)
                .description("Maturity Redemption for Investment #" + investmentId + " (" + investment.getType() + ")")
                .date(LocalDateTime.now())
                .build();

        transactionRepository.save(tx);

        return mapInvestmentToDTO(investment);
    }

    @Transactional(readOnly = true)
    public List<InvestmentDTO> getUserInvestments(Long userId) {
        return investmentRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapInvestmentToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InvestmentDTO> getAllInvestmentsForAdmin() {
        return investmentRepository.findAllByOrderByIdDesc().stream()
                .map(this::mapInvestmentToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InvestmentDTO> getLegacyUnverifiedInvestments() {
        return investmentRepository.findByLegacyUnverifiedTrueOrderByIdDesc().stream()
                .map(this::mapInvestmentToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public InvestmentDTO resolveLegacyInvestment(Long investmentId, ResolveLegacyInvestmentRequest request) {
        Investment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Investment not found"));

        if (!Boolean.TRUE.equals(investment.getLegacyUnverified())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Investment is already verified");
        }

        InvestmentPlan plan = investmentPlanRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Investment plan not found"));

        BigDecimal profit = calculateProfit(investment.getInvestedAmount(), request.getLockedRate(), request.getDurationMonths());
        BigDecimal maturityValue = investment.getInvestedAmount().add(profit);

        investment.setPlan(plan);
        investment.setType(plan.getName());
        investment.setDurationMonths(request.getDurationMonths());
        investment.setLockedRate(request.getLockedRate());
        investment.setEstimatedProfit(profit);
        investment.setMaturityValue(maturityValue);
        investment.setCurrentValue(maturityValue);
        investment.setStartDate(request.getStartDate());
        investment.setMaturityDate(request.getMaturityDate());
        investment.setLegacyUnverified(false);

        investment = investmentRepository.save(investment);
        return mapInvestmentToDTO(investment);
    }

    // Helper Methods
    private BigDecimal resolveRate(InvestmentPlan plan, Integer durationMonths) {
        if (Boolean.TRUE.equals(plan.getIsVariable())) {
            if (plan.getVariableRate() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Variable return rate is not configured for this plan");
            }
            return plan.getVariableRate();
        }

        InvestmentPlanRate rateRow = investmentPlanRateRepository.findByPlanIdAndDurationMonths(plan.getId(), durationMonths)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No rate configured for duration " + durationMonths + " months in plan " + plan.getName()));

        return rateRow.getReturnRate();
    }

    private BigDecimal calculateProfit(BigDecimal amount, BigDecimal annualRate, Integer durationMonths) {
        return amount.multiply(annualRate)
                .multiply(BigDecimal.valueOf(durationMonths))
                .divide(BigDecimal.valueOf(1200), 2, RoundingMode.HALF_UP);
    }

    private InvestmentPlanDTO mapPlanToDTO(InvestmentPlan plan) {
        return InvestmentPlanDTO.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .isVariable(plan.getIsVariable())
                .variableRate(plan.getVariableRate())
                .isActive(plan.getIsActive())
                .rates(plan.getRates() != null ? plan.getRates().stream()
                        .map(r -> InvestmentPlanDTO.InvestmentPlanRateDTO.builder()
                                .id(r.getId())
                                .durationMonths(r.getDurationMonths())
                                .returnRate(r.getReturnRate())
                                .build())
                        .collect(Collectors.toList()) : List.of())
                .build();
    }

    private InvestmentDTO mapInvestmentToDTO(Investment inv) {
        // Derived Status Computation (UTC / local time compare)
        String computedStatus = inv.getStatus();
        if (Boolean.FALSE.equals(inv.getLegacyUnverified()) && "ACTIVE".equals(inv.getStatus()) && inv.getMaturityDate() != null) {
            if (LocalDateTime.now().isAfter(inv.getMaturityDate()) || LocalDateTime.now().isEqual(inv.getMaturityDate())) {
                computedStatus = "MATURED";
            }
        }

        return InvestmentDTO.builder()
                .id(inv.getId())
                .userId(inv.getUser() != null ? inv.getUser().getId() : null)
                .userName(inv.getUser() != null ? inv.getUser().getName() : "Unknown")
                .userEmail(inv.getUser() != null ? inv.getUser().getEmail() : "N/A")
                .planId(inv.getPlan() != null ? inv.getPlan().getId() : null)
                .planName(inv.getPlan() != null ? inv.getPlan().getName() : inv.getType())
                .type(inv.getType())
                .durationMonths(inv.getDurationMonths())
                .investedAmount(inv.getInvestedAmount())
                .lockedRate(inv.getLockedRate())
                .estimatedProfit(inv.getEstimatedProfit())
                .maturityValue(inv.getMaturityValue())
                .currentValue(inv.getCurrentValue())
                .startDate(inv.getStartDate())
                .maturityDate(inv.getMaturityDate())
                .redeemedAt(inv.getRedeemedAt())
                .legacyUnverified(inv.getLegacyUnverified())
                .status(computedStatus)
                .createdAt(inv.getCreatedAt())
                .build();
    }
}
