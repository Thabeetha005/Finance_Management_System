package com.kalpanaafinance.modules.shared.repository;

import com.kalpanaafinance.modules.shared.entity.PaymentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentAttemptRepository extends JpaRepository<PaymentAttempt, Long> {
    List<PaymentAttempt> findByInstallmentId(Long installmentId);
}
