package com.kalpanaafinance.service;

import com.kalpanaafinance.entity.AuditLog;
import com.kalpanaafinance.entity.User;
import com.kalpanaafinance.repository.AuditLogRepository;
import com.kalpanaafinance.repository.UserRepository;
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
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }

    public void clearAllAuditLogs() {
        auditLogRepository.deleteAll();
    }
}
