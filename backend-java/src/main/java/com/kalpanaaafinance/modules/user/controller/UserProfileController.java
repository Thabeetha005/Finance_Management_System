package com.kalpanaaafinance.modules.user.controller;

import com.kalpanaaafinance.modules.shared.dto.UpdatePasswordRequest;
import com.kalpanaaafinance.modules.shared.dto.UserProfileRequest;
import com.kalpanaaafinance.modules.shared.entity.User;
import com.kalpanaaafinance.modules.shared.repository.UserRepository;
import com.kalpanaaafinance.modules.shared.service.AuditService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.kalpanaaafinance.modules.shared.security.JwtUtils;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final JwtUtils jwtUtils;

    @PersistenceContext
    private EntityManager entityManager;

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                           @RequestBody UserProfileRequest request,
                                           HttpServletRequest httpServletRequest) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null && !request.getName().isEmpty()) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            user.setPhone(request.getPhone());
        }
        if (request.getEmail() != null && !request.getEmail().isEmpty() && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use"));
            }
            user.setEmail(request.getEmail());
        }

        userRepository.save(user);

        auditService.logAction(
                user.getEmail(),
                "UPDATE_PROFILE",
                "USER",
                user.getId(),
                "User updated their profile",
                httpServletRequest.getRemoteAddr()
        );

        String newToken = jwtUtils.generateToken(user);
        Map<String, Object> response = new HashMap<>();
        response.put("token", newToken);
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("phone", user.getPhone());
        response.put("role", user.getRole().name());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@AuthenticationPrincipal UserDetails userDetails,
                                            @RequestBody UpdatePasswordRequest request,
                                            HttpServletRequest httpServletRequest) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Old password does not match"));
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "New passwords do not match"));
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditService.logAction(
                user.getEmail(),
                "UPDATE_PASSWORD",
                "USER",
                user.getId(),
                "User updated their password",
                httpServletRequest.getRemoteAddr()
        );

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    @PostMapping("/confirm-termination")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> confirmTermination(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpServletRequest) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        Long userId = user.getId();
        String userName = user.getName();

        // 1. Audit log confirmation
        auditService.logAction(
                email,
                "CUSTOMER_TERMINATION_CONFIRMED",
                "USER",
                userId,
                "Customer " + userName + " acknowledged termination pop-up and confirmed account deactivation.",
                httpServletRequest != null ? httpServletRequest.getRemoteAddr() : "127.0.0.1"
        );

        // 2. Full foreign key safe cascade purge
        try {
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS=0").executeUpdate();
            
            entityManager.createNativeQuery("DELETE FROM transactions WHERE account_id IN (SELECT id FROM accounts WHERE user_id = :id)").setParameter("id", userId).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM accounts WHERE user_id = :id").setParameter("id", userId).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM payments WHERE user_id = :id").setParameter("id", userId).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM consultations WHERE user_id = :id").setParameter("id", userId).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM activity_logs WHERE user_id = :id").setParameter("id", userId).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM messages WHERE sender_user_id = :id OR recipient_user_id = :id").setParameter("id", userId).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM notifications WHERE user_id = :id").setParameter("id", userId).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM support_tickets WHERE customer_id = :id").setParameter("id", userId).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM bank_accounts WHERE user_id = :id").setParameter("id", userId).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM investments WHERE user_id = :id").setParameter("id", userId).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM loans WHERE user_id = :id").setParameter("id", userId).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM documents WHERE user_id = :id").setParameter("id", userId).executeUpdate();
            
            Number hasWalletHistory = (Number) entityManager.createNativeQuery("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'wallet_history'").getSingleResult();
            if (hasWalletHistory != null && hasWalletHistory.longValue() > 0) {
                entityManager.createNativeQuery("DELETE FROM wallet_history WHERE user_id = :id").setParameter("id", userId).executeUpdate();
            }

            entityManager.createNativeQuery("DELETE FROM users WHERE id = :id").setParameter("id", userId).executeUpdate();
        } finally {
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS=1").executeUpdate();
        }

        return ResponseEntity.ok(Map.of("message", "Account purged successfully."));
    }
}
