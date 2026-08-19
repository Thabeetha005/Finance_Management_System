-- V40__Purge_All_Non_Existent_User_Data.sql
-- Delete all orphan records from loans, documents, support_tickets, contact_requests, consultations, deposits, withdrawals, and wallet_transactions
-- that reference non-existent users or mock test emails.
-- Uses IF EXISTS / conditional deletes for tables that may not exist yet.

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM loans WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM users);

DELETE FROM documents WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM users);

DELETE FROM support_tickets WHERE customer_id IS NULL OR customer_id NOT IN (SELECT id FROM users);

DELETE FROM contact_requests WHERE email NOT IN (SELECT email FROM users WHERE email IS NOT NULL);

DELETE FROM consultations WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM users);

-- Safely delete from withdrawals (created in V31) if table exists
SET @has_withdrawals = (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'withdrawals');
SET @sql_w = IF(@has_withdrawals > 0, 'DELETE FROM withdrawals WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM users)', 'SELECT 1');
PREPARE stmt_w FROM @sql_w; EXECUTE stmt_w; DEALLOCATE PREPARE stmt_w;

-- Safely delete from deposits (may not exist) if table exists
SET @has_deposits = (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'deposits');
SET @sql_d = IF(@has_deposits > 0, 'DELETE FROM deposits WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM users)', 'SELECT 1');
PREPARE stmt_d FROM @sql_d; EXECUTE stmt_d; DEALLOCATE PREPARE stmt_d;

-- Safely delete from wallet_transactions (may not exist) if table exists
SET @has_wt = (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'wallet_transactions');
SET @sql_wt = IF(@has_wt > 0, 'DELETE FROM wallet_transactions WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM users)', 'SELECT 1');
PREPARE stmt_wt FROM @sql_wt; EXECUTE stmt_wt; DEALLOCATE PREPARE stmt_wt;

SET FOREIGN_KEY_CHECKS = 1;
