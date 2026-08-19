package com.kalpanaafinance;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGenTest {
    @Test
    public void generateHashes() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
        System.out.println("=== BCRYPT HASHES ===");
        System.out.println("password: " + encoder.encode("password"));
        System.out.println("admin123: " + encoder.encode("admin123"));
        System.out.println("=== VERIFY ===");
        // Well-known Spring test hash for "password" - https://github.com/spring-projects/spring-security/blob/main/crypto/src/test/java/org/springframework/security/crypto/bcrypt/BCryptPasswordEncoderTests.java
        System.out.println("verify 'password': " + encoder.matches("password", "$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG"));
    }
}
