package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.LoanPlanRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoanPlanRateRepository extends JpaRepository<LoanPlanRate, Long> {
    Optional<LoanPlanRate> findByLoanPlanIdAndDurationMonths(Long planId, Integer durationMonths);
}
