package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {

    List<BankAccount> findByUserIdAndIsVerifiedTrue(Long userId);

    boolean existsByUserIdAndIsVerifiedTrue(Long userId);

    Optional<BankAccount> findByIdAndUserId(Long id, Long userId);
}
