-- V40__Purge_All_Non_Existent_User_Data.sql
-- Delete all orphan records from loans, documents, support_tickets, contact_requests, consultations, deposits, withdrawals, and wallet_transactions
-- that reference non-existent users or mock test emails.

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM loans WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM users);

DELETE FROM documents WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM users);

DELETE FROM support_tickets WHERE customer_id IS NULL OR customer_id NOT IN (SELECT id FROM users);

DELETE FROM contact_requests WHERE email NOT IN (SELECT email FROM users WHERE email IS NOT NULL);

DELETE FROM consultations WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM users);

DELETE FROM deposits WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM users);

DELETE FROM withdrawals WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM users);

DELETE FROM wallet_transactions WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM users);

SET FOREIGN_KEY_CHECKS = 1;
