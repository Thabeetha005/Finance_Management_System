-- V35__Keep_Only_10_Customers_Including_CUS1021.sql
-- Ensure total customer count in database is exactly 10, explicitly preserving CUS1021.

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Ensure CUS1021 user exists in database (no forced ID - let auto-increment assign it)
INSERT IGNORE INTO users (customer_id, name, email, password_hash, role, phone, account_status, is_verified, balance, created_at, updated_at)
SELECT 'CUS1021', 'Customer CUS1021', 'cus1021@kalpanaaafinance.com', '$2a$10$93dk.v7w4VmpwShh8JtldeEpzKBWJ6UDZNcSOi7ScNBaY8BzaYwlS', 'CUSTOMER', '9876541021', 'Active', TRUE, 75000.00, NOW(), NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE customer_id = 'CUS1021' OR email = 'cus1021@kalpanaaafinance.com');

-- 2. Populate customer_id for any nulls
UPDATE users SET customer_id = CONCAT('CUS', 1000 + id) WHERE customer_id IS NULL OR customer_id = '';

-- 3. Create temporary table of the exact 10 customer IDs to keep:
--    CUS1021 + the first 9 other customers by ID
DROP TEMPORARY TABLE IF EXISTS keep_customer_ids;
CREATE TEMPORARY TABLE keep_customer_ids (id BIGINT PRIMARY KEY);

INSERT INTO keep_customer_ids (id)
SELECT id FROM users WHERE customer_id = 'CUS1021' LIMIT 1;

INSERT INTO keep_customer_ids (id)
SELECT id FROM users 
WHERE role = 'CUSTOMER' AND customer_id != 'CUS1021' 
ORDER BY id ASC 
LIMIT 9;

-- 4. Clean up related tables for customers outside the 10 kept customers
DELETE FROM loans WHERE user_id IN (
    SELECT id FROM users WHERE role = 'CUSTOMER' AND id NOT IN (SELECT id FROM keep_customer_ids)
);

DELETE FROM documents WHERE user_id IN (
    SELECT id FROM users WHERE role = 'CUSTOMER' AND id NOT IN (SELECT id FROM keep_customer_ids)
);

-- 5. Delete all extra customer records
DELETE FROM users WHERE role = 'CUSTOMER' AND id NOT IN (SELECT id FROM keep_customer_ids);

DROP TEMPORARY TABLE IF EXISTS keep_customer_ids;

SET FOREIGN_KEY_CHECKS = 1;
