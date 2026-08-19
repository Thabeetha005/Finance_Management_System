package com.kalpanaafinance.controller;

import com.kalpanaafinance.modules.shared.entity.Document;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.entity.Message;
import com.kalpanaafinance.service.MessageService;
import com.kalpanaafinance.modules.shared.repository.DocumentRepository;
import com.kalpanaafinance.modules.shared.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/documents")
@RequiredArgsConstructor
public class AdminDocumentController {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final MessageService messageService;

    @GetMapping
    public ResponseEntity<List<Document>> getDocumentsForVerification() {
        List<User> activeUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == com.kalpanaafinance.modules.shared.entity.Role.CUSTOMER)
                .limit(15)
                .collect(java.util.stream.Collectors.toList());

        java.util.Set<Long> validUserIds = activeUsers.stream()
                .map(User::getId)
                .collect(java.util.stream.Collectors.toSet());

        List<Document> documents = documentRepository.findAll().stream()
                .filter(doc -> doc.getUserId() != null && validUserIds.contains(doc.getUserId()))
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(documents);
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<?> getDocumentFile(@PathVariable Long documentId) {
        Document document = documentRepository.findById(documentId).orElse(null);
        if (document == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + document.getFileName() + "\"")
                .body(document.getFileData());
    }

    @PostMapping("/{documentId}/verify")
    public ResponseEntity<?> verifyDocument(@PathVariable Long documentId, @RequestBody Map<String, String> payload) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(email).orElse(null);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        Document document = documentRepository.findById(documentId).orElse(null);
        if (document == null) {
            return ResponseEntity.notFound().build();
        }

        String status = payload.get("verificationStatus");
        String note = payload.get("adminNote");

        if (status == null || (!status.equals("APPROVED") && !status.equals("REJECTED"))) {
            return ResponseEntity.badRequest().body("Invalid verificationStatus. Must be APPROVED or REJECTED");
        }

        document.setVerificationStatus(status);
        document.setAdminNote(note);
        document.setReviewedAt(LocalDateTime.now());
        document.setReviewedBy(admin.getId());

        documentRepository.save(document);

        if ("APPROVED".equals(status)) {
            userRepository.findById(document.getUserId()).ifPresent(customer -> {
                if (customer.getIsVerified() == null || !customer.getIsVerified()) {
                    customer.setIsVerified(true);
                    userRepository.save(customer);
                }
            });
        }

        if ("APPROVED".equals(status)) {
            messageService.sendSystemMessage(
                    document.getUserId(),
                    "Document Verified",
                    "Your document " + document.getFileName() + " has been approved.",
                    Message.EntityType.DOCUMENT,
                    document.getId()
            );
        } else if ("REJECTED".equals(status)) {
            messageService.sendSystemMessage(
                    document.getUserId(),
                    "Document Resubmission Required",
                    "Your document " + document.getFileName() + " has been rejected. Note: " + note,
                    Message.EntityType.DOCUMENT,
                    document.getId()
            );
        }

        return ResponseEntity.ok("Document verification status updated");
    }
}
