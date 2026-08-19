package com.kalpanaafinance.modules.consultant.controller;

import com.kalpanaafinance.modules.shared.service.AuditService;

import com.kalpanaafinance.dto.ConsultationNoteRequest;
import com.kalpanaafinance.modules.shared.entity.*;
import com.kalpanaafinance.modules.shared.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/consultant/sessions")
@PreAuthorize("hasRole('CONSULTANT')")
@RequiredArgsConstructor
public class ConsultantSessionController {

    private final UserRepository userRepository;
    private final ConsultantProfileRepository profileRepository;
    private final ConsultationSessionRepository sessionRepository;
    private final ConsultationNoteRepository noteRepository;
    private final ConsultationRepository consultationRepository;
    private final MessageRepository messageRepository;
    private final com.kalpanaafinance.modules.shared.service.AuditService auditService;

    private ConsultantProfile getProfile(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return profileRepository.findByUserId(user.getId()).orElseThrow();
    }

    private ConsultationSession getSession(Long id, ConsultantProfile profile) {
        ConsultationSession session = sessionRepository.findById(id).orElseThrow();
        if (!session.getAssignment().getConsultant().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized access to session");
        }
        return session;
    }

    @GetMapping
    public ResponseEntity<List<ConsultationSession>> getAll(Authentication authentication) {
        ConsultantProfile profile = getProfile(authentication);
        return ResponseEntity.ok(sessionRepository.findByAssignmentConsultantId(profile.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsultationSession> getById(@PathVariable Long id, Authentication authentication) {
        ConsultantProfile profile = getProfile(authentication);
        return ResponseEntity.ok(getSession(id, profile));
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<ConsultationSession> accept(@PathVariable Long id, Authentication authentication) {
        ConsultantProfile profile = getProfile(authentication);
        ConsultationSession session = getSession(id, profile);
        session.setStatus("ACCEPTED");
        
        Consultation consultation = session.getAssignment().getConsultation();
        consultation.setStatus("ACCEPTED");
        consultationRepository.save(consultation);

        User client = consultation.getUser();
        Message msg = Message.builder()
                .senderUserId(profile.getUser().getId())
                .recipientUserId(client.getId())
                .subject("Consultation Session Approved")
                .messageContent("Your consultation session scheduled for " + consultation.getPreferredDate() + " has been approved by the consultant.")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        messageRepository.save(msg);
        
        auditService.logAction(
                authentication.getName(),
                "ACCEPT_SESSION",
                "CONSULTATION_SESSION",
                id,
                "Consultant accepted session " + id,
                "127.0.0.1"
        );

        return ResponseEntity.ok(sessionRepository.save(session));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ConsultationSession> reject(@PathVariable Long id, Authentication authentication) {
        ConsultationSession session = getSession(id, getProfile(authentication));
        session.setStatus("CANCELLED");
        
        Consultation consultation = session.getAssignment().getConsultation();
        consultation.setStatus("CANCELLED");
        consultationRepository.save(consultation);
        
        auditService.logAction(
                authentication.getName(),
                "REJECT_SESSION",
                "CONSULTATION_SESSION",
                id,
                "Consultant rejected session " + id,
                "127.0.0.1"
        );
        
        return ResponseEntity.ok(sessionRepository.save(session));
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<ConsultationSession> start(@PathVariable Long id, Authentication authentication) {
        ConsultationSession session = getSession(id, getProfile(authentication));
        session.setStatus("IN_PROGRESS");
        session.setActualStartTime(LocalDateTime.now());
        
        Consultation consultation = session.getAssignment().getConsultation();
        consultation.setStatus("IN_PROGRESS");
        consultationRepository.save(consultation);
        
        auditService.logAction(
                authentication.getName(),
                "START_SESSION",
                "CONSULTATION_SESSION",
                id,
                "Consultant started session " + id,
                "127.0.0.1"
        );
        
        return ResponseEntity.ok(sessionRepository.save(session));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ConsultationSession> complete(@PathVariable Long id, Authentication authentication) {
        ConsultationSession session = getSession(id, getProfile(authentication));
        session.setStatus("COMPLETED");
        session.setActualEndTime(LocalDateTime.now());
        
        Consultation consultation = session.getAssignment().getConsultation();
        consultation.setStatus("COMPLETED");
        consultationRepository.save(consultation);
        
        auditService.logAction(
                authentication.getName(),
                "COMPLETE_SESSION",
                "CONSULTATION_SESSION",
                id,
                "Consultant completed session " + id,
                "127.0.0.1"
        );
        
        return ResponseEntity.ok(sessionRepository.save(session));
    }

    @PostMapping("/{id}/notes")
    public ResponseEntity<ConsultationNote> addNote(@PathVariable Long id, @RequestBody ConsultationNoteRequest request, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        ConsultationSession session = getSession(id, profileRepository.findByUserId(user.getId()).orElseThrow());
        
        ConsultationNote note = new ConsultationNote();
        note.setSession(session);
        note.setAuthor(user);
        note.setContent(request.getContent());
        note.setIsPrivate(request.getIsPrivate());
        
        return ResponseEntity.ok(noteRepository.save(note));
    }
}
