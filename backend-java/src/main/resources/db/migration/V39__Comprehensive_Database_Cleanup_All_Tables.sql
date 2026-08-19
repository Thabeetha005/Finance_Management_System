-- V39__Comprehensive_Database_Cleanup_All_Tables.sql
-- Purge all orphaned user data across every database table, keeping strictly the 15 valid customers + admin + consultants.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS keep_user_ids;
CREATE TABLE keep_user_ids (id BIGINT PRIMARY KEY);

INSERT IGNORE INTO keep_user_ids (id)
SELECT id FROM users WHERE role = 'ADMIN' OR role = 'CONSULTANT';

INSERT IGNORE INTO keep_user_ids (id)
SELECT id FROM users WHERE customer_id = 'CUS1021' OR email = 'cus1021@kalpanaafinance.com' OR id = 21;

INSERT IGNORE INTO keep_user_ids (id)
SELECT id FROM users 
WHERE role = 'CUSTOMER'
ORDER BY id ASC 
LIMIT 15;

DELETE FROM loans WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM keep_user_ids);

DELETE FROM documents WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM keep_user_ids);

DELETE FROM users WHERE id NOT IN (SELECT id FROM keep_user_ids);

DROP TABLE IF EXISTS keep_user_ids;

SET FOREIGN_KEY_CHECKS = 1;
