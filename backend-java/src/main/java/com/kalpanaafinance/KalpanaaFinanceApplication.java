package com.kalpanaafinance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.kalpanaafinance")
@EntityScan(basePackages = "com.kalpanaafinance")
@EnableJpaRepositories(basePackages = "com.kalpanaafinance")
@EnableScheduling
public class KalpanaaFinanceApplication {

    public static void main(String[] args) {
        SpringApplication.run(KalpanaaFinanceApplication.class, args);
    }

}
