package com.kalpanaafinance.controller;

import com.kalpanaafinance.dto.ConsultantProfileRequest;
import com.kalpanaafinance.modules.shared.entity.ConsultantProfile;
import com.kalpanaafinance.modules.consultant.service.ConsultantService;
import com.kalpanaafinance.modules.shared.repository.ConsultationSessionRepository;
import com.kalpanaafinance.modules.shared.entity.ConsultationSession;
import com.kalpanaafinance.modules.shared.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/consultants")
@RequiredArgsConstructor
public class AdminConsultantController {

    private final ConsultantService consultantService;
    private final ConsultationSessionRepository sessionRepository;
    private final AuditService auditService;

    private final com.kalpanaafinance.modules.shared.repository.UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ConsultantProfile>> getAllConsultants() {
        return ResponseEntity.ok(consultantService.getAllConsultants());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsultantProfile> getConsultantById(@PathVariable Long id) {
        return ResponseEntity.ok(consultantService.getConsultantById(id));
    }

    @GetMapping("/{id}/sessions")
    public ResponseEntity<List<ConsultationSession>> getConsultantSessions(@PathVariable Long id) {
        return ResponseEntity.ok(sessionRepository.findByAssignmentConsultantId(id));
    }

    @PostMapping
    public ResponseEntity<ConsultantProfile> createConsultant(@RequestBody ConsultantProfileRequest request, Authentication auth) {
        ConsultantProfile profile = consultantService.createConsultant(request);
        auditService.logAction(
            auth != null ? auth.getName() : "System",
            "CREATE_CONSULTANT",
            "CONSULTANT",
            profile.getUser().getId(),
            "Added consultant " + profile.getUser().getName(),
            null
        );
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConsultantProfile> updateConsultant(@PathVariable Long id, @RequestBody ConsultantProfileRequest request, Authentication auth) {
        ConsultantProfile profile = consultantService.updateConsultant(id, request);
        auditService.logAction(
            auth != null ? auth.getName() : "System",
            "UPDATE_CONSULTANT",
            "CONSULTANT",
            id,
            "Updated consultant " + profile.getUser().getName(),
            null
        );
        return ResponseEntity.ok(profile);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConsultant(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            @RequestBody(required = false) java.util.Map<String, String> body,
            jakarta.servlet.http.HttpServletRequest httpRequest,
            Authentication auth) {

        String deletionReason = (reason != null && !reason.trim().isEmpty()) 
                ? reason 
                : (body != null ? body.get("reason") : null);

        if (deletionReason == null || deletionReason.trim().isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Deletion reason is mandatory");
        }

        String email = auth != null ? auth.getName() : "System";
        com.kalpanaafinance.modules.shared.entity.User admin = userRepository.findByEmail(email).orElse(null);
        Long adminId = admin != null ? admin.getId() : 1L;
        String clientIp = httpRequest != null ? httpRequest.getRemoteAddr() : "127.0.0.1";

        consultantService.deleteConsultant(adminId, id, deletionReason.trim(), clientIp);
        
        return ResponseEntity.ok().build();
    }
}
