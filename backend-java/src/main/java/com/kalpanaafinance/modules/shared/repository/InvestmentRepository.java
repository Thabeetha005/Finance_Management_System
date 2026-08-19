package com.kalpanaafinance.modules.shared.repository;

import com.kalpanaafinance.modules.shared.entity.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    List<Investment> findByUserId(Long userId);
    List<Investment> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Investment> findByLegacyUnverifiedTrueOrderByIdDesc();
    List<Investment> findAllByOrderByIdDesc();

    @Modifying
    @Query("UPDATE Investment i SET i.status = 'REDEEMED', i.redeemedAt = CURRENT_TIMESTAMP WHERE i.id = :investmentId AND i.user.id = :userId AND i.status = 'ACTIVE' AND i.maturityDate <= CURRENT_TIMESTAMP AND i.legacyUnverified = false")
    int atomicRedeemInvestment(@Param("investmentId") Long investmentId, @Param("userId") Long userId);
}
