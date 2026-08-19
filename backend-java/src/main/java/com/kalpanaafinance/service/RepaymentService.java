package com.kalpanaafinance.service;

import com.kalpanaafinance.entity.Loan;
import com.kalpanaafinance.entity.LoanInstallment;
import com.kalpanaafinance.entity.PaymentAttempt;
import com.kalpanaafinance.entity.User;
import com.kalpanaafinance.repository.LoanInstallmentRepository;
import com.kalpanaafinance.repository.LoanRepository;
import com.kalpanaafinance.repository.PaymentAttemptRepository;
import com.kalpanaafinance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class RepaymentService {

    private final LoanRepository loanRepository;
    private final LoanInstallmentRepository loanInstallmentRepository;
    private final PaymentAttemptRepository paymentAttemptRepository;
    private final UserRepository userRepository;

    @Transactional
    public PaymentAttempt payInstallment(Long userId, Long installmentId, boolean isPartial) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LoanInstallment installment = loanInstallmentRepository.findById(installmentId)
                .orElseThrow(() -> new RuntimeException("Installment not found"));

        if (!installment.getLoan().getUser().getId().equals(userId)) {
            throw new RuntimeException("Installment does not belong to user");
        }

        if ("PAID".equals(installment.getStatus())) {
            throw new RuntimeException("Installment already fully paid");
        }

        BigDecimal amountToPay;
        if (isPartial) {
            amountToPay = installment.getAmountDue().multiply(new BigDecimal("0.50"));
        } else {
            amountToPay = installment.getAmountDue().subtract(installment.getAmountPaid());
        }

        // Deduct from wallet directly
        if (user.getBalance().compareTo(amountToPay) < 0) {
            // Log failed attempt
            PaymentAttempt attempt = PaymentAttempt.builder()
                    .installment(installment)
                    .amount(amountToPay)
                    .status("FAILED")
                    .build();
            return paymentAttemptRepository.save(attempt);
        }

        user.setBalance(user.getBalance().subtract(amountToPay));
        userRepository.save(user);

        // Update installment
        installment.setAmountPaid(installment.getAmountPaid().add(amountToPay));
        if (installment.getAmountPaid().compareTo(installment.getAmountDue()) >= 0) {
            installment.setStatus("PAID");
        } else {
            installment.setStatus("PARTIALLY_PAID");
        }
        loanInstallmentRepository.save(installment);

        // Update loan
        Loan loan = installment.getLoan();
        loan.setOverallPaidAmount(loan.getOverallPaidAmount().add(amountToPay));
        loan.setOverallOutstandingAmount(loan.getOverallOutstandingAmount().subtract(amountToPay));
        loanRepository.save(loan);

        // Log successful attempt
        PaymentAttempt attempt = PaymentAttempt.builder()
                .installment(installment)
                .amount(amountToPay)
                .status("SUCCESS")
                .build();
        return paymentAttemptRepository.save(attempt);
    }
}
