package com.kalpanaafinance.modules.shared.controller;

import com.kalpanaafinance.modules.shared.entity.ContactRequest;
import com.kalpanaafinance.modules.shared.entity.Consultation;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.entity.Role;
import com.kalpanaafinance.modules.shared.repository.ContactRequestRepository;
import com.kalpanaafinance.modules.shared.repository.ConsultationRepository;
import com.kalpanaafinance.modules.shared.repository.UserRepository;
import com.kalpanaafinance.modules.shared.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class PublicContactController {

    private final ContactRequestRepository contactRequestRepository;
    private final ConsultationRepository consultationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @PostMapping({"/contact", "/contact-requests"})
    public ResponseEntity<ContactRequest> submitContactRequest(@RequestBody Map<String, String> payload) {
        String name = payload.getOrDefault("name", "Public Visitor");
        String email = payload.getOrDefault("email", "visitor@example.com");
        String phone = payload.getOrDefault("phone", "");
        String subject = payload.getOrDefault("subject", "General Inquiry");
        String message = payload.getOrDefault("message", "");

        ContactRequest request = new ContactRequest();
        request.setName(name);
        request.setEmail(email);
        request.setPhone(phone);
        request.setSubject(subject);
        request.setMessage(message);
        request.setRequestType(payload.getOrDefault("category", "Contact Inquiry"));
        request.setStatus("NEW");

        ContactRequest saved = contactRequestRepository.save(request);

        auditService.logAction(email, "CONTACT_INQUIRY_SUBMITTED", "CONTACT_REQUEST", saved.getId(),
                "New contact inquiry received from " + name + " (" + email + ")", "127.0.0.1");

        return ResponseEntity.ok(saved);
    }

    @PostMapping({"/consultations", "/book-consultation"})
    public ResponseEntity<Consultation> submitPublicConsultation(@RequestBody Map<String, String> payload) {
        String name = payload.getOrDefault("name", "Public Client");
        String email = payload.getOrDefault("email", "client@example.com");
        String phone = payload.getOrDefault("phone", "");
        String topic = payload.getOrDefault("topic", payload.getOrDefault("type", "General Financial Consultation"));
        String dateStr = payload.getOrDefault("date", payload.getOrDefault("preferredDate", ""));
        String timeStr = payload.getOrDefault("time", payload.getOrDefault("preferredTime", "10:00 AM"));
        String query = payload.getOrDefault("message", payload.getOrDefault("query", "Public consultation request via landing portal"));

        // 1. Find or create user record
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setName(name);
            newUser.setEmail(email);
            newUser.setPhone(phone);
            newUser.setRole(Role.CUSTOMER);
            newUser.setPasswordHash(passwordEncoder.encode("TempPass123!"));
            return userRepository.save(newUser);
        });

        // 2. Create Consultation Entity for Admin Consultations
        Consultation consultation = new Consultation();
        consultation.setUser(user);
        consultation.setType(topic);
        if (dateStr != null && !dateStr.isBlank()) {
            try {
                consultation.setPreferredDate(LocalDate.parse(dateStr));
            } catch (Exception e) {
                consultation.setPreferredDate(LocalDate.now().plusDays(1));
            }
        } else {
            consultation.setPreferredDate(LocalDate.now().plusDays(1));
        }
        consultation.setPreferredTime(timeStr);
        consultation.setMessage(query);
        consultation.setStatus("PENDING");
        consultation.setNotes("Origin: Public Landing Page");

        Consultation savedConsultation = consultationRepository.save(consultation);

        // 3. Create ContactRequest Entity for Admin Contact Requests
        ContactRequest contactReq = new ContactRequest();
        contactReq.setName(name);
        contactReq.setEmail(email);
        contactReq.setPhone(phone);
        contactReq.setSubject("Consultation Request: " + topic);
        contactReq.setMessage("Preferred Date/Time: " + consultation.getPreferredDate() + " / " + timeStr + "\nMessage: " + query);
        contactReq.setRequestType("Consultation Booking");
        contactReq.setStatus("NEW");
        contactRequestRepository.save(contactReq);

        auditService.logAction(email, "PUBLIC_CONSULTATION_SUBMITTED", "CONSULTATION", savedConsultation.getId(),
                "New consultation booking request submitted by " + name + " (" + email + ")", "127.0.0.1");

        return ResponseEntity.ok(savedConsultation);
    }
}
