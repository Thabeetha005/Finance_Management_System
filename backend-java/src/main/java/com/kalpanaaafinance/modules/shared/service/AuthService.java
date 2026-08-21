package com.kalpanaaafinance.modules.shared.service;

import com.kalpanaaafinance.modules.shared.dto.AuthRequest;
import com.kalpanaaafinance.modules.shared.dto.AuthResponse;
import com.kalpanaaafinance.modules.shared.dto.SignUpRequest;
import com.kalpanaaafinance.modules.shared.entity.Role;
import com.kalpanaaafinance.modules.shared.entity.User;
import com.kalpanaaafinance.modules.shared.repository.UserRepository;
import com.kalpanaaafinance.modules.shared.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final com.kalpanaaafinance.modules.shared.repository.AccountRepository accountRepository;
    private final com.kalpanaaafinance.modules.shared.repository.TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    public AuthResponse signup(SignUpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        BigDecimal bonus = new BigDecimal("100000.00");

        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .balance(bonus)
                .customerId(generateUniqueCustomerId())
                .build();

        userRepository.save(user);

        com.kalpanaaafinance.modules.shared.entity.Account account = com.kalpanaaafinance.modules.shared.entity.Account.builder()
                .user(user)
                .name("Main Wallet")
                .type("WALLET")
                .balance(bonus)
                .build();
        accountRepository.save(account);

        if (transactionRepository != null) {
            com.kalpanaaafinance.modules.shared.entity.Transaction tx = com.kalpanaaafinance.modules.shared.entity.Transaction.builder()
                    .account(account)
                    .amount(bonus)
                    .balanceBefore(BigDecimal.ZERO)
                    .balanceAfter(bonus)
                    .type("DEPOSIT")
                    .description("Welcome Signup Bonus")
                    .date(java.time.LocalDateTime.now())
                    .build();
            transactionRepository.save(tx);
        }

        var jwtToken = jwtUtils.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .isVerified(Boolean.TRUE.equals(user.getIsVerified()))
                .balance(user.getBalance())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt() : java.time.LocalDateTime.now())
                .build();
    }

    public AuthResponse signin(AuthRequest request) {
        String identifier = request.getEmail() != null ? request.getEmail().trim() : "";
        User user = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByUsername(identifier))
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        request.getPassword()
                )
        );

        var jwtToken = jwtUtils.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .isVerified(Boolean.TRUE.equals(user.getIsVerified()))
                .balance(user.getBalance())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt() : java.time.LocalDateTime.now())
                .build();
    }

    private String generateUniqueCustomerId() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder("CUS-");
        java.util.Random random = new java.util.Random();
        // Generate a 6-character random alphanumeric string
        for (int i = 0; i < 6; i++) {
            sb.append(characters.charAt(random.nextInt(characters.length())));
        }
        
        // In a highly concurrent production environment, we should check for uniqueness in DB 
        // or just rely on the UNIQUE constraint and retry on DataIntegrityViolationException.
        // For standard use cases, 36^6 is very unlikely to collide.
        return sb.toString();
    }
}
