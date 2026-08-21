package com.kalpanaaafinance.modules.shared.repository;

import com.kalpanaaafinance.modules.shared.entity.LoanPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoanPlanRepository extends JpaRepository<LoanPlan, Long> {
    Optional<LoanPlan> findByNameIgnoreCase(String name);
}
