package com.kalpanaafinance.config;

import com.kalpanaafinance.entity.InvestmentPlan;
import com.kalpanaafinance.repository.InvestmentPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final InvestmentPlanRepository investmentPlanRepository;
    private final com.kalpanaafinance.repository.UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        userRepository.findByEmail("thabee@kalpanaafinance.com").ifPresent(user -> {
            user.setPasswordHash(passwordEncoder.encode("admin123"));
            userRepository.save(user);
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
