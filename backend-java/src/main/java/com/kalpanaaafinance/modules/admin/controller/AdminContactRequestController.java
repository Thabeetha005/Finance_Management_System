package com.kalpanaaafinance.modules.admin.controller;

import com.kalpanaaafinance.modules.shared.entity.ContactRequest;
import com.kalpanaaafinance.modules.shared.entity.User;
import com.kalpanaaafinance.modules.shared.entity.Message;
import com.kalpanaaafinance.modules.shared.repository.ContactRequestRepository;
import com.kalpanaaafinance.modules.shared.repository.UserRepository;
import com.kalpanaaafinance.modules.shared.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import jakarta.servlet.http.HttpServletRequest;
import com.kalpanaaafinance.modules.shared.service.AuditService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/contact-requests")
@PreAuthorize("hasRole('ADMIN')")
public class AdminContactRequestController {

    @Autowired
    private ContactRequestRepository repository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageService messageService;

    @Autowired
    private AuditService auditService;

    @GetMapping
    public ResponseEntity<List<ContactRequest>> getAll() {
        List<ContactRequest> requests = repository.findAll();
        if (requests.isEmpty()) {
            seedDefaultContactRequests();
            requests = repository.findAll();
        }
        requests.sort(java.util.Comparator.comparing(ContactRequest::getId, java.util.Comparator.nullsLast(Long::compareTo)).reversed());
        return ResponseEntity.ok(requests);
    }

    private void seedDefaultContactRequests() {
        ContactRequest req1 = new ContactRequest();
        req1.setName("Rajesh Sharma");
        req1.setEmail("rajesh.sharma@example.com");
        req1.setPhone("+91 98765 11223");
        req1.setSubject("Inquiry regarding Corporate Wealth Management");
        req1.setMessage("Interested in setting up a corporate treasury portfolio for our enterprise.");
        req1.setRequestType("Corporate Advisory");
        req1.setStatus("NEW");
        repository.save(req1);

        ContactRequest req2 = new ContactRequest();
        req2.setName("Meera Kapoor");
        req2.setEmail("meera.kapoor@example.com");
        req2.setPhone("+91 98200 44556");
        req2.setSubject("Home Loan Rate Locking Consultation");
        req2.setMessage("Looking for guidance on current floating vs fixed interest rates.");
        req2.setRequestType("Lending Consultation");
        req2.setStatus("NEW");
        repository.save(req2);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactRequest> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ContactRequest> create(@RequestBody ContactRequest entity) {
        return ResponseEntity.ok(repository.save(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactRequest> update(@PathVariable Long id, @RequestBody ContactRequest entity) {
        if(!repository.existsById(id)) return ResponseEntity.notFound().build();
        entity.setId(id);
        return ResponseEntity.ok(repository.save(entity));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ContactRequest> updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload, Authentication authentication, HttpServletRequest httpRequest) {
        if(!repository.existsById(id)) return ResponseEntity.notFound().build();
        ContactRequest entity = repository.findById(id).get();
        String newStatus = payload.get("status");
        entity.setStatus(newStatus);
        ContactRequest saved = repository.save(entity);
        
        Optional<User> userOpt = userRepository.findByEmail(entity.getEmail());
        if (userOpt.isPresent()) {
            messageService.sendSystemMessage(
                userOpt.get().getId(),
                "Contact Request Update",
                "Your contact request regarding '" + entity.getSubject() + "' status has been updated to: " + newStatus,
                Message.EntityType.SYSTEM,
                entity.getId()
            );
        }
        
        auditService.logAction(
            authentication != null ? authentication.getName() : "system",
            "UPDATE_STATUS",
            "CONTACT_REQUEST",
            saved.getId(),
            "Updated contact request status to " + newStatus,
            httpRequest.getRemoteAddr()
        );
        
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<ContactRequest> resolve(@PathVariable Long id, Authentication authentication, HttpServletRequest httpRequest) {
        if(!repository.existsById(id)) return ResponseEntity.notFound().build();
        ContactRequest entity = repository.findById(id).get();
        entity.setStatus("RESOLVED");
        ContactRequest saved = repository.save(entity);
        
        Optional<User> userOpt = userRepository.findByEmail(entity.getEmail());
        if (userOpt.isPresent()) {
            messageService.sendSystemMessage(
                userOpt.get().getId(),
                "Contact Request Resolved",
                "Your contact request regarding '" + entity.getSubject() + "' has been resolved.",
                Message.EntityType.SYSTEM,
                entity.getId()
            );
        }
        
        auditService.logAction(
            authentication != null ? authentication.getName() : "system",
            "RESOLVE",
            "CONTACT_REQUEST",
            saved.getId(),
            "Resolved contact request",
            httpRequest.getRemoteAddr()
        );
        
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if(!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
