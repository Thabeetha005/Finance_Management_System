package com.kalpanaafinance.controller;

import com.kalpanaafinance.entity.ContactRequest;
import com.kalpanaafinance.entity.User;
import com.kalpanaafinance.entity.Message;
import com.kalpanaafinance.repository.ContactRequestRepository;
import com.kalpanaafinance.repository.UserRepository;
import com.kalpanaafinance.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import jakarta.servlet.http.HttpServletRequest;
import com.kalpanaafinance.service.AuditService;

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
        List<User> activeUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == com.kalpanaafinance.entity.Role.CUSTOMER)
                .limit(15)
                .collect(java.util.stream.Collectors.toList());

        java.util.Set<String> activeEmails = activeUsers.stream()
                .map(User::getEmail)
                .filter(java.util.Objects::nonNull)
                .map(String::toLowerCase)
                .collect(java.util.stream.Collectors.toSet());

        List<ContactRequest> requests = repository.findAll().stream()
                .filter(cr -> cr.getEmail() != null && activeEmails.contains(cr.getEmail().toLowerCase()))
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(requests);
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
