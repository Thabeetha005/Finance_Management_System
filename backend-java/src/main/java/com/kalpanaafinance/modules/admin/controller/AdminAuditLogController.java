package com.kalpanaafinance.modules.admin.controller;

import com.kalpanaafinance.modules.shared.entity.AuditLog;
import com.kalpanaafinance.modules.shared.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAuditLogController {

    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAllAuditLogs() {
        return ResponseEntity.ok(auditService.getAllAuditLogs());
    }

    @org.springframework.web.bind.annotation.DeleteMapping
    public ResponseEntity<Void> clearAuditLogs() {
        auditService.clearAllAuditLogs();
        return ResponseEntity.ok().build();
    }
}
