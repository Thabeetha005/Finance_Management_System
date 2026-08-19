package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.WalletHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletHistoryRepository extends JpaRepository<WalletHistory, Long> {
    List<WalletHistory> findByUserEmailOrderByRecordDateAsc(String email);
}
