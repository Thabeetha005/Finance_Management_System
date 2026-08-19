package com.kalpanaafinance.service;

import com.kalpanaafinance.entity.Loan;
import com.kalpanaafinance.entity.LoanEmi;
import com.kalpanaafinance.entity.Message;
import com.kalpanaafinance.repository.LoanEmiRepository;
import com.kalpanaafinance.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanReminderScheduler {

    private final LoanEmiRepository loanEmiRepository;
    private final LoanRepository loanRepository;
    private final MessageService messageService;

    // Run daily at 08:00 AM
    @Scheduled(cron = "0 0 8 * * ?")
    @Transactional
    public void sendEmiDueReminders() {
        LocalDate reminderTargetDate = LocalDate.now().plusDays(7);
        List<LoanEmi> dueEmis = loanEmiRepository.findEmisDueOnForReminder(reminderTargetDate);

        for (LoanEmi emi : dueEmis) {
            // Atomic check-and-set claim guard
            int claimed = loanEmiRepository.atomicClaimReminder(emi.getId());
            if (claimed == 1) {
                Loan loan = loanRepository.findById(emi.getLoanId()).orElse(null);
                if (loan != null && loan.getUser() != null) {
                    messageService.sendSystemMessage(
                            loan.getUser().getId(),
                            "Upcoming EMI Reminder",
                            "Reminder: Your monthly EMI of ₹" + emi.getAmount() + " for Loan #" + loan.getId() 
                                    + " is due in 7 days on " + emi.getDueDate() + ". Please ensure sufficient wallet balance.",
                            Message.EntityType.LOAN,
                            loan.getId()
                    );
                }
            }
        }
    }
}
