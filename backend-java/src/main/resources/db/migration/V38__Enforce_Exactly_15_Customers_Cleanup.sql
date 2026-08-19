-- V38__Enforce_Exactly_15_Customers_Cleanup.sql
-- Purge all customer accounts except exactly 15 customers (including CUS1021) from the database.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS keep_customer_ids;
CREATE TABLE keep_customer_ids (id BIGINT PRIMARY KEY);

INSERT IGNORE INTO keep_customer_ids (id)
SELECT id FROM users WHERE customer_id = 'CUS1021' OR email = 'cus1021@kalpanaafinance.com' OR id = 21;

INSERT IGNORE INTO keep_customer_ids (id)
SELECT id FROM users 
WHERE role = 'CUSTOMER'
ORDER BY id ASC 
LIMIT 15;

DELETE FROM loans WHERE user_id IN (
    SELECT id FROM users WHERE role = 'CUSTOMER' AND id NOT IN (SELECT id FROM keep_customer_ids)
);

DELETE FROM documents WHERE user_id IN (
    SELECT id FROM users WHERE role = 'CUSTOMER' AND id NOT IN (SELECT id FROM keep_customer_ids)
);

DELETE FROM users WHERE role = 'CUSTOMER' AND id NOT IN (SELECT id FROM keep_customer_ids);

DROP TABLE IF EXISTS keep_customer_ids;

SET FOREIGN_KEY_CHECKS = 1;
