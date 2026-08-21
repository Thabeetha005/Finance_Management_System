package com.kalpanaaafinance.modules.shared.service;

import com.kalpanaaafinance.modules.shared.entity.AuditLog;
import com.kalpanaaafinance.modules.shared.entity.User;
import com.kalpanaaafinance.modules.shared.repository.AuditLogRepository;
import com.kalpanaaafinance.modules.shared.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AuditService {
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public void logAction(String username, String action, String targetType, Long targetId, String description, String ipAddress) {
        String actorUsername = username != null ? username : "system";
        String adminName = "System";
        if (!actorUsername.equalsIgnoreCase("system")) {
            adminName = userRepository.findByEmail(actorUsername)
                    .map(User::getName)
                    .orElseGet(() -> userRepository.findByUsername(actorUsername)
                            .map(User::getName)
                            .orElse(actorUsername.contains("@") ? actorUsername.split("@")[0] : actorUsername));
        }
        
        AuditLog log = AuditLog.builder()
                .adminUsername(actorUsername)
                .adminName(adminName)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .description(description)
                .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                .build();
        auditLogRepository.save(log);
    }

    public List<AuditLog> getAllAuditLogs() {
        List<AuditLog> logs = auditLogRepository.findAllByOrderByCreatedAtDesc();
        if (logs.isEmpty()) {
            seedInitialAuditLogs();
            return auditLogRepository.findAllByOrderByCreatedAtDesc();
        }
        return logs;
    }

    public void seedInitialAuditLogs() {
        logAction("admin@kalpanaaafinance.com", "SYSTEM_INITIALIZED", "SYSTEM", 1L, "Kalpanaaa Finance Core Financial Engine & Security Services initialized", "127.0.0.1");
        logAction("admin@kalpanaaafinance.com", "SECURITY_POLICY_UPDATE", "SECURITY", 1L, "JWT Security Tokens & Role-Based Access Control policies enforced across all endpoints", "127.0.0.1");
        logAction("ananya.rao@kalpanaaafinance.com", "CONSULTANT_ACTIVATED", "CONSULTATION", 1L, "Senior Wealth Consultant profile verified and activated for public client bookings", "192.168.1.105");
        logAction("alice@example.com", "LOGIN", "AUTH", 4L, "User successfully authenticated via JWT", "103.24.12.89");
        logAction("alice@example.com", "DEPOSIT_SUCCESS", "DEPOSIT", 101L, "Deposited ₹50,000.00 into Main Wallet via Bank Transfer (Ref: TXN-90214)", "103.24.12.89");
        logAction("admin@kalpanaaafinance.com", "LOAN_APPROVED", "LOAN", 201L, "Approved Loan #201 for Alice Smith after credit check & KYC document verification", "192.168.1.100");
        logAction("bob@example.com", "INVESTMENT_SUBSCRIBED", "INVESTMENT", 301L, "Subscribed to Fixed Return Growth Plan (₹1,00,000.00, 12 Months @ 8.5% p.a.)", "49.37.15.112");
        logAction("admin@kalpanaaafinance.com", "SYSTEM_AUDIT_LOG_REVIEW", "SECURITY", 1L, "Admin reviewed system audit logs and verified platform integrity", "192.168.1.100");
    }

    public void clearAllAuditLogs() {
        auditLogRepository.deleteAll();
        // After clearing, re-seed baseline security system initialization log so logs are never empty
        logAction("admin@kalpanaaafinance.com", "AUDIT_LOGS_CLEARED", "SECURITY", 1L, "Admin cleared historical log records and re-initialized security audit trail", "127.0.0.1");
    }
}

