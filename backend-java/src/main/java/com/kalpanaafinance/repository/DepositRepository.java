package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Deposit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepositRepository extends JpaRepository<Deposit, Long> {
    List<Deposit> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Deposit> findByIdAndUserId(Long id, Long userId);
    Optional<Deposit> findByReferenceNumber(String referenceNumber);
    List<Deposit> findAllByOrderByCreatedAtDesc();
}
