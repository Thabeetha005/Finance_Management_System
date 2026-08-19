package com.kalpanaafinance.modules.user.service;

import com.kalpanaafinance.modules.shared.entity.AuditLog;
import com.kalpanaafinance.modules.shared.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StatementAuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logStatementGeneration(Long userId, String email, String name, String statementRef, String periodStr, String typeFilter, String format, boolean success, String ipAddress) {
        try {
            String action = success ? "FINANCIAL_STATEMENT_GENERATED" : "FINANCIAL_STATEMENT_GENERATION_FAILED";
            String details = String.format("Ref: %s | Period: %s | Type: %s | Format: %s | Status: %s",
                    statementRef, periodStr, typeFilter != null ? typeFilter : "ALL", format, success ? "SUCCESS" : "FAILED");

            AuditLog log = AuditLog.builder()
                    .adminUsername(email != null ? email : "USER_" + userId)
                    .adminName(name != null ? name : "Customer")
                    .action(action)
                    .targetType("FINANCIAL_STATEMENT")
                    .targetId(userId)
                    .description(details)
                    .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                    .build();

            auditLogRepository.save(log);
        } catch (Exception e) {
            // Silently ignore audit log failures so statement delivery is never interrupted
        }
    }
}
