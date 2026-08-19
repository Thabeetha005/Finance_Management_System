package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.PaymentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentAttemptRepository extends JpaRepository<PaymentAttempt, Long> {
    List<PaymentAttempt> findByInstallmentId(Long installmentId);
}
