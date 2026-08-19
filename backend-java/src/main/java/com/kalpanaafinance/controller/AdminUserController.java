package com.kalpanaafinance.controller;

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
    private com.kalpanaafinance.service.AuditService auditService;

    @Autowired
    private com.kalpanaafinance.service.WalletService walletService;

    @GetMapping("/users/{userId}/wallet-summary")
    public ResponseEntity<com.kalpanaafinance.dto.WalletSummaryResponse> getUserWalletSummary(@PathVariable Long userId) {
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
    public ResponseEntity<?> deleteUser(@PathVariable Long id, org.springframework.security.core.Authentication auth) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        
        try {
            // Guard: Reject user deletion if financial (deposits, withdrawals, loans, investments) or compliance (documents) history exists
            Number depositCount = (Number) entityManager.createNativeQuery("SELECT COUNT(*) FROM deposits WHERE user_id = :id").setParameter("id", id).getSingleResult();
            Number withdrawalCount = (Number) entityManager.createNativeQuery("SELECT COUNT(*) FROM withdrawals WHERE user_id = :id").setParameter("id", id).getSingleResult();
            Number loanCount = (Number) entityManager.createNativeQuery("SELECT COUNT(*) FROM loans WHERE user_id = :id").setParameter("id", id).getSingleResult();
            Number investmentCount = (Number) entityManager.createNativeQuery("SELECT COUNT(*) FROM investments WHERE user_id = :id").setParameter("id", id).getSingleResult();
            Number documentCount = (Number) entityManager.createNativeQuery("SELECT COUNT(*) FROM documents WHERE user_id = :id").setParameter("id", id).getSingleResult();

            if ((depositCount != null && depositCount.longValue() > 0) ||
                (withdrawalCount != null && withdrawalCount.longValue() > 0) ||
                (loanCount != null && loanCount.longValue() > 0) ||
                (investmentCount != null && investmentCount.longValue() > 0) ||
                (documentCount != null && documentCount.longValue() > 0)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Cannot delete user account with active financial or compliance history. Financial, loan, investment, and document audit records must be preserved."));
            }

            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS=0").executeUpdate();
            
            entityManager.createNativeQuery("DELETE FROM transactions WHERE account_id IN (SELECT id FROM accounts WHERE user_id = :id)").setParameter("id", id).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM accounts WHERE user_id = :id").setParameter("id", id).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM payments WHERE user_id = :id").setParameter("id", id).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM consultations WHERE user_id = :id").setParameter("id", id).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM activity_logs WHERE user_id = :id").setParameter("id", id).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM messages WHERE sender_user_id = :id OR recipient_user_id = :id").setParameter("id", id).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM notifications WHERE user_id = :id").setParameter("id", id).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM support_tickets WHERE customer_id = :id").setParameter("id", id).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM bank_accounts WHERE user_id = :id").setParameter("id", id).executeUpdate();
            
            // Safely delete from wallet_history ONLY if the table exists in MySQL
            Number hasWalletHistory = (Number) entityManager.createNativeQuery("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'wallet_history'").getSingleResult();
            if (hasWalletHistory != null && hasWalletHistory.longValue() > 0) {
                entityManager.createNativeQuery("DELETE FROM wallet_history WHERE user_id = :id").setParameter("id", id).executeUpdate();
            }
            
            entityManager.createNativeQuery("DELETE FROM users WHERE id = :id").setParameter("id", id).executeUpdate();
        } finally {
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS=1").executeUpdate();
        }
        
        auditService.logAction(
            auth != null ? auth.getName() : "System",
            "DELETE_USER",
            "USER",
            id,
            "Deleted user " + user.getName(),
            null
        );
        
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getAllTransactions(@RequestParam(required = false) Integer limit) {
        List<Transaction> txs = transactionRepository.findAll();
        // Sort descending by date
        txs.sort((t1, t2) -> {
            if (t1.getDate() == null || t2.getDate() == null) return 0;
            return t2.getDate().compareTo(t1.getDate());
        });
        if (limit != null && limit > 0) {
            txs = txs.stream().limit(limit).collect(Collectors.toList());
        }
        return ResponseEntity.ok(txs);
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<Account>> getAllAccounts() {
        return ResponseEntity.ok(accountRepository.findAll());
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
