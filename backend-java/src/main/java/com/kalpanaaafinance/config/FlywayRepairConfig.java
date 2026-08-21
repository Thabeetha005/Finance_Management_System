package com.kalpanaaafinance.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.logging.Logger;

@Configuration
public class FlywayRepairConfig {

    private static final Logger log = Logger.getLogger(FlywayRepairConfig.class.getName());

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            try {
                log.info("Executing Flyway repair to align schema history before migration...");
                flyway.repair();
                log.info("Flyway repair completed successfully.");
            } catch (Exception e) {
                log.warning("Flyway repair encountered an exception (normal if schema_history table is absent): " + e.getMessage());
            }
            log.info("Executing Flyway migration...");
            flyway.migrate();
            log.info("Flyway migration completed successfully.");
        };
    }
}
