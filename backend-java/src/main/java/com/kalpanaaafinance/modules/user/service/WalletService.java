package com.kalpanaaafinance.modules.user.service;

import com.kalpanaaafinance.modules.shared.dto.WalletSummaryResponse;
import com.kalpanaaafinance.modules.shared.dto.WalletTransactionResponse;
import com.kalpanaaafinance.modules.shared.entity.Account;
import com.kalpanaaafinance.modules.shared.entity.Investment;
import com.kalpanaaafinance.modules.shared.entity.Loan;
import com.kalpanaaafinance.modules.shared.entity.Transaction;
import com.kalpanaaafinance.modules.shared.entity.User;
import com.kalpanaaafinance.modules.shared.repository.AccountRepository;
import com.kalpanaaafinance.modules.shared.repository.InvestmentRepository;
import com.kalpanaaafinance.modules.shared.repository.LoanRepository;
import com.kalpanaaafinance.modules.shared.repository.TransactionRepository;
import com.kalpanaaafinance.modules.shared.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final InvestmentRepository investmentRepository;
    private final LoanRepository loanRepository;
    private final TransactionRepository transactionRepository;
    private final com.kalpanaaafinance.modules.shared.repository.WithdrawalRepository withdrawalRepository;

    @Transactional(readOnly = true)
    public WalletSummaryResponse getWalletSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Source of truth balance
        BigDecimal availableBalance = user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO;
        BigDecimal bonusBalance = user.getBonusBalance() != null ? user.getBonusBalance() : BigDecimal.ZERO;
        BigDecimal depositBalance = user.getDepositBalance() != null ? user.getDepositBalance() : BigDecimal.ZERO;

        BigDecimal pendingWithdrawalAmount = withdrawalRepository.sumPendingAndApprovedByUserId(userId);
        if (pendingWithdrawalAmount == null) pendingWithdrawalAmount = BigDecimal.ZERO;

        BigDecimal withdrawableBalance = depositBalance.subtract(pendingWithdrawalAmount);
        if (withdrawableBalance.compareTo(BigDecimal.ZERO) < 0) {
            withdrawableBalance = BigDecimal.ZERO;
        }

        // Active investments only
        List<Investment> activeInvestments = investmentRepository.findByUserId(userId).stream()
                .filter(inv -> "ACTIVE".equalsIgnoreCase(inv.getStatus()))
                .toList();

        BigDecimal totalInvestedAmount = activeInvestments.stream()
                .map(inv -> inv.getInvestedAmount() != null ? inv.getInvestedAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, (a, b) -> a.add(b));

        BigDecimal totalPortfolioValue = activeInvestments.stream()
                .map(inv -> inv.getCurrentValue() != null ? inv.getCurrentValue() : (inv.getInvestedAmount() != null ? inv.getInvestedAmount() : BigDecimal.ZERO))
                .reduce(BigDecimal.ZERO, (a, b) -> a.add(b));

        BigDecimal totalProfit = totalPortfolioValue.subtract(totalInvestedAmount);

        // Active loans only (exclude COMPLETED, REJECTED, etc.)
        List<Loan> activeLoans = loanRepository.findByUserId(userId).stream()
                .filter(loan -> "ACTIVE".equalsIgnoreCase(loan.getStatus()) || "APPROVED".equalsIgnoreCase(loan.getStatus()))
                .toList();

        BigDecimal totalLoanOutstanding = activeLoans.stream()
                .map(loan -> loan.getOutstandingBalance() != null ? loan.getOutstandingBalance() : (loan.getAmount() != null ? loan.getAmount() : BigDecimal.ZERO))
                .reduce(BigDecimal.ZERO, (a, b) -> a.add(b));

        return WalletSummaryResponse.builder()
                .availableWalletBalance(availableBalance)
                .bonusBalance(bonusBalance)
                .depositBalance(depositBalance)
                .withdrawableBalance(withdrawableBalance)
                .pendingWithdrawalAmount(pendingWithdrawalAmount)
                .totalInvestedAmount(totalInvestedAmount)
                .totalPortfolioValue(totalPortfolioValue)
                .totalLoanOutstanding(totalLoanOutstanding)
                .totalProfit(totalProfit)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<WalletTransactionResponse> getWalletTransactions(
            Long userId,
            String type,
            String status,
            String search,
            LocalDateTime startDate,
            LocalDateTime endDate,
            int page,
            int size,
            String sortDirection) {

        Sort.Direction direction = "oldest".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "date"));

        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String cleanType = (type != null && !type.trim().isEmpty() && !"ALL".equalsIgnoreCase(type)) ? type.trim() : null;
        String cleanStatus = (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) ? status.trim() : null;

        Page<Transaction> txPage = transactionRepository.findWalletTransactionsFiltered(
                userId, cleanType, cleanStatus, cleanSearch, startDate, endDate, pageable
        );

        return txPage.map(tx -> WalletTransactionResponse.builder()
                .id(tx.getId())
                .userId(tx.getUserId())
                .date(tx.getDate())
                .type(tx.getType())
                .description(tx.getDescription())
                .amount(tx.getAmount())
                .balanceBefore(tx.getBalanceBefore())
                .balanceAfter(tx.getBalanceAfter())
                .withdrawableBalanceBefore(tx.getWithdrawableBalanceBefore())
                .withdrawableBalanceAfter(tx.getWithdrawableBalanceAfter())
                .withdrawalEligible(tx.getWithdrawalEligible() != null ? tx.getWithdrawalEligible() : !"BONUS".equalsIgnoreCase(tx.getType()))
                .status(tx.getStatus() != null ? tx.getStatus() : "COMPLETED")
                .referenceEntity(tx.getReferenceEntity())
                .referenceId(tx.getReferenceId())
                .build());
    }

    @Transactional(readOnly = true)
    public List<WalletTransactionResponse> getRecentActivity(Long userId) {
        Pageable pageable = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "date"));
        Page<Transaction> txPage = transactionRepository.findWalletTransactionsFiltered(
                userId, null, null, null, null, null, pageable
        );

        return txPage.getContent().stream().map(tx -> WalletTransactionResponse.builder()
                .id(tx.getId())
                .userId(tx.getUserId())
                .date(tx.getDate())
                .type(tx.getType())
                .description(tx.getDescription())
                .amount(tx.getAmount())
                .balanceBefore(tx.getBalanceBefore())
                .balanceAfter(tx.getBalanceAfter())
                .withdrawableBalanceBefore(tx.getWithdrawableBalanceBefore())
                .withdrawableBalanceAfter(tx.getWithdrawableBalanceAfter())
                .withdrawalEligible(tx.getWithdrawalEligible() != null ? tx.getWithdrawalEligible() : !"BONUS".equalsIgnoreCase(tx.getType()))
                .status(tx.getStatus() != null ? tx.getStatus() : "COMPLETED")
                .referenceEntity(tx.getReferenceEntity())
                .referenceId(tx.getReferenceId())
                .build()).toList();
    }
}
