package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.InvestmentPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvestmentPlanRepository extends JpaRepository<InvestmentPlan, Long> {
    List<InvestmentPlan> findByIsActiveTrue();
    Optional<InvestmentPlan> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
