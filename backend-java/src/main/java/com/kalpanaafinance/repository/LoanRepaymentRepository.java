package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.LoanRepayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoanRepaymentRepository extends JpaRepository<LoanRepayment, Long> {
}

