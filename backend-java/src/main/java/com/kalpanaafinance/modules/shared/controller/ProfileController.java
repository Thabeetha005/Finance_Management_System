package com.kalpanaafinance.modules.shared.controller;

import com.kalpanaafinance.dto.*;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ProfileDTO> getProfile(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(profileService.getProfile(currentUser.getId()));
    }

    @PutMapping
    public ResponseEntity<ProfileDTO> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody UpdateProfileRequest request
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(profileService.updateProfile(currentUser.getId(), request));
    }

    @PutMapping("/username")
    public ResponseEntity<ProfileDTO> updateUsername(
            @AuthenticationPrincipal User currentUser,
            @RequestBody UpdateUsernameRequest request
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(profileService.updateUsername(currentUser.getId(), request));
    }

    @PutMapping("/email")
    public ResponseEntity<ProfileDTO> updateEmail(
            @AuthenticationPrincipal User currentUser,
            @RequestBody UpdateEmailRequest request
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(profileService.updateEmail(currentUser.getId(), request));
    }

    @GetMapping("/email/confirm")
    public ResponseEntity<ProfileDTO> confirmEmailChange(@RequestParam("token") String token) {
        return ResponseEntity.ok(profileService.confirmEmailChange(token));
    }

    @PutMapping("/phone")
    public ResponseEntity<ProfileDTO> updatePhone(
            @AuthenticationPrincipal User currentUser,
            @RequestBody UpdatePhoneRequest request
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(profileService.updatePhone(currentUser.getId(), request));
    }

    @PutMapping("/password")
    public ResponseEntity<ChangePasswordResponse> changePassword(
            @AuthenticationPrincipal User currentUser,
            @RequestBody ChangePasswordRequest request
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(profileService.changePassword(currentUser.getId(), request));
    }

    @GetMapping("/verification")
    public ResponseEntity<VerificationStatusDTO> getVerificationStatus(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(profileService.getVerificationStatus(currentUser.getId()));
    }
}
