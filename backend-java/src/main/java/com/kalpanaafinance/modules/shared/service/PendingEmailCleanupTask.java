package com.kalpanaafinance.modules.shared.service;

import com.kalpanaafinance.modules.shared.entity.PendingEmailChange;
import com.kalpanaafinance.modules.shared.repository.PendingEmailChangeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PendingEmailCleanupTask {

    private final PendingEmailChangeRepository pendingEmailChangeRepository;

    @Scheduled(cron = "0 0 * * * *") // Runs every hour
    @Transactional
    public void cleanupExpiredPendingEmails() {
        LocalDateTime now = LocalDateTime.now();
        List<PendingEmailChange> expiredList = pendingEmailChangeRepository.findByStatusAndExpiresAtBefore("PENDING", now);
        for (PendingEmailChange change : expiredList) {
            change.setStatus("EXPIRED");
        }
        if (!expiredList.isEmpty()) {
            pendingEmailChangeRepository.saveAll(expiredList);
            log.info("Expired {} stale pending email change requests.", expiredList.size());
        }
    }
}
