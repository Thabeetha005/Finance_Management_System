package com.kalpanaafinance.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayRepairConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            try {
                flyway.repair();
            } catch (Exception e) {
                // Ignore repair exceptions if table doesn't exist yet
            }
            flyway.migrate();
        };
    }
}
