package com.kalpanaafinance.modules.shared.service;

import com.kalpanaafinance.modules.shared.entity.LoanInstallment;
import com.kalpanaafinance.modules.shared.entity.Message;
import com.kalpanaafinance.modules.shared.repository.LoanInstallmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmiReminderScheduler {

    private final LoanInstallmentRepository loanInstallmentRepository;
    private final MessageService messageService;

    @Scheduled(cron = "0 0 8 * * ?") // Runs every day at 8 AM
    @Transactional
    public void sendEmiRemindersAndCheckOverdue() {
        LocalDate today = LocalDate.now();
        LocalDate target7DayDate = today.plusDays(7);

        // 1. 7-Day Reminder Scheduler
        List<LoanInstallment> upcomingReminders = loanInstallmentRepository.findByDueDateAndStatusIn(
                target7DayDate, List.of("PENDING", "UPCOMING")
        );

        for (LoanInstallment installment : upcomingReminders) {
            String subject = "Upcoming EMI Reminder";
            String content = String.format("Reminder: Your EMI of ₹%s is due on %s.",
                    installment.getAmount() != null ? installment.getAmount() : installment.getAmountDue(),
                    installment.getDueDate());
            
            messageService.sendSystemMessage(
                    installment.getLoan().getUser().getId(),
                    subject,
                    content,
                    Message.EntityType.LOAN,
                    installment.getLoan().getId()
            );
        }

        // 2. Overdue Transition & Notification Scheduler
        List<LoanInstallment> overdueInstallments = loanInstallmentRepository.findByDueDateLessThanEqualAndStatusIn(
                today.minusDays(1), List.of("PENDING", "UPCOMING")
        );

        for (LoanInstallment installment : overdueInstallments) {
            installment.setStatus("OVERDUE");
            loanInstallmentRepository.save(installment);

            String subject = "EMI Overdue Notice";
            String content = String.format("Your EMI of ₹%s is overdue. Please make the payment as soon as possible.",
                    installment.getAmount() != null ? installment.getAmount() : installment.getAmountDue());

            messageService.sendSystemMessage(
                    installment.getLoan().getUser().getId(),
                    subject,
                    content,
                    Message.EntityType.LOAN,
                    installment.getLoan().getId()
            );
        }
    }
}
