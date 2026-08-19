package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    java.util.List<Loan> findByUserId(Long userId);
}


