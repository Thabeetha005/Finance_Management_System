package com.kalpanaafinance.modules.admin.controller;

import com.kalpanaafinance.modules.shared.dto.ConsultationAssignmentRequest;
import com.kalpanaafinance.modules.shared.entity.ConsultantProfile;
import com.kalpanaafinance.modules.shared.entity.Consultation;
import com.kalpanaafinance.modules.shared.entity.ConsultationAssignment;
import com.kalpanaafinance.modules.shared.entity.ConsultationSession;
import com.kalpanaafinance.modules.shared.repository.ConsultantProfileRepository;
import com.kalpanaafinance.modules.shared.repository.ConsultationAssignmentRepository;
import com.kalpanaafinance.modules.shared.repository.ConsultationRepository;
import com.kalpanaafinance.modules.shared.repository.ConsultationSessionRepository;
import com.kalpanaafinance.modules.shared.repository.MessageRepository;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.repository.UserRepository;
import com.kalpanaafinance.modules.shared.entity.ConsultationAssignment;
import com.kalpanaafinance.modules.shared.entity.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/consultations")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminConsultationController {

    private final ConsultationRepository repository;
    private final ConsultationAssignmentRepository assignmentRepository;
    private final ConsultantProfileRepository consultantProfileRepository;
    private final ConsultationSessionRepository sessionRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Consultation>> getAll() {
        List<Consultation> consultations = repository.findAllWithUser();
        for (Consultation c : consultations) {
            // Find Assignment
            assignmentRepository.findByConsultationId(c.getId()).ifPresent(assignment -> {
                if (assignment.getConsultant() != null) {
                    if (assignment.getConsultant().getUser() != null && assignment.getConsultant().getUser().getName() != null) {
                        c.setAssignedConsultantName(assignment.getConsultant().getUser().getName());
                    } else {
                        c.setAssignedConsultantName(assignment.getConsultant().getSpecialization());
                    }
                }
            });

            // Find Messages & Actions
            List<Message> msgs = messageRepository.findByRelatedEntityTypeAndRelatedEntityIdOrderByCreatedAtDesc(Message.EntityType.CONSULTATION, c.getId());
            if (!msgs.isEmpty()) {
                Message latest = msgs.get(0);
                c.setClientSeenStatus(latest.getIsRead() != null ? latest.getIsRead() : false);
                if (latest.getSubject().contains("Approved")) c.setAdminActionTaken("Approved");
                else if (latest.getSubject().contains("Denied")) c.setAdminActionTaken("Denied");
                else if (latest.getSubject().contains("Rescheduled")) c.setAdminActionTaken("Rescheduled");
                else if (latest.getSubject().contains("Assigned")) c.setAdminActionTaken("Assigned");
            }
            
            // Fallbacks for action if no message exists
            if (c.getAdminActionTaken() == null) {
                if ("APPROVED".equals(c.getStatus()) || "CONFIRMED".equals(c.getStatus())) c.setAdminActionTaken("Approved");
                else if ("REJECTED".equals(c.getStatus())) c.setAdminActionTaken("Denied");
                else if ("RESCHEDULED".equals(c.getStatus())) c.setAdminActionTaken("Rescheduled");
                else if ("CONSULTANT_ASSIGNED_PENDING_APPROVAL".equals(c.getStatus())) c.setAdminActionTaken("Assigned");
            }
        }
        return ResponseEntity.ok(consultations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Consultation> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private final com.kalpanaafinance.modules.shared.service.AuditService auditService;

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Consultation> approve(@PathVariable Long id, org.springframework.security.core.Authentication auth) {
        Consultation consultation = repository.findById(id).orElseThrow();
        consultation.setStatus("APPROVED");
        consultation = repository.save(consultation);

        createConsultationMessage(consultation, "Consultation Approved", "Your consultation on " + consultation.getPreferredDate() + " has been approved.");
        
        String email = auth != null ? auth.getName() : "admin@kalpanaafinance.com";
        auditService.logAction(email, "CONSULTATION_APPROVED", "CONSULTATION", id, "Approved consultation #" + id + " for " + (consultation.getUser() != null ? consultation.getUser().getName() : "Client"), "127.0.0.1");

        return ResponseEntity.ok(consultation);
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Consultation> reject(@PathVariable Long id, @RequestBody(required = false) java.util.Map<String, String> payload, org.springframework.security.core.Authentication auth) {
        Consultation consultation = repository.findById(id).orElseThrow();
        consultation.setStatus("REJECTED");
        consultation = repository.save(consultation);

        String reason = (payload != null && payload.containsKey("reason")) ? payload.get("reason") : "No reason provided.";
        createConsultationMessage(consultation, "Consultation Denied", "Your consultation was denied. Reason: " + reason);

        String email = auth != null ? auth.getName() : "admin@kalpanaafinance.com";
        auditService.logAction(email, "CONSULTATION_DENIED", "CONSULTATION", id, "Denied consultation #" + id + ". Reason: " + reason, "127.0.0.1");

        return ResponseEntity.ok(consultation);
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<ConsultationAssignment> assign(@PathVariable Long id, @RequestBody ConsultationAssignmentRequest request, org.springframework.security.core.Authentication auth) {
        Consultation consultation = repository.findById(id).orElseThrow();
        ConsultantProfile consultant = consultantProfileRepository.findById(request.getConsultantId()).orElseThrow();
        
        ConsultationAssignment assignment = assignmentRepository.findByConsultationId(id).orElse(new ConsultationAssignment());
        assignment.setConsultation(consultation);
        assignment.setConsultant(consultant);
        assignment.setStatus("PENDING_APPROVAL");
        assignment = assignmentRepository.save(assignment);
        
        consultation.setStatus("CONSULTANT_ASSIGNED_PENDING_APPROVAL");
        consultation = repository.save(consultation);

        String consultantName = (consultant.getUser() != null && consultant.getUser().getName() != null) ? consultant.getUser().getName() : "Consultant #" + consultant.getId();
        createConsultationMessage(consultation, "Consultant Assigned", "Consultant " + consultantName + " has been assigned to your session.");
        
        String email = auth != null ? auth.getName() : "admin@kalpanaafinance.com";
        auditService.logAction(email, "CONSULTANT_ASSIGNED", "CONSULTATION", id, "Assigned consultant " + consultantName + " to consultation #" + id, "127.0.0.1");

        return ResponseEntity.ok(assignment);
    }

    @PatchMapping("/{id}/approve-assignment")
    public ResponseEntity<ConsultationSession> approveAssignment(@PathVariable Long id) {
        Consultation consultation = repository.findById(id).orElseThrow();
        ConsultationAssignment assignment = assignmentRepository.findByConsultationId(id).orElseThrow();
        
        assignment.setStatus("APPROVED");
        assignment.setApprovedAt(LocalDateTime.now());
        assignmentRepository.save(assignment);
        
        consultation.setStatus("APPROVED");
        repository.save(consultation);
        
        ConsultationSession session = new ConsultationSession();
        session.setAssignment(assignment);
        session.setStatus("SCHEDULED");
        session = sessionRepository.save(session);
        
        return ResponseEntity.ok(session);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Consultation> cancel(@PathVariable Long id) {
        Consultation consultation = repository.findById(id).orElseThrow();
        consultation.setStatus("CANCELLED");
        return ResponseEntity.ok(repository.save(consultation));
    }

    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<Consultation> reschedule(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        Consultation consultation = repository.findById(id).orElseThrow();
        if (payload.containsKey("date")) {
            consultation.setPreferredDate(java.time.LocalDate.parse(payload.get("date")));
        }
        if (payload.containsKey("time")) {
            consultation.setPreferredTime(payload.get("time"));
        }
        consultation.setStatus("RESCHEDULED");
        consultation = repository.save(consultation);

        createConsultationMessage(consultation, "Consultation Rescheduled", "Your consultation was rescheduled to " + consultation.getPreferredDate() + " at " + consultation.getPreferredTime() + ".");

        return ResponseEntity.ok(consultation);
    }

    private void createConsultationMessage(Consultation consultation, String subject, String body) {
        Message message = new Message();
        message.setRecipientUserId(consultation.getUser().getId());
        message.setSenderRole("ADMIN");
        message.setSubject(subject);
        message.setMessageContent(body);
        message.setMessageType(Message.MessageType.NOTIFICATION);
        message.setRelatedEntityType(Message.EntityType.CONSULTATION);
        message.setRelatedEntityId(consultation.getId());
        messageRepository.save(message);
    }
}
