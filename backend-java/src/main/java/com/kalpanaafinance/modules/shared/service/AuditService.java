package com.kalpanaafinance.modules.shared.service;

import com.kalpanaafinance.modules.shared.entity.AuditLog;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.repository.AuditLogRepository;
import com.kalpanaafinance.modules.shared.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public void logAction(String username, String action, String targetType, Long targetId, String description, String ipAddress) {
        String adminName = "System";
        if (username != null && !username.equals("system")) {
            adminName = userRepository.findByEmail(username).map(User::getName).orElse("Unknown");
        }
        
        AuditLog log = AuditLog.builder()
                .adminUsername(username)
                .adminName(adminName)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .description(description)
                .ipAddress(ipAddress)
                .build();
        auditLogRepository.save(log);
    }

    public java.util.List<AuditLog> getAllAuditLogs() {
        java.util.List<AuditLog> logs = auditLogRepository.findAllByOrderByCreatedAtDesc();
        if (logs.isEmpty()) {
            seedInitialAuditLogs();
            return auditLogRepository.findAllByOrderByCreatedAtDesc();
        }
        return logs;
    }

    private void seedInitialAuditLogs() {
        logAction("admin@kalpanaafinance.com", "SYSTEM_INITIALIZED", "SYSTEM", 1L, "Kalpanaa Finance Core Financial Engine & Audit Trail Services Activated", "127.0.0.1");
        logAction("admin@kalpanaafinance.com", "USER_SECURITY_AUDIT", "SECURITY", 1L, "JWT Security Policies & Role Access Control Enforced", "127.0.0.1");
        logAction("ananya.rao@kalpanaafinance.com", "CONSULTANT_ACTIVATED", "CONSULTANT", 1L, "Consultant Profile Ananya Rao initialized & verified", "127.0.0.1");
        logAction("admin@kalpanaafinance.com", "FINANCIAL_SYSTEM_READY", "FINANCE", 1L, "Authoritative Transaction & Statement Generation Services Enabled", "127.0.0.1");
    }

    public void clearAllAuditLogs() {
        auditLogRepository.deleteAll();
    }
}
