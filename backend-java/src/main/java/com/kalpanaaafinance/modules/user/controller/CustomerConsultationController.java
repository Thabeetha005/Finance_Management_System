package com.kalpanaaafinance.modules.user.controller;

import com.kalpanaaafinance.modules.shared.entity.Consultation;
import com.kalpanaaafinance.modules.shared.entity.User;
import com.kalpanaaafinance.modules.shared.repository.ConsultationRepository;
import com.kalpanaaafinance.modules.shared.repository.UserRepository;
import com.kalpanaaafinance.modules.shared.repository.ConsultantProfileRepository;
import com.kalpanaaafinance.modules.shared.repository.ConsultationAssignmentRepository;
import com.kalpanaaafinance.modules.shared.repository.ConsultationSessionRepository;
import com.kalpanaaafinance.modules.shared.entity.ConsultationAssignment;
import com.kalpanaaafinance.modules.shared.entity.ConsultationSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/customer/consultations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class CustomerConsultationController {

    private final ConsultationRepository consultationRepository;
    private final UserRepository userRepository;
    private final ConsultantProfileRepository consultantProfileRepository;
    private final ConsultationAssignmentRepository assignmentRepository;
    private final ConsultationSessionRepository sessionRepository;
    private final com.kalpanaaafinance.modules.shared.repository.MessageRepository messageRepository;

    @GetMapping
    public ResponseEntity<List<Consultation>> getMyConsultations(Authentication authentication) {
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(consultationRepository.findByUserIdWithUser(userOpt.get().getId()));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> bookConsultation(Authentication authentication, @RequestBody Map<String, String> payload) {
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Consultation consultation = new Consultation();
            consultation.setUser(user);
            consultation.setType(payload.getOrDefault("type", "General"));
            
            // Extract and parse preferred date
            String dateStr = payload.get("date");
            if (dateStr != null && !dateStr.isEmpty()) {
                consultation.setPreferredDate(LocalDate.parse(dateStr));
            } else {
                consultation.setPreferredDate(LocalDate.now().plusDays(1));
            }
            
            consultation.setPreferredTime(payload.getOrDefault("time", "10:00"));
            consultation.setMessage(payload.getOrDefault("query", ""));
            consultation.setStatus("PENDING");
            String expertName = payload.getOrDefault("expert", "Any");
            consultation.setNotes("Expert: " + expertName);
            
            Consultation saved = consultationRepository.save(consultation);

            if (!"Any".equalsIgnoreCase(expertName)) {
                consultantProfileRepository.findByUser_NameIgnoreCase(expertName).ifPresent(consultant -> {
                    ConsultationAssignment assignment = new ConsultationAssignment();
                    assignment.setConsultation(saved);
                    assignment.setConsultant(consultant);
                    assignment.setStatus("PENDING_APPROVAL");
                    assignment = assignmentRepository.save(assignment);
                    
                    // Auto-create session so it appears in consultant's upcoming sessions as REQUESTED
                    ConsultationSession session = new ConsultationSession();
                    session.setAssignment(assignment);
                    session.setStatus("REQUESTED");
                    sessionRepository.save(session);
                    
                    saved.setStatus("CONSULTANT_ASSIGNED_PENDING_APPROVAL");
                    consultationRepository.save(saved);
                    
                    // Create notification for consultant
                    com.kalpanaaafinance.modules.shared.entity.Message msg = new com.kalpanaaafinance.modules.shared.entity.Message();
                    msg.setSenderUserId(user.getId());
                    msg.setRecipientUserId(consultant.getUser().getId());
                    msg.setSubject("New Consultation Request");
                    msg.setMessageContent("A client has requested a consultation with you for " + saved.getType() + " on " + saved.getPreferredDate());
                    msg.setIsRead(false);
                    msg.setRelatedEntityType(com.kalpanaaafinance.modules.shared.entity.Message.EntityType.CONSULTATION);
                    msg.setRelatedEntityId(saved.getId());
                    messageRepository.save(msg);
                });
            }

            return ResponseEntity.ok(saved);
        }
        
        return ResponseEntity.badRequest().body("User not found");
    }
}
