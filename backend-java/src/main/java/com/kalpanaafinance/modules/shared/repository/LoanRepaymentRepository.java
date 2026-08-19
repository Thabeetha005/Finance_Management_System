package com.kalpanaafinance.modules.shared.repository;

import com.kalpanaafinance.modules.shared.entity.LoanRepayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoanRepaymentRepository extends JpaRepository<LoanRepayment, Long> {
}

