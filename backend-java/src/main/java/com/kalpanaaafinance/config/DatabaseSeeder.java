package com.kalpanaaafinance.config;

import com.kalpanaaafinance.modules.shared.entity.InvestmentPlan;
import com.kalpanaaafinance.modules.shared.entity.Role;
import com.kalpanaaafinance.modules.shared.entity.User;
import com.kalpanaaafinance.modules.shared.repository.InvestmentPlanRepository;
import com.kalpanaaafinance.modules.shared.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final InvestmentPlanRepository investmentPlanRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Ensure admin@kalpanaaafinance.com exists with password 'password' / 'admin123'
        userRepository.findByEmail("admin@kalpanaaafinance.com").ifPresentOrElse(admin -> {
            admin.setRole(Role.ADMIN);
            admin.setPasswordHash(passwordEncoder.encode("password"));
            userRepository.save(admin);
        }, () -> {
            User admin = User.builder()
                    .name("System Administrator")
                    .email("admin@kalpanaaafinance.com")
                    .passwordHash(passwordEncoder.encode("password"))
                    .role(Role.ADMIN)
                    .balance(new BigDecimal("1000000.00"))
                    .accountStatus("Active")
                    .isVerified(true)
                    .build();
            userRepository.save(admin);
        });

        // Ensure thabee@kalpanaaafinance.com exists
        userRepository.findByEmail("thabee@kalpanaaafinance.com").ifPresentOrElse(admin -> {
            admin.setRole(Role.ADMIN);
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            userRepository.save(admin);
        }, () -> {
            User admin = User.builder()
                    .name("Thabee Admin")
                    .email("thabee@kalpanaaafinance.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .balance(new BigDecimal("1000000.00"))
                    .accountStatus("Active")
                    .isVerified(true)
                    .build();
            userRepository.save(admin);
        });

        if (investmentPlanRepository.count() == 0) {
            List<InvestmentPlan> plans = Arrays.asList(
                InvestmentPlan.builder().name("Mutual Funds").isVariable(false).description("Diversified equity funds").createdAt(LocalDateTime.now()).build(),
                InvestmentPlan.builder().name("Fixed Deposits").isVariable(false).description("Secure term deposits").createdAt(LocalDateTime.now()).build(),
                InvestmentPlan.builder().name("Bonds").isVariable(false).description("Corporate and government bonds").createdAt(LocalDateTime.now()).build(),
                InvestmentPlan.builder().name("Equity").isVariable(true).variableRate(new BigDecimal("12.50")).description("Direct stock market investments").createdAt(LocalDateTime.now()).build(),
                InvestmentPlan.builder().name("SIP Plans").isVariable(false).description("Systematic Investment Plans").createdAt(LocalDateTime.now()).build(),
                InvestmentPlan.builder().name("Gold Funds").isVariable(true).variableRate(new BigDecimal("10.00")).description("Digital gold and ETFs").createdAt(LocalDateTime.now()).build()
            );
            investmentPlanRepository.saveAll(plans);
        }
    }
}
