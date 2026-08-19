package com.kalpanaafinance.modules.shared.repository;

import com.kalpanaafinance.modules.shared.entity.InvestmentPlanRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvestmentPlanRateRepository extends JpaRepository<InvestmentPlanRate, Long> {
    Optional<InvestmentPlanRate> findByPlanIdAndDurationMonths(Long planId, Integer durationMonths);
    void deleteByPlanId(Long planId);
}
