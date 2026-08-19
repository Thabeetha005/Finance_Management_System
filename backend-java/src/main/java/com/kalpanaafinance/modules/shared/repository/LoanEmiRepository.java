package com.kalpanaafinance.modules.shared.repository;

import com.kalpanaafinance.modules.shared.entity.LoanEmi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoanEmiRepository extends JpaRepository<LoanEmi, Long> {
    List<LoanEmi> findByLoanIdOrderByDueDateAsc(Long loanId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE LoanEmi e SET e.status = 'PAID', e.paidDate = :paidDate, e.transactionId = :txId WHERE e.id = :emiId AND e.status = 'PENDING'")
    int atomicPayEmi(@Param("emiId") Long emiId, @Param("paidDate") LocalDateTime paidDate, @Param("txId") Long txId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE loan_emis SET reminder_sent = TRUE WHERE id = :id AND reminder_sent = FALSE AND status = 'PENDING'", nativeQuery = true)
    int atomicClaimReminder(@Param("id") Long id);

    @Query("SELECT e FROM LoanEmi e WHERE e.dueDate = :dueDate AND e.status = 'PENDING' AND e.reminderSent = FALSE")
    List<LoanEmi> findEmisDueOnForReminder(@Param("dueDate") LocalDate dueDate);
}
