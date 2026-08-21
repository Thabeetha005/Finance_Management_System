package com.kalpanaaafinance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.kalpanaaafinance")
@EntityScan(basePackages = "com.kalpanaaafinance")
@EnableJpaRepositories(basePackages = "com.kalpanaaafinance")
@EnableScheduling
public class KalpanaaaFinanceApplication {

    public static void main(String[] args) {
        SpringApplication.run(KalpanaaaFinanceApplication.class, args);
    }

}
