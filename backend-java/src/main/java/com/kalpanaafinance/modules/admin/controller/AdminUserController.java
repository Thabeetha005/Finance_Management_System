package com.kalpanaafinance.modules.admin.controller;

import com.kalpanaafinance.modules.shared.service.AuditService;
import com.kalpanaafinance.modules.user.service.WalletService;

import com.kalpanaafinance.modules.shared.entity.*;
import com.kalpanaafinance.modules.shared.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private InvestmentRepository investmentRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private com.kalpanaafinance.modules.shared.service.AuditService auditService;

    @Autowired
    private com.kalpanaafinance.modules.user.service.WalletService walletService;

    @GetMapping("/users/{userId}/wallet-summary")
    public ResponseEntity<com.kalpanaafinance.modules.shared.dto.WalletSummaryResponse> getUserWalletSummary(@PathVariable Long userId) {
        return ResponseEntity.ok(walletService.getWalletSummary(userId));
    }

    @GetMapping("/clients")
    public ResponseEntity<List<Map<String, Object>>> getAllClients() {
        List<User> customers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .limit(15)
                .collect(Collectors.toList());

        List<Map<String, Object>> response = customers.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("name", c.getName());
            map.put("email", c.getEmail());
            map.put("phone", c.getPhone());
            map.put("status", c.getAccountStatus() != null ? c.getAccountStatus() : "Active");
            map.put("isVerified", c.getIsVerified());
            map.put("role", c.getRole().name());
            map.put("portfolioValue", 0.0); // Would calculate from investments
            map.put("availableBalance", c.getBalance());
            map.put("createdAt", c.getCreatedAt());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @Autowired
    private AccountRepository accountRepository;
    
    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private LoanInstallmentRepository loanInstallmentRepository;

    @Autowired
    private PaymentAttemptRepository paymentAttemptRepository;

    @Autowired
    private ConsultationRepository consultationRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    @DeleteMapping("/users/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            @RequestBody(required = false) Map<String, String> body,
            jakarta.servlet.http.HttpServletRequest httpRequest,
            org.springframework.security.core.Authentication auth) {

        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        String deletionReason = (reason != null && !reason.trim().isEmpty()) 
                ? reason 
                : (body != null ? body.get("reason") : null);

        if (deletionReason == null || deletionReason.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Deletion reason is mandatory"));
        }

        // 1. Mark customer status as PENDING_TERMINATION
        user.setAccountStatus("PENDING_TERMINATION");
        user.setTerminationReason(deletionReason.trim());
        userRepository.save(user);

        // 2. Send System Notification Message to the customer
        Message deactivationMsg = Message.builder()
                .recipientUserId(id)
                .senderUserId(1L)
                .senderRole("ADMIN")
                .subject("Account Termination Notice")
                .messageContent("Your customer account has been scheduled for termination by Administration.\n\nReason:\n" + deletionReason.trim() + 
                        "\n\nPlease review and confirm this notice upon logging in.")
                .messageType(Message.MessageType.SYSTEM)
                .relatedEntityType(Message.EntityType.SYSTEM)
                .relatedEntityId(id)
                .isRead(false)
                .build();
        messageRepository.save(deactivationMsg);

        // 3. Admin Audit Log
        String adminEmail = auth != null ? auth.getName() : "admin@kalpanaafinance.com";
        auditService.logAction(
                adminEmail,
                "CUSTOMER_TERMINATION_INITIATED",
                "USER",
                id,
                "Customer " + user.getName() + " (ID #" + id + ") marked for termination by Admin. Reason: " + deletionReason.trim(),
                httpRequest != null ? httpRequest.getRemoteAddr() : "127.0.0.1"
        );

        return ResponseEntity.ok(Map.of("message", "Customer scheduled for termination. Termination notice sent to customer."));
    }



    @GetMapping("/accounts")
    public ResponseEntity<List<Map<String, Object>>> getAllAccounts() {
        List<User> customers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .collect(Collectors.toList());

        List<Map<String, Object>> response = customers.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", "ACC-" + (10000 + c.getId()));
            map.put("userId", c.getId());
            map.put("userName", c.getName());
            map.put("userEmail", c.getEmail());
            map.put("accountType", "Wallet & Savings");
            map.put("balance", c.getBalance());
            map.put("status", c.getAccountStatus() != null ? c.getAccountStatus() : "Active");
            map.put("createdAt", c.getCreatedAt());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users/{id}/wallet")
    public ResponseEntity<Map<String, Object>> getWallet(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("balance", user.getBalance());
            map.put("status", "Active");
            return ResponseEntity.ok(map);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users/{id}/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(@PathVariable Long id) {
        // Need a method in TransactionRepository to find by user/account.
        // For now, return empty or implement properly.
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping("/users/{id}/investments")
    public ResponseEntity<List<Investment>> getInvestments(@PathVariable Long id) {
        return ResponseEntity.ok(investmentRepository.findByUserId(id));
    }

    @GetMapping("/users/{id}/loans")
    public ResponseEntity<List<Loan>> getLoans(@PathVariable Long id) {
        return ResponseEntity.ok(loanRepository.findByUserId(id));
    }

    @GetMapping("/users/{id}/payments")
    public ResponseEntity<List<Payment>> getPayments(@PathVariable Long id) {
        return ResponseEntity.ok(paymentRepository.findByUserId(id));
    }

    @GetMapping("/users/{id}/consultations")
    public ResponseEntity<List<Consultation>> getConsultations(@PathVariable Long id) {
        return ResponseEntity.ok(consultationRepository.findByUserId(id));
    }

    @GetMapping("/users/{id}/asset-allocation")
    public ResponseEntity<List<Object>> getAssetAllocation(@PathVariable Long id) {
        // Dummy implementation for now
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping("/users/{id}/activity")
    public ResponseEntity<List<ActivityLog>> getActivity(@PathVariable Long id) {
        return ResponseEntity.ok(activityLogRepository.findByUserId(id));
    }

    @GetMapping("/users/{id}/documents")
    public ResponseEntity<List<Document>> getDocuments(@PathVariable Long id) {
        return ResponseEntity.ok(documentRepository.findByUserId(id));
    }

    @GetMapping("/users/{id}/loan-installments")
    public ResponseEntity<Map<String, Object>> getLoanInstallments(@PathVariable Long id) {
        List<Loan> loans = loanRepository.findByUserId(id);
        
        List<LoanInstallment> history = loans.stream()
                .flatMap(loan -> loanInstallmentRepository.findByLoanIdAndStatusOrderByDueDateDesc(loan.getId(), "PAID").stream())
                .collect(Collectors.toList());

        LoanInstallment currentEmi = null;
        for (Loan loan : loans) {
            LoanInstallment emi = loanInstallmentRepository.findFirstByLoanIdAndStatusInOrderByDueDateAsc(
                    loan.getId(), Arrays.asList("PENDING", "OVERDUE", "PARTIALLY_PAID")
            );
            if (emi != null) {
                if (currentEmi == null || emi.getDueDate().isBefore(currentEmi.getDueDate())) {
                    currentEmi = emi;
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("currentEmi", currentEmi);
        response.put("history", history);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{id}/payment-attempts")
    public ResponseEntity<List<PaymentAttempt>> getPaymentAttempts(@PathVariable Long id) {
        List<Loan> loans = loanRepository.findByUserId(id);
        List<PaymentAttempt> attempts = loans.stream()
                .flatMap(loan -> loanInstallmentRepository.findByLoanId(loan.getId()).stream())
                .flatMap(inst -> paymentAttemptRepository.findByInstallmentId(inst.getId()).stream())
                .collect(Collectors.toList());
        return ResponseEntity.ok(attempts);
    }

    @GetMapping("/users/{id}/messages")
    public ResponseEntity<List<Message>> getUserMessages(@PathVariable Long id) {
        // Return messages sent TO this user
        List<Message> messages = messageRepository.findByRecipientUserIdOrderByCreatedAtDesc(id);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/users/{id}/messages")
    public ResponseEntity<Message> sendUserMessage(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Message message = new Message();
        message.setRecipientUserId(id);
        message.setSubject(payload.get("subject"));
        message.setMessageContent(payload.get("message"));
        
        try {
            message.setMessageType(Message.MessageType.valueOf(payload.get("type")));
        } catch (Exception e) {
            message.setMessageType(Message.MessageType.MESSAGE);
        }
        
        message.setIsRead(false);
        Message saved = messageRepository.save(message);
        return ResponseEntity.ok(saved);
    }
}
