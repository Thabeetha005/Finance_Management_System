package com.kalpanaafinance.modules.admin.controller;

import com.kalpanaafinance.modules.shared.entity.Document;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.entity.Message;
import com.kalpanaafinance.modules.shared.service.MessageService;
import com.kalpanaafinance.modules.shared.repository.DocumentRepository;
import com.kalpanaafinance.modules.shared.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/documents")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminDocumentController {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final MessageService messageService;

    @GetMapping
    public ResponseEntity<List<Document>> getDocumentsForVerification() {
        List<Document> documents = documentRepository.findAll();
        if (documents.isEmpty()) {
            seedDefaultDocuments();
            documents = documentRepository.findAll();
        }
        return ResponseEntity.ok(documents);
    }

    private void seedDefaultDocuments() {
        List<User> customers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == com.kalpanaafinance.modules.shared.entity.Role.CUSTOMER)
                .collect(java.util.stream.Collectors.toList());

        for (User c : customers) {
            Document doc1 = new Document();
            doc1.setUserId(c.getId());
            doc1.setDocumentType("Aadhaar Card / ID Proof");
            doc1.setFileName(c.getName().replaceAll("\\s+", "_") + "_Aadhaar.pdf");
            doc1.setContentType("application/pdf");
            doc1.setVerificationStatus("PENDING");
            doc1.setUploadedAt(LocalDateTime.now().minusDays(1));
            documentRepository.save(doc1);

            Document doc2 = new Document();
            doc2.setUserId(c.getId());
            doc2.setDocumentType("PAN Card / Tax Proof");
            doc2.setFileName(c.getName().replaceAll("\\s+", "_") + "_PAN.pdf");
            doc2.setContentType("application/pdf");
            doc2.setVerificationStatus("APPROVED");
            doc2.setUploadedAt(LocalDateTime.now().minusDays(2));
            documentRepository.save(doc2);
        }
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<?> getDocumentFile(@PathVariable Long documentId) {
        Document document = documentRepository.findById(documentId).orElse(null);
        if (document == null) {
            return ResponseEntity.notFound().build();
        }

        if (document.getFileData() == null || document.getFileData().length == 0) {
            // Return dummy text file blob so view doesn't error
            byte[] dummyBytes = ("Document ID: " + document.getId() + "\nFile Name: " + document.getFileName() + "\nType: " + document.getDocumentType()).getBytes();
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_PLAIN)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + document.getFileName() + ".txt\"")
                    .body(dummyBytes);
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.getContentType() != null ? document.getContentType() : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + document.getFileName() + "\"")
                .body(document.getFileData());
    }

    @PostMapping("/{documentId}/verify")
    public ResponseEntity<?> verifyDocument(@PathVariable Long documentId, @RequestBody Map<String, String> payload) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(email).orElse(null);

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
        if (admin != null) {
            document.setReviewedBy(admin.getId());
        }

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
