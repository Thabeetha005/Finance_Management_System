package com.kalpanaafinance;

import com.kalpanaafinance.modules.shared.dto.*;
import com.kalpanaafinance.modules.shared.entity.Role;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.repository.UserRepository;
import com.kalpanaafinance.modules.shared.security.JwtUtils;
import com.kalpanaafinance.modules.shared.service.ProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ProfileSystemTest {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    private User testUser;

    @BeforeEach
    @Transactional
    public void setup() {
        String testEmail = "profile_test_" + System.currentTimeMillis() + "@kalpanaaa.in";
        testUser = User.builder()
                .name("Test Profile User")
                .username("test_user_" + System.currentTimeMillis())
                .email(testEmail)
                .passwordHash(passwordEncoder.encode("Password123!"))
                .role(Role.CUSTOMER)
                .isVerified(false)
                .accountStatus("Active")
                .tokenVersion(1)
                .build();
        testUser = userRepository.save(testUser);
    }

    @Test
    @Transactional
    public void testFieldAllowlistSecurityRule() {
        // Section 3 Requirement:
        // Crafted payload containing isVerified: true and accountStatus: "ACTIVE" must be IGNORED
        assertFalse(testUser.getIsVerified());

        UpdateProfileRequest craftedRequest = UpdateProfileRequest.builder()
                .fullName("Updated Name")
                .isVerified(true) // Payload tampering attempt
                .accountStatus("VERIFIED") // Payload tampering attempt
                .role("ADMIN") // Payload tampering attempt
                .build();

        ProfileDTO updated = profileService.updateProfile(testUser.getId(), craftedRequest);

        // Verify updated fullName
        assertEquals("Updated Name", updated.getName());

        // VERIFY TAMPERED FIELDS WERE SILENTLY IGNORED:
        User freshDbUser = userRepository.findById(testUser.getId()).orElseThrow();
        assertFalse(freshDbUser.getIsVerified(), "isVerified must NOT be modified by updateProfile payload tampering!");
        assertEquals("Active", freshDbUser.getAccountStatus(), "accountStatus must NOT be modified by updateProfile payload tampering!");
        assertEquals(Role.CUSTOMER, freshDbUser.getRole(), "role must NOT be modified by updateProfile payload tampering!");
    }

    @Test
    @Transactional
    public void testUsernameChangeRateLimiting() {
        String newUsername1 = "new_username_" + System.currentTimeMillis();
        UpdateUsernameRequest req1 = UpdateUsernameRequest.builder().username(newUsername1).build();

        ProfileDTO updated1 = profileService.updateUsername(testUser.getId(), req1);
        assertEquals(newUsername1, updated1.getUsername());

        // Attempting a second username change within 30 days MUST be rejected
        String newUsername2 = "second_username_" + System.currentTimeMillis();
        UpdateUsernameRequest req2 = UpdateUsernameRequest.builder().username(newUsername2).build();

        Exception ex = assertThrows(IllegalStateException.class, () -> {
            profileService.updateUsername(testUser.getId(), req2);
        });

        assertTrue(ex.getMessage().contains("once every 30 days"));
    }

    @Test
    @Transactional
    public void testPasswordChangeSessionInvalidation() {
        // Generate JWT for tokenVersion = 1
        String oldToken = jwtUtils.generateToken(testUser);
        assertTrue(jwtUtils.isTokenValid(oldToken, testUser));

        ChangePasswordRequest changeReq = ChangePasswordRequest.builder()
                .currentPassword("Password123!")
                .newPassword("NewPassword456!")
                .confirmPassword("NewPassword456!")
                .build();

        ChangePasswordResponse response = profileService.changePassword(testUser.getId(), changeReq);
        assertNotNull(response.getToken());

        User freshDbUser = userRepository.findById(testUser.getId()).orElseThrow();
        assertEquals(2, freshDbUser.getTokenVersion(), "tokenVersion must increment on password change!");

        // Old JWT with tokenVersion = 1 must now be INVALID
        assertFalse(jwtUtils.isTokenValid(oldToken, freshDbUser), "Old JWT token must be invalidated backend-side after password change!");

        // New JWT with tokenVersion = 2 must be VALID
        assertTrue(jwtUtils.isTokenValid(response.getToken(), freshDbUser), "New JWT token must be valid for current session!");
    }
}
