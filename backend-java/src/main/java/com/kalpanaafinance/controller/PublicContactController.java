package com.kalpanaafinance.controller;

import com.kalpanaafinance.modules.shared.entity.ContactRequest;
import com.kalpanaafinance.modules.shared.repository.ContactRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class PublicContactController {

    private final ContactRequestRepository contactRequestRepository;

    @PostMapping("/contact-requests")
    public ResponseEntity<ContactRequest> submitContactRequest(@RequestBody Map<String, String> payload) {
        ContactRequest request = new ContactRequest();
        request.setName(payload.getOrDefault("name", "Unknown"));
        request.setEmail(payload.getOrDefault("email", "Unknown"));
        request.setPhone(payload.getOrDefault("phone", ""));
        request.setSubject(payload.getOrDefault("subject", "General Inquiry"));
        request.setMessage(payload.getOrDefault("message", ""));
        request.setRequestType("Contact");
        request.setStatus("NEW");
        
        return ResponseEntity.ok(contactRequestRepository.save(request));
    }

    @PostMapping("/consultations")
    public ResponseEntity<ContactRequest> submitPublicConsultation(@RequestBody Map<String, String> payload) {
        ContactRequest request = new ContactRequest();
        request.setName(payload.getOrDefault("name", "Unknown"));
        request.setEmail(payload.getOrDefault("email", "Unknown"));
        request.setPhone(payload.getOrDefault("phone", ""));
        
        String topic = payload.getOrDefault("topic", "General Consultation");
        String date = payload.getOrDefault("date", "Not specified");
        
        request.setSubject("Consultation Request: " + topic);
        request.setRequestType("Consultation Booking");
        request.setMessage("Preferred Date/Time: " + date + "\n\nMessage: " + payload.getOrDefault("message", ""));
        request.setStatus("NEW");
        
        return ResponseEntity.ok(contactRequestRepository.save(request));
    }
}
