package com.kalpanaaafinance.modules.admin.controller;

import com.kalpanaaafinance.modules.shared.dto.ProfileDTO;
import com.kalpanaaafinance.modules.shared.dto.UpdatePasswordRequest;
import com.kalpanaaafinance.modules.shared.dto.UpdateProfileRequest;
import com.kalpanaaafinance.modules.shared.entity.User;
import com.kalpanaaafinance.modules.shared.repository.UserRepository;
import com.kalpanaaafinance.modules.shared.security.JwtUtils;
import com.kalpanaaafinance.modules.shared.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or hasRole('admin')")
public class AdminProfileController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final JwtUtils jwtUtils;

    @GetMapping
    public ResponseEntity<ProfileDTO> getAdminProfile(Authentication authentication) {
        User admin = getAuthenticatedAdmin(authentication);
        return ResponseEntity.ok(convertToDTO(admin));
    }

    @PutMapping
    public ResponseEntity<?> updateAdminProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        User admin = getAuthenticatedAdmin(authentication);

        // Validation for Username Uniqueness
        if (request.getUsername() != null && !request.getUsername().isBlank() 
                && !request.getUsername().equalsIgnoreCase(admin.getUsernameHandle())) {
            Optional<User> existingUser = userRepository.findByUsername(request.getUsername());
            if (existingUser.isPresent() && !existingUser.get().getId().equals(admin.getId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken by another account."));
            }
            admin.setUsername(request.getUsername());
            auditService.logAction(admin.getEmail(), "ADMIN_USERNAME_CHANGED", "ADMIN_PROFILE", admin.getId(), 
                    "Admin username updated to: " + request.getUsername(), httpRequest.getRemoteAddr());
        }

        // Track whether email is changing — JWT subject = email, so a new token is needed
        boolean emailChanged = request.getEmail() != null && !request.getEmail().isBlank()
                && !request.getEmail().equalsIgnoreCase(admin.getEmail());

        // Validation for Email Uniqueness
        if (emailChanged) {
            Optional<User> existingEmailUser = userRepository.findByEmail(request.getEmail());
            if (existingEmailUser.isPresent() && !existingEmailUser.get().getId().equals(admin.getId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email address is already registered to another account."));
            }
            admin.setEmail(request.getEmail());
            // Increment tokenVersion so any other active sessions (other browsers/devices)
            // carrying the old email in their JWT subject are immediately invalidated
            admin.setTokenVersion((admin.getTokenVersion() != null ? admin.getTokenVersion() : 1) + 1);
            auditService.logAction(request.getEmail(), "ADMIN_EMAIL_CHANGED", "ADMIN_PROFILE", admin.getId(),
                    "Admin email updated. All other active sessions invalidated.", httpRequest.getRemoteAddr());
        }

        // Update Name & Phone
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            admin.setName(request.getFullName());
        }

        if (request.getPhoneNumber() != null) {
            if (!request.getPhoneNumber().equals(admin.getPhone())) {
                admin.setPhone(request.getPhoneNumber());
                auditService.logAction(admin.getEmail(), "ADMIN_PHONE_CHANGED", "ADMIN_PROFILE", admin.getId(),
                        "Admin phone number updated to: " + request.getPhoneNumber(), httpRequest.getRemoteAddr());
            }
        }

        User savedAdmin = userRepository.save(admin);
        auditService.logAction(savedAdmin.getEmail(), "ADMIN_PROFILE_UPDATED", "ADMIN_PROFILE", savedAdmin.getId(),
                "Admin profile details updated successfully", httpRequest.getRemoteAddr());

        // If email changed: return a fresh JWT (new subject = new email) so the current
        // browser session stays alive seamlessly — same shape as the password-change response
        if (emailChanged) {
            String newToken = jwtUtils.generateToken(savedAdmin);
            return ResponseEntity.ok(Map.of(
                    "message", "Profile updated. Email changed — your session has been refreshed.",
                    "token", newToken,
                    "profile", convertToDTO(savedAdmin)
            ));
        }

        return ResponseEntity.ok(convertToDTO(savedAdmin));
    }

    @PutMapping("/password")
    public ResponseEntity<?> updateAdminPassword(
            @RequestBody UpdatePasswordRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        User admin = getAuthenticatedAdmin(authentication);

        if (request.getOldPassword() == null || request.getOldPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current password is required."));
        }

        if (!passwordEncoder.matches(request.getOldPassword(), admin.getPasswordHash())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current password is incorrect."));
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password must be at least 6 characters long."));
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password and confirmation do not match."));
        }

        // 1. Hash and overwrite password_hash column (direct UPDATE on existing row)
        admin.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));

        // 2. Increment tokenVersion — invalidates ALL other active JWT sessions for this admin
        //    (same pattern as ProfileService.changePassword() used for customers)
        admin.setTokenVersion((admin.getTokenVersion() != null ? admin.getTokenVersion() : 1) + 1);
        userRepository.save(admin);

        // 3. Generate a fresh JWT carrying the new tokenVersion so the current browser session
        //    keeps working seamlessly while every other token is rejected by JwtAuthFilter
        String newToken = jwtUtils.generateToken(admin);

        auditService.logAction(admin.getEmail(), "ADMIN_PASSWORD_CHANGED", "ADMIN_PROFILE", admin.getId(),
                "Admin password changed successfully. All other active sessions invalidated.", httpRequest.getRemoteAddr());

        return ResponseEntity.ok(Map.of(
                "message", "Password updated successfully. Other sessions have been logged out.",
                "token", newToken
        ));
    }

    private User getAuthenticatedAdmin(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthenticated request");
        }
        String principalName = authentication.getName();
        return userRepository.findByEmail(principalName)
                .or(() -> userRepository.findByUsername(principalName))
                .orElseThrow(() -> new RuntimeException("Authenticated admin user not found: " + principalName));
    }

    private ProfileDTO convertToDTO(User admin) {
        return ProfileDTO.builder()
                .id(admin.getId())
                .customerId(admin.getCustomerId())
                .name(admin.getName())
                .username(admin.getUsernameHandle() != null ? admin.getUsernameHandle() : admin.getEmail().split("@")[0])
                .email(admin.getEmail())
                .phone(admin.getPhone())
                .accountStatus(admin.getAccountStatus() != null ? admin.getAccountStatus() : "Active")
                .isVerified(admin.getIsVerified() != null ? admin.getIsVerified() : true)
                .balance(admin.getBalance())
                .createdAt(admin.getCreatedAt())
                .updatedAt(admin.getUpdatedAt())
                .lastUsernameChangedAt(admin.getLastUsernameChangedAt())
                .build();
    }
}
