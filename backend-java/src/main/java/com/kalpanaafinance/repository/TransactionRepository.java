package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);
    List<Transaction> findByAccountUserEmail(String email);
    List<Transaction> findByUserIdOrderByDateDesc(Long userId);

    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId " +
           "AND (:type IS NULL OR t.type = :type) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:search IS NULL OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.type) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:startDate IS NULL OR t.date >= :startDate) " +
           "AND (:endDate IS NULL OR t.date <= :endDate)")
    Page<Transaction> findWalletTransactionsFiltered(
            @Param("userId") Long userId,
            @Param("type") String type,
            @Param("status") String status,
            @Param("search") String search,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );
}
