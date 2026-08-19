package com.kalpanaafinance.modules.user.controller;

import com.kalpanaafinance.modules.shared.dto.ApplicationDocumentDTO;
import com.kalpanaafinance.modules.shared.dto.LinkDocumentRequest;
import com.kalpanaafinance.modules.shared.entity.ApplicationDocument;
import com.kalpanaafinance.modules.shared.entity.Document;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.repository.ApplicationDocumentRepository;
import com.kalpanaafinance.modules.shared.repository.DocumentRepository;
import com.kalpanaafinance.modules.shared.repository.UserRepository;
import com.kalpanaafinance.modules.shared.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentRepository documentRepository;
    private final ApplicationDocumentRepository applicationDocumentRepository;
    private final UserRepository userRepository;
    private final MessageService messageService;

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList("image/jpeg", "image/png", "application/pdf");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private User getAuthenticatedUser(Authentication auth) {
        String email = auth != null ? auth.getName() : SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated user"));
    }

    @GetMapping("/reuse-eligible")
    public ResponseEntity<List<Document>> getReuseEligibleDocuments(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        List<Document> verifiedDocs = documentRepository.findByUserId(user.getId()).stream()
                .filter(d -> "VERIFIED".equalsIgnoreCase(d.getVerificationStatus()) || "APPROVED".equalsIgnoreCase(d.getVerificationStatus()))
                .map(doc -> Document.builder()
                        .id(doc.getId())
                        .userId(doc.getUserId())
                        .applicationId(doc.getApplicationId())
                        .applicationType(doc.getApplicationType())
                        .documentType(doc.getDocumentType())
                        .fileName(doc.getFileName())
                        .contentType(doc.getContentType())
                        .fileSize(doc.getFileSize())
                        .verificationStatus("VERIFIED")
                        .version(doc.getVersion() != null ? doc.getVersion() : 1)
                        .uploadedAt(doc.getUploadedAt())
                        .build())
                .toList();
        return ResponseEntity.ok(verifiedDocs);
    }

    @PostMapping("/link-existing")
    @Transactional
    public ResponseEntity<ApplicationDocumentDTO> linkExistingDocument(@RequestBody LinkDocumentRequest req, Authentication auth) {
        User currentUser = getAuthenticatedUser(auth);

        if (req.getApplicationId() == null || req.getApplicationType() == null || req.getDocumentId() == null || req.getDocumentType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ApplicationId, ApplicationType, DocumentId, and DocumentType are required");
        }

        Document document = documentRepository.findById(req.getDocumentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

        // BACKEND SECURITY RULE ENFORCEMENT
        if (!document.getUserId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Security Violation: Customer cannot reference another customer's document");
        }

        String status = document.getVerificationStatus();
        if (!"VERIFIED".equalsIgnoreCase(status) && !"APPROVED".equalsIgnoreCase(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document status '" + status + "' is not eligible for automatic reuse");
        }

        if (!document.getDocumentType().equalsIgnoreCase(req.getDocumentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document type mismatch: Expected " + req.getDocumentType() + " but document is " + document.getDocumentType());
        }

        ApplicationDocument appDoc = applicationDocumentRepository
                .findByApplicationIdAndApplicationTypeAndDocumentType(req.getApplicationId(), req.getApplicationType(), req.getDocumentType())
                .orElseGet(() -> ApplicationDocument.builder()
                        .applicationId(req.getApplicationId())
                        .applicationType(req.getApplicationType())
                        .documentType(req.getDocumentType())
                        .build());

        appDoc.setDocument(document);
        appDoc.setIsNewlyUploaded(false);
        ApplicationDocument saved = applicationDocumentRepository.save(appDoc);

        return ResponseEntity.ok(ApplicationDocumentDTO.builder()
                .id(saved.getId())
                .applicationId(saved.getApplicationId())
                .applicationType(saved.getApplicationType())
                .documentId(document.getId())
                .documentType(saved.getDocumentType())
                .fileName(document.getFileName())
                .contentType(document.getContentType())
                .fileSize(document.getFileSize())
                .verificationStatus("VERIFIED")
                .uploadedAt(document.getUploadedAt())
                .isNewlyUploaded(false)
                .version(document.getVersion())
                .build());
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<?> uploadDocument(
            @RequestParam(value = "applicationId", required = false) Long applicationId,
            @RequestParam(value = "applicationType", required = false) String applicationType,
            @RequestParam("documentType") String documentType,
            @RequestParam("file") MultipartFile file,
            Authentication auth) {

        User user = getAuthenticatedUser(auth);

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body("File size exceeds 10MB limit");
        }
        if (!ALLOWED_MIME_TYPES.contains(file.getContentType())) {
            return ResponseEntity.badRequest().body("Invalid file type. Only JPG, PNG, and PDF are allowed");
        }

        try {
            Long appId = applicationId != null ? applicationId : 0L;
            String appType = applicationType != null ? applicationType : "LOAN";

            List<Document> existingDocs = documentRepository.findByUserId(user.getId()).stream()
                    .filter(d -> documentType.equalsIgnoreCase(d.getDocumentType()))
                    .toList();
            int nextVersion = existingDocs.stream().mapToInt(d -> d.getVersion() != null ? d.getVersion() : 1).max().orElse(0) + 1;

            String status = "PENDING";
            String adminNote = "Uploaded successfully. Submitted for Admin Verification.";

            Document document = Document.builder()
                    .userId(user.getId())
                    .applicationId(appId)
                    .applicationType(appType)
                    .documentType(documentType)
                    .fileName(file.getOriginalFilename())
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .fileData(file.getBytes())
                    .verificationStatus(status)
                    .adminNote(adminNote)
                    .version(nextVersion)
                    .build();

            Document savedDoc = documentRepository.save(document);

            if (appId > 0) {
                ApplicationDocument appDoc = applicationDocumentRepository
                        .findByApplicationIdAndApplicationTypeAndDocumentType(appId, appType, documentType)
                        .orElseGet(() -> ApplicationDocument.builder()
                                .applicationId(appId)
                                .applicationType(appType)
                                .documentType(documentType)
                                .build());

                appDoc.setDocument(savedDoc);
                appDoc.setIsNewlyUploaded(true);
                applicationDocumentRepository.save(appDoc);
            }

            if (messageService != null) {
                messageService.sendSystemMessage(
                    user.getId(),
                    "Document Uploaded — Under Review",
                    "Your document " + file.getOriginalFilename() + " (" + documentType + " v" + nextVersion + ") has been uploaded successfully and is under review by admin.",
                    com.kalpanaafinance.modules.shared.entity.Message.EntityType.DOCUMENT,
                    savedDoc.getId()
                );
            }

            return ResponseEntity.ok(ApplicationDocumentDTO.builder()
                    .id(savedDoc.getId())
                    .applicationId(appId)
                    .applicationType(appType)
                    .documentId(savedDoc.getId())
                    .documentType(documentType)
                    .fileName(savedDoc.getFileName())
                    .contentType(savedDoc.getContentType())
                    .fileSize(savedDoc.getFileSize())
                    .verificationStatus(status)
                    .uploadedAt(savedDoc.getUploadedAt())
                    .isNewlyUploaded(true)
                    .version(nextVersion)
                    .build());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error uploading file");
        }
    }

    @GetMapping("/application/{applicationType}/{applicationId}")
    public ResponseEntity<List<ApplicationDocumentDTO>> getApplicationDocuments(
            @PathVariable String applicationType,
            @PathVariable Long applicationId,
            Authentication auth) {
        
        User currentUser = getAuthenticatedUser(auth);

        List<ApplicationDocument> appDocs = applicationDocumentRepository
                .findByApplicationIdAndApplicationType(applicationId, applicationType.toUpperCase());

        List<ApplicationDocumentDTO> dtoList = appDocs.stream().map(appDoc -> {
            Document doc = appDoc.getDocument();
            return ApplicationDocumentDTO.builder()
                    .id(appDoc.getId())
                    .applicationId(appDoc.getApplicationId())
                    .applicationType(appDoc.getApplicationType())
                    .documentId(doc.getId())
                    .documentType(appDoc.getDocumentType())
                    .fileName(doc.getFileName())
                    .contentType(doc.getContentType())
                    .fileSize(doc.getFileSize())
                    .verificationStatus(doc.getVerificationStatus())
                    .uploadedAt(doc.getUploadedAt())
                    .isNewlyUploaded(appDoc.getIsNewlyUploaded())
                    .version(doc.getVersion() != null ? doc.getVersion() : 1)
                    .build();
        }).toList();

        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/{documentId}/download")
    public ResponseEntity<?> downloadDocument(@PathVariable Long documentId, Authentication auth) {
        User currentUser = getAuthenticatedUser(auth);

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

        String userRoleStr = currentUser.getRole() != null ? currentUser.getRole().name() : "";
        boolean isAdmin = "ADMIN".equalsIgnoreCase(userRoleStr) || "SUPER_ADMIN".equalsIgnoreCase(userRoleStr);
        boolean isOwner = currentUser.getId().equals(document.getUserId());

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden: Insufficient privileges to view this document");
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFileName() + "\"")
                .body(document.getFileData());
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<?> getDocument(@PathVariable Long documentId, Authentication auth) {
        return downloadDocument(documentId, auth);
    }

    @GetMapping("/me")
    public ResponseEntity<List<Document>> getMyDocuments(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        List<Document> documents = documentRepository.findByUserId(user.getId());
        List<Document> docsWithoutData = documents.stream().map(doc -> Document.builder()
                .id(doc.getId())
                .userId(doc.getUserId())
                .applicationId(doc.getApplicationId())
                .applicationType(doc.getApplicationType())
                .documentType(doc.getDocumentType())
                .fileName(doc.getFileName())
                .contentType(doc.getContentType())
                .fileSize(doc.getFileSize())
                .verificationStatus(doc.getVerificationStatus())
                .version(doc.getVersion() != null ? doc.getVersion() : 1)
                .uploadedAt(doc.getUploadedAt())
                .build()).toList();
        
        return ResponseEntity.ok(docsWithoutData);
    }
}
