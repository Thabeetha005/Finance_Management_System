package com.kalpanaafinance;

import com.kalpanaafinance.modules.shared.entity.Role;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class KalpanaaFinanceApplication {

    public static void main(String[] args) {
        SpringApplication.run(KalpanaaFinanceApplication.class, args);
    }

}
