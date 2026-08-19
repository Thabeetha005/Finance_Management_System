package com.kalpanaafinance.controller;

import com.kalpanaafinance.dto.ProfileDTO;
import com.kalpanaafinance.dto.UpdatePasswordRequest;
import com.kalpanaafinance.dto.UpdateProfileRequest;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.repository.UserRepository;
import com.kalpanaafinance.modules.shared.service.AuditService;
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

        // Validation for Email Uniqueness
        if (request.getEmail() != null && !request.getEmail().isBlank() 
                && !request.getEmail().equalsIgnoreCase(admin.getEmail())) {
            Optional<User> existingEmailUser = userRepository.findByEmail(request.getEmail());
            if (existingEmailUser.isPresent() && !existingEmailUser.get().getId().equals(admin.getId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email address is already registered to another account."));
            }
            admin.setEmail(request.getEmail());
            auditService.logAction(admin.getEmail(), "ADMIN_EMAIL_CHANGED", "ADMIN_PROFILE", admin.getId(), 
                    "Admin email updated to: " + request.getEmail(), httpRequest.getRemoteAddr());
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

        admin.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(admin);

        auditService.logAction(admin.getEmail(), "ADMIN_PASSWORD_CHANGED", "ADMIN_PROFILE", admin.getId(), 
                "Admin password changed successfully", httpRequest.getRemoteAddr());

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
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
