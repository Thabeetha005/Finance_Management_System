package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Withdrawal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long> {

    List<Withdrawal> findByUserIdOrderByRequestedAtDesc(Long userId);

    List<Withdrawal> findByStatusOrderByRequestedAtDesc(String status);

    List<Withdrawal> findAllByOrderByRequestedAtDesc();

    @Query("SELECT COALESCE(SUM(w.amount), 0) FROM Withdrawal w WHERE w.userId = :userId AND w.status IN ('PENDING', 'APPROVED')")
    BigDecimal sumPendingAndApprovedByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(w.amount), 0) FROM Withdrawal w WHERE w.userId = :userId AND w.requestedAt >= :startOfDay AND w.requestedAt <= :endOfDay AND w.status IN ('PENDING', 'APPROVED', 'COMPLETED')")
    BigDecimal sumTodayWithdrawalsByUserId(
            @Param("userId") Long userId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE withdrawals SET status = :toStatus, approved_at = :now WHERE id = :id AND status = :fromStatus", nativeQuery = true)
    int atomicTransitionStatus(
            @Param("id") Long id,
            @Param("fromStatus") String fromStatus,
            @Param("toStatus") String toStatus,
            @Param("now") LocalDateTime now
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE withdrawals SET status = 'REJECTED', rejection_reason = :reason, admin_id = :adminId, rejected_at = :now WHERE id = :id AND status = 'PENDING'", nativeQuery = true)
    int atomicReject(
            @Param("id") Long id,
            @Param("reason") String reason,
            @Param("adminId") Long adminId,
            @Param("now") LocalDateTime now
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE withdrawals SET status = 'COMPLETED', completed_at = :now, balance_before = :balanceBefore, balance_after = :balanceAfter, admin_id = :adminId WHERE id = :id AND status IN ('APPROVED', 'PENDING')", nativeQuery = true)
    int atomicComplete(
            @Param("id") Long id,
            @Param("balanceBefore") BigDecimal balanceBefore,
            @Param("balanceAfter") BigDecimal balanceAfter,
            @Param("adminId") Long adminId,
            @Param("now") LocalDateTime now
    );
}
