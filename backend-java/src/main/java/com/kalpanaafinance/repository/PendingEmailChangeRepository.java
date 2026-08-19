package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.PendingEmailChange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

@Repository
public interface PendingEmailChangeRepository extends JpaRepository<PendingEmailChange, Long> {

    Optional<PendingEmailChange> findByToken(String token);

    List<PendingEmailChange> findByUserIdAndStatus(Long userId, String status);

    List<PendingEmailChange> findByStatusAndExpiresAtBefore(String status, LocalDateTime now);
}
