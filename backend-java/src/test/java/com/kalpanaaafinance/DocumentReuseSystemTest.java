package com.kalpanaaafinance;

import com.kalpanaaafinance.modules.shared.dto.LinkDocumentRequest;
import com.kalpanaaafinance.modules.shared.dto.LoanApplyRequest;
import com.kalpanaaafinance.modules.shared.entity.*;
import com.kalpanaaafinance.modules.shared.entity.Role;
import com.kalpanaaafinance.modules.shared.repository.*;
import com.kalpanaaafinance.modules.user.service.LoanService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class DocumentReuseSystemTest {

    @Autowired
    private com.kalpanaaafinance.modules.user.controller.DocumentController documentController;

    @Autowired
    private LoanService loanService;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private ApplicationDocumentRepository applicationDocumentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoanPlanRepository loanPlanRepository;

    private User customerA;
    private User customerB;
    private Document verifiedPanDoc;
    private Document pendingDoc;
    private LoanPlan personalPlan;

    @BeforeEach
    void setUp() {
        String uniqueA = UUID.randomUUID().toString().substring(0, 8);
        customerA = userRepository.saveAndFlush(User.builder()
                .email("custA_" + uniqueA + "@example.com")
                .passwordHash("password123")
                .name("Customer A")
                .role(Role.CUSTOMER)
                .balance(new BigDecimal("100000.00"))
                .isVerified(true)
                .build());

        String uniqueB = UUID.randomUUID().toString().substring(0, 8);
        customerB = userRepository.saveAndFlush(User.builder()
                .email("custB_" + uniqueB + "@example.com")
                .passwordHash("password123")
                .name("Customer B")
                .role(Role.CUSTOMER)
                .balance(new BigDecimal("100000.00"))
                .isVerified(true)
                .build());

        verifiedPanDoc = documentRepository.saveAndFlush(Document.builder()
                .userId(customerA.getId())
                .applicationId(0L)
                .applicationType("USER_KYC")
                .documentType("PAN_CARD")
                .fileName("pan_card.pdf")
                .contentType("application/pdf")
                .fileSize(1024L)
                .fileData("DUMMY_PDF_DATA".getBytes())
                .verificationStatus("VERIFIED")
                .version(1)
                .build());

        pendingDoc = documentRepository.saveAndFlush(Document.builder()
                .userId(customerA.getId())
                .applicationId(0L)
                .applicationType("USER_KYC")
                .documentType("BANK_STATEMENT")
                .fileName("bank_stmt.pdf")
                .contentType("application/pdf")
                .fileSize(2048L)
                .fileData("DUMMY_PDF_DATA".getBytes())
                .verificationStatus("PENDING")
                .version(1)
                .build());

        personalPlan = loanPlanRepository.findByNameIgnoreCase("Personal Loan")
                .orElseGet(() -> loanPlanRepository.saveAndFlush(LoanPlan.builder()
                        .name("Personal Loan")
                        .minAmount(new BigDecimal("10000.00"))
                        .maxAmount(new BigDecimal("500000.00"))
                        .allowedPurposes("Personal,Medical")
                        .isActive(true)
                        .build()));
    }

    @Test
    @DisplayName("Test 1: GET /reuse-eligible Returns ONLY Verified Customer Documents")
    void testReuseEligibleEndpointReturnsOnlyVerifiedDocuments() {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(customerA.getEmail(), null);
        List<Document> eligibleDocs = documentController.getReuseEligibleDocuments(auth).getBody();

        assertNotNull(eligibleDocs);
        assertTrue(eligibleDocs.stream().allMatch(d -> "VERIFIED".equals(d.getVerificationStatus())));
        assertTrue(eligibleDocs.stream().anyMatch(d -> d.getId().equals(verifiedPanDoc.getId())));
        assertFalse(eligibleDocs.stream().anyMatch(d -> d.getId().equals(pendingDoc.getId())), "PENDING document must NOT be eligible for reuse");
    }

    @Test
    @DisplayName("Test 2: Security Check Rejects Cross-Customer Document Linking with HTTP 403")
    void testSecurityViolationCrossCustomerLinkAttemptFails() {
        // Customer B attempts to link Customer A's verified document
        UsernamePasswordAuthenticationToken authB = new UsernamePasswordAuthenticationToken(customerB.getEmail(), null);

        LinkDocumentRequest maliciousReq = LinkDocumentRequest.builder()
                .applicationId(999L)
                .applicationType("LOAN")
                .documentId(verifiedPanDoc.getId()) // Customer A's document ID
                .documentType("PAN_CARD")
                .build();

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            documentController.linkExistingDocument(maliciousReq, authB);
        });

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Security Violation"));
    }

    @Test
    @DisplayName("Test 3: Automatic Verified Document Linking on Loan Application Creation")
    void testAutoLinkingOnLoanApplication() {
        Loan loan = loanService.applyForLoan(customerA, LoanApplyRequest.builder()
                .planId(personalPlan.getId())
                .amount(new BigDecimal("20000.00"))
                .durationMonths(12)
                .purpose("Personal")
                .build());

        assertNotNull(loan);
        List<ApplicationDocument> appDocs = applicationDocumentRepository.findByApplicationIdAndApplicationType(loan.getId(), "LOAN");

        assertFalse(appDocs.isEmpty(), "Loan application must automatically link verified customer documents");
        ApplicationDocument panLink = appDocs.stream().filter(d -> "PAN_CARD".equalsIgnoreCase(d.getDocumentType())).findFirst().orElse(null);

        assertNotNull(panLink);
        assertEquals(verifiedPanDoc.getId(), panLink.getDocument().getId());
        assertFalse(panLink.getIsNewlyUploaded(), "Existing verified document link must have isNewlyUploaded = false");
    }
}
