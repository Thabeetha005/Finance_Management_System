package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.LoanInstallment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanInstallmentRepository extends JpaRepository<LoanInstallment, Long> {
    List<LoanInstallment> findByLoanId(Long loanId);
    List<LoanInstallment> findByLoanIdOrderByInstallmentNumberAsc(Long loanId);
    
    LoanInstallment findFirstByLoanIdAndStatusInOrderByDueDateAsc(Long loanId, List<String> statuses);
    List<LoanInstallment> findByLoanIdAndStatusOrderByDueDateDesc(Long loanId, String status);

    List<LoanInstallment> findByDueDateLessThanEqualAndStatusIn(java.time.LocalDate date, List<String> statuses);
    List<LoanInstallment> findByDueDateAndStatusIn(java.time.LocalDate date, List<String> statuses);
}
