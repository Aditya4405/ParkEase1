package com.demo.parkease.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Ensures PostgreSQL database check constraints permit all current Java enum values.
 * 
 * When new values (OWNER_PENDING, OWNER_REJECTED) were added to User.AccountStatus,
 * PostgreSQL's existing check constraint (users_account_status_check) rejected inserts
 * because Hibernate's ddl-auto=update does not alter existing CHECK constraints.
 * This runner automatically drops and recreates the constraint to include all enum states.
 */
@Component
public class DatabaseConstraintMigration implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConstraintMigration.class);
    private final JdbcTemplate jdbcTemplate;

    public DatabaseConstraintMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            log.info("Running automatic PostgreSQL constraint sync...");
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_account_status_check;");
            jdbcTemplate.execute("ALTER TABLE users ADD CONSTRAINT users_account_status_check " +
                    "CHECK (account_status IN ('ACTIVE', 'PAYMENT_PENDING', 'SUSPENDED', 'OWNER_PENDING', 'OWNER_REJECTED'));");
            log.info("PostgreSQL users_account_status_check constraint verified successfully.");
        } catch (Exception e) {
            log.warn("Database constraint sync warning: {}", e.getMessage());
        }
    }
}
