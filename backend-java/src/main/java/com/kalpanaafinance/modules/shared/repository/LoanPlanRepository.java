package com.kalpanaafinance.modules.shared.repository;

import com.kalpanaafinance.modules.shared.entity.LoanPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoanPlanRepository extends JpaRepository<LoanPlan, Long> {
    Optional<LoanPlan> findByNameIgnoreCase(String name);
}
