-- Migration: V48__fix_wallet_withdrawals_migration.sql
-- Purpose: Safely complete the bank accounts, notifications, and wallet withdrawals setup originally attempted by V31.
-- Audit Trace:
--   V31 failed on re-runs because 'ALTER TABLE notifications ADD COLUMN title...' threw duplicate column errors (SQLState 42S21, Error 1060) when Flyway auto-repaired V31's history entry.
--   V48 uses dynamic PREPARE/EXECUTE with information_schema checks for all columns, tables, and indexes, ensuring 100% idempotent completion regardless of V31's partial state.
-- Manual Rollback:
--   DROP TABLE IF EXISTS withdrawals;
--   DROP TABLE IF EXISTS bank_accounts;

-- 1. Safely add 'title' to notifications
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notifications' AND column_name = 'title');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE notifications ADD COLUMN title VARCHAR(255) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Safely add 'type' to notifications
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notifications' AND column_name = 'type');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE notifications ADD COLUMN type VARCHAR(50) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. Create bank_accounts table IF NOT EXISTS
CREATE TABLE IF NOT EXISTS bank_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    verified_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bank_accounts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Create withdrawals table IF NOT EXISTS
CREATE TABLE IF NOT EXISTS withdrawals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    bank_account_id BIGINT NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_number_masked VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    balance_before DECIMAL(14,2) NULL,
    balance_after DECIMAL(14,2) NULL,
    reference_number VARCHAR(100) NOT NULL UNIQUE,
    rejection_reason VARCHAR(500) NULL,
    admin_id BIGINT NULL,
    requested_at DATETIME NOT NULL,
    approved_at DATETIME NULL,
    processed_at DATETIME NULL,
    completed_at DATETIME NULL,
    rejected_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_withdrawals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_withdrawals_bank_account FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id),
    CONSTRAINT fk_withdrawals_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Safely create indexes if they don't already exist
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'withdrawals' AND index_name = 'idx_withdrawals_user_status');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_withdrawals_user_status ON withdrawals (user_id, status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'withdrawals' AND index_name = 'idx_withdrawals_user_created');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_withdrawals_user_created ON withdrawals (user_id, created_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
