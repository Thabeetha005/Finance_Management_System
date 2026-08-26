package com.kalpanaaafinance.modules.shared.repository;

import com.kalpanaaafinance.modules.shared.entity.InvestmentPlanRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvestmentPlanRateRepository extends JpaRepository<InvestmentPlanRate, Long> {
    Optional<InvestmentPlanRate> findByPlanIdAndDurationMonths(Long planId, Integer durationMonths);
    java.util.List<InvestmentPlanRate> findByPlanId(Long planId);
    void deleteByPlanId(Long planId);
}
