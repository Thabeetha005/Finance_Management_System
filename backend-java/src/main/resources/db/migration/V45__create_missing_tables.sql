-- Migration: V45__create_missing_tables.sql
-- Purpose: Formalize database schema by creating missing tables required by Java entities and controllers.
-- Audit Trace:
--   1. 'deposits' table: Used by Deposit.java, DepositRepository, DepositService, DepositController (/api/wallet/deposits).
--   2. 'payment_attempts' table: Used by PaymentAttempt.java, PaymentAttemptRepository, AdminUserController (/api/admin/users/{id}/payment-attempts), and frontend AdminUserDetails.jsx.
-- Constraints:
--   ON DELETE RESTRICT on deposits.user_id prevents deletion of users with deposit history to enforce financial audit preservation.
-- Manual Rollback:
--   DROP TABLE IF EXISTS payment_attempts;
--   DROP TABLE IF EXISTS deposits;

CREATE TABLE IF NOT EXISTS deposits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    reference_number VARCHAR(255) NOT NULL UNIQUE,
    amount DECIMAL(14, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    gateway_reference VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    failure_reason TEXT NULL,
    CONSTRAINT fk_deposits_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS payment_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    installment_id BIGINT NOT NULL,
    amount DECIMAL(19, 2) NOT NULL,
    attempted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    CONSTRAINT fk_payment_attempts_installment FOREIGN KEY (installment_id) REFERENCES loan_installments (id) ON DELETE CASCADE
);
