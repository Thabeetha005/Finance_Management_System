package com.kalpanaafinance.service;

import com.kalpanaafinance.dto.*;
import com.kalpanaafinance.entity.*;
import com.kalpanaafinance.repository.*;
import com.kalpanaafinance.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_]{3,30}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\+?[0-9]{10,15}$");

    private final UserRepository userRepository;
    private final BankAccountRepository bankAccountRepository;
    private final DocumentRepository documentRepository;
    private final PendingEmailChangeRepository pendingEmailChangeRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional(readOnly = true)
    public ProfileDTO getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        List<String> lockReasons = new ArrayList<>();
        if (!Boolean.TRUE.equals(user.getIsVerified())) {
            lockReasons.add("Account identity verification (PAN/Aadhaar) is required.");
        }
        boolean hasBank = bankAccountRepository.existsByUserIdAndIsVerifiedTrue(userId);
        if (!hasBank) {
            lockReasons.add("A verified destination bank account is required.");
        }

        return mapToProfileDTO(user, lockReasons);
    }

    @Transactional
    public ProfileDTO updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // Section 3 Field Allowlist Enforcement:
        // EXPLICIT ALLOWLIST ONLY: fullName, username, email, phoneNumber
        // Ignore isVerified, accountStatus, role, id, balance payload attempts
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setName(request.getFullName().trim());
        }

        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            String newUsername = request.getUsername().trim();
            if (!newUsername.equalsIgnoreCase(user.getUsername())) {
                validateAndUpdateUsernameInternal(user, newUsername);
            }
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            String newPhone = request.getPhoneNumber().trim();
            if (!newPhone.equals(user.getPhone())) {
                if (!PHONE_PATTERN.matcher(newPhone).matches()) {
                    throw new IllegalArgumentException("Invalid phone number format.");
                }
                user.setPhone(newPhone);
            }
        }

        // Section 3 SECURITY RULE:
        // DO NOT apply request.getIsVerified(), request.getAccountStatus(), request.getRole(), or request.getId()
        // These fields remain unchanged by customer-facing profile update endpoints.

        userRepository.save(user);

        saveAuditLog(user, "PROFILE_UPDATED", "Customer updated profile details (fullName, phone, or username).");

        return getProfile(userId);
    }

    @Transactional
    public ProfileDTO updateUsername(Long userId, UpdateUsernameRequest request) {
        if (request == null || request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Username is required.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        String newUsername = request.getUsername().trim();
        validateAndUpdateUsernameInternal(user, newUsername);
        userRepository.save(user);

        saveAuditLog(user, "USERNAME_CHANGED", "Customer changed username to: " + newUsername);

        return getProfile(userId);
    }

    private void validateAndUpdateUsernameInternal(User user, String newUsername) {
        if (!USERNAME_PATTERN.matcher(newUsername).matches()) {
            throw new IllegalArgumentException("Username must be 3-30 characters long and contain only letters, numbers, and underscores.");
        }

        // Section 4 Rate Limiting Decision: 30-Day Cooldown Check
        if (user.getLastUsernameChangedAt() != null) {
            LocalDateTime cooldownEnd = user.getLastUsernameChangedAt().plusDays(30);
            if (LocalDateTime.now().isBefore(cooldownEnd)) {
                throw new IllegalStateException("Username can only be changed once every 30 days. Last changed on " + user.getLastUsernameChangedAt().toLocalDate() + ".");
            }
        }

        if (userRepository.existsByUsername(newUsername) && !newUsername.equalsIgnoreCase(user.getUsernameHandle())) {
            throw new IllegalArgumentException("Username '" + newUsername + "' is already taken by another account.");
        }

        user.setUsername(newUsername);
        user.setLastUsernameChangedAt(LocalDateTime.now());
    }

    @Transactional
    public ProfileDTO updateEmail(Long userId, UpdateEmailRequest request) {
        if (request == null || request.getNewEmail() == null || request.getCurrentPassword() == null) {
            throw new IllegalArgumentException("New email and current password are required.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid current password.");
        }

        String newEmail = request.getNewEmail().trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(newEmail).matches()) {
            throw new IllegalArgumentException("Invalid email address format.");
        }

        if (userRepository.existsByEmail(newEmail) && !newEmail.equalsIgnoreCase(user.getEmail())) {
            throw new IllegalArgumentException("Email address '" + newEmail + "' is already in use by another account.");
        }

        String oldEmail = user.getEmail();
        user.setEmail(newEmail);
        userRepository.save(user);

        notificationRepository.save(Notification.builder()
                .user(user)
                .title("Email Address Updated")
                .message("Your account email address was updated from " + oldEmail + " to " + newEmail + ".")
                .type("SUCCESS")
                .isRead(false)
                .build());

        saveAuditLog(user, "EMAIL_CHANGED", "Email changed directly from " + oldEmail + " to " + newEmail);

        return getProfile(userId);
    }

    @Transactional
    public ProfileDTO confirmEmailChange(String token) {
        PendingEmailChange pending = pendingEmailChangeRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired email confirmation link."));

        if (!"PENDING".equalsIgnoreCase(pending.getStatus())) {
            throw new IllegalStateException("Email confirmation token has already been processed or expired.");
        }

        // Section 5 Step 7 Check-on-Read Expiry
        if (LocalDateTime.now().isAfter(pending.getExpiresAt())) {
            pending.setStatus("EXPIRED");
            pendingEmailChangeRepository.save(pending);
            throw new IllegalStateException("Email confirmation link has expired after 24 hours.");
        }

        User user = pending.getUser();
        String oldEmail = user.getEmail();
        String newEmail = pending.getNewEmail();

        if (userRepository.existsByEmail(newEmail) && !newEmail.equalsIgnoreCase(oldEmail)) {
            pending.setStatus("EXPIRED");
            pendingEmailChangeRepository.save(pending);
            throw new IllegalStateException("Email address is already in use by another account.");
        }

        user.setEmail(newEmail);
        userRepository.save(user);

        pending.setStatus("CONFIRMED");
        pendingEmailChangeRepository.save(pending);

        notificationRepository.save(Notification.builder()
                .user(user)
                .title("Email Address Updated")
                .message("Your account email address has been successfully updated from " + oldEmail + " to " + newEmail + ".")
                .type("SUCCESS")
                .isRead(false)
                .build());

        saveAuditLog(user, "EMAIL_CHANGED", "Email changed successfully from " + oldEmail + " to " + newEmail);

        return getProfile(user.getId());
    }

    @Transactional
    public ProfileDTO updatePhone(Long userId, UpdatePhoneRequest request) {
        if (request == null || request.getNewPhone() == null || request.getCurrentPassword() == null) {
            throw new IllegalArgumentException("New phone number and current password are required.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // Section 6: Require re-authentication (current password)
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid current password.");
        }

        String newPhone = request.getNewPhone().trim();
        if (!PHONE_PATTERN.matcher(newPhone).matches()) {
            throw new IllegalArgumentException("Invalid phone number format.");
        }

        String oldPhone = user.getPhone();
        user.setPhone(newPhone);
        userRepository.save(user);

        notificationRepository.save(Notification.builder()
                .user(user)
                .title("Phone Number Updated")
                .message("Your account phone number was updated to " + newPhone + ".")
                .type("INFO")
                .isRead(false)
                .build());

        saveAuditLog(user, "PHONE_NUMBER_CHANGED", "Phone number changed from " + (oldPhone != null ? oldPhone : "none") + " to " + newPhone);

        return getProfile(userId);
    }

    @Transactional
    public ChangePasswordResponse changePassword(Long userId, ChangePasswordRequest request) {
        if (request == null || request.getCurrentPassword() == null || request.getNewPassword() == null || request.getConfirmPassword() == null) {
            throw new IllegalArgumentException("Current password, new password, and confirmation are required.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // Section 7 Requirement: Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid current password.");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirmation password do not match.");
        }

        if (request.getNewPassword().length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters long.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));

        // Section 7 SESSION INVALIDATION RULE:
        // Increment token_version in MySQL to immediately invalidate ALL other active sessions/tokens
        user.setTokenVersion((user.getTokenVersion() != null ? user.getTokenVersion() : 1) + 1);
        userRepository.save(user);

        // Generate new token for the current session carrying the incremented tokenVersion
        String newToken = jwtUtils.generateToken(user);

        notificationRepository.save(Notification.builder()
                .user(user)
                .title("Password Changed Successfully")
                .message("Your account password was updated. All other active sessions have been logged out for security.")
                .type("SUCCESS")
                .isRead(false)
                .build());

        saveAuditLog(user, "PASSWORD_CHANGED", "Account password updated; all other active sessions invalidated.");

        return ChangePasswordResponse.builder()
                .message("Password changed successfully.")
                .token(newToken)
                .build();
    }

    @Transactional
    public VerificationStatusDTO getVerificationStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        List<Document> docs = documentRepository.findByUserId(userId);
        
        Optional<Document> rejectedDoc = docs.stream()
                .filter(d -> "REJECTED".equalsIgnoreCase(d.getVerificationStatus()))
                .findFirst();

        boolean hasPan = docs.stream().anyMatch(d -> 
                ("PAN".equalsIgnoreCase(d.getDocumentType()) || "PAN_CARD".equalsIgnoreCase(d.getDocumentType())) 
                && "VERIFIED".equalsIgnoreCase(d.getVerificationStatus()));
        
        boolean hasAadhaar = docs.stream().anyMatch(d -> 
                ("AADHAAR".equalsIgnoreCase(d.getDocumentType()) || "AADHAAR_CARD".equalsIgnoreCase(d.getDocumentType()) || "IDENTITY".equalsIgnoreCase(d.getDocumentType())) 
                && "VERIFIED".equalsIgnoreCase(d.getVerificationStatus()));
        
        boolean isBankVerified = bankAccountRepository.existsByUserIdAndIsVerifiedTrue(userId) 
                || docs.stream().anyMatch(d -> "BANK_STATEMENT".equalsIgnoreCase(d.getDocumentType()) && "VERIFIED".equalsIgnoreCase(d.getVerificationStatus()));
        
        boolean isCustomerVerified = Boolean.TRUE.equals(user.getIsVerified()) || (hasPan && hasAadhaar);

        List<String> pendingActions = new ArrayList<>();
        if (!hasPan) pendingActions.add("Upload & verify PAN card.");
        if (!hasAadhaar) pendingActions.add("Upload & verify Aadhaar card.");
        if (!isBankVerified) pendingActions.add("Link & verify a destination bank account.");

        String overallStatus;
        String rejectionReason = null;

        if (rejectedDoc.isPresent()) {
            overallStatus = "RESUBMISSION_REQUIRED";
            rejectionReason = rejectedDoc.get().getAdminNote() != null ? rejectedDoc.get().getAdminNote() : "One of your submitted documents was rejected by admin.";
        } else if (isCustomerVerified && isBankVerified) {
            overallStatus = "VERIFIED";
        } else if (docs.isEmpty()) {
            overallStatus = "NOT_SUBMITTED";
        } else {
            boolean hasPendingDocs = docs.stream().anyMatch(d -> "PENDING".equalsIgnoreCase(d.getVerificationStatus()));
            if (hasPendingDocs) {
                overallStatus = "UNDER_REVIEW";
            } else {
                overallStatus = "NOT_SUBMITTED";
            }
        }

        saveAuditLog(user, "VERIFICATION_VIEWED", "Customer viewed verification status.");

        return VerificationStatusDTO.builder()
                .isCustomerVerified(isCustomerVerified)
                .isBankVerified(isBankVerified)
                .overallStatus(overallStatus)
                .panStatus(hasPan ? "VERIFIED" : (docs.stream().anyMatch(d -> "PAN".equalsIgnoreCase(d.getDocumentType()) && "REJECTED".equalsIgnoreCase(d.getVerificationStatus())) ? "REJECTED" : (docs.stream().anyMatch(d -> "PAN".equalsIgnoreCase(d.getDocumentType())) ? "PENDING" : "NOT_SUBMITTED")))
                .aadhaarStatus(hasAadhaar ? "VERIFIED" : (docs.stream().anyMatch(d -> "AADHAAR".equalsIgnoreCase(d.getDocumentType()) && "REJECTED".equalsIgnoreCase(d.getVerificationStatus())) ? "REJECTED" : (docs.stream().anyMatch(d -> "AADHAAR".equalsIgnoreCase(d.getDocumentType())) ? "PENDING" : "NOT_SUBMITTED")))
                .bankAccountStatus(isBankVerified ? "VERIFIED" : "PENDING")
                .rejectionReason(rejectionReason)
                .pendingActions(pendingActions)
                .build();
    }

    private void saveAuditLog(User user, String action, String description) {
        try {
            auditLogRepository.save(AuditLog.builder()
                    .adminUsername("CUSTOMER_" + user.getId())
                    .adminName(user.getName())
                    .action(action)
                    .targetType("PROFILE")
                    .targetId(user.getId())
                    .description(description)
                    .build());
        } catch (Exception e) {
            // Ignore audit log failure to avoid rolling back profile action
        }
    }

    private ProfileDTO mapToProfileDTO(User user, List<String> lockReasons) {
        return ProfileDTO.builder()
                .id(user.getId())
                .customerId(user.getCustomerId() != null ? user.getCustomerId() : "CUST-" + user.getId())
                .name(user.getName())
                .username(user.getUsernameHandle() != null ? user.getUsernameHandle() : "user_" + user.getId())
                .email(user.getEmail())
                .phone(user.getPhone())
                .accountStatus(user.getAccountStatus() != null ? user.getAccountStatus() : "Active")
                .isVerified(Boolean.TRUE.equals(user.getIsVerified()))
                .balance(user.getBalance())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastUsernameChangedAt(user.getLastUsernameChangedAt())
                .tokenVersion(user.getTokenVersion())
                .lockReasons(lockReasons)
                .build();
    }
}
