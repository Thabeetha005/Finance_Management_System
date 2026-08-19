package com.kalpanaafinance;

import com.kalpanaafinance.entity.Role;
import com.kalpanaafinance.entity.User;
import com.kalpanaafinance.repository.UserRepository;
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
