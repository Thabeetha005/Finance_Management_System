-- Migration: V46__fix_schema_code_mismatches.sql
-- Purpose: Add missing columns to 'transactions' and 'documents' tables to synchronize MySQL schema with JPA entities.
-- Audit Trace:
--   1. 'transactions' table: Transaction.java declares withdrawableBalanceBefore, withdrawableBalanceAfter, withdrawalEligible (@Column precision = 19, scale = 2).
--   2. 'documents' table: Document.java declares applicationId, applicationType, documentType (nullable = true).
-- Compatibility: Uses information_schema checks with dynamic PREPARE/EXECUTE for 100% MySQL 5.7+ and 8.0.x compatibility.
-- Manual Rollback:
--   ALTER TABLE transactions DROP COLUMN withdrawable_balance_before, DROP COLUMN withdrawable_balance_after, DROP COLUMN withdrawal_eligible;
--   ALTER TABLE documents DROP COLUMN application_id, DROP COLUMN application_type, DROP COLUMN document_type;

-- 1. Add withdrawable_balance_before to transactions (DECIMAL(19,2) to match Transaction.java & existing balance columns)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'transactions' AND column_name = 'withdrawable_balance_before');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE transactions ADD COLUMN withdrawable_balance_before DECIMAL(19,2) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Add withdrawable_balance_after to transactions (DECIMAL(19,2) to match Transaction.java & existing balance columns)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'transactions' AND column_name = 'withdrawable_balance_after');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE transactions ADD COLUMN withdrawable_balance_after DECIMAL(19,2) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. Add withdrawal_eligible to transactions
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'transactions' AND column_name = 'withdrawal_eligible');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE transactions ADD COLUMN withdrawal_eligible BOOLEAN DEFAULT TRUE', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. Add application_id to documents (NULLABLE to support profile-level user documents without application binding)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'documents' AND column_name = 'application_id');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE documents ADD COLUMN application_id BIGINT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 5. Add application_type to documents
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'documents' AND column_name = 'application_type');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE documents ADD COLUMN application_type VARCHAR(50) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 6. Add document_type to documents
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'documents' AND column_name = 'document_type');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE documents ADD COLUMN document_type VARCHAR(50) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
