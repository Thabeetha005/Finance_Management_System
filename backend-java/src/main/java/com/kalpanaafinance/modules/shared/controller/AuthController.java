package com.kalpanaafinance.modules.shared.controller;

import com.kalpanaafinance.modules.shared.dto.AuthRequest;
import com.kalpanaafinance.modules.shared.dto.AuthResponse;
import com.kalpanaafinance.modules.shared.dto.SignUpRequest;
import com.kalpanaafinance.modules.shared.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignUpRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.signin(request));
    }
}
