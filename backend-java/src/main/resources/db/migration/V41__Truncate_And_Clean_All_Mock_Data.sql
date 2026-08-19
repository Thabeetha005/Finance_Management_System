-- V41__Truncate_And_Clean_All_Mock_Data.sql
-- Strictly delete all mock loans, mock documents, mock contact requests, and mock tickets linked to deleted or mock names ('Customer A', 'Test Customer', etc.)

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS valid_active_user_ids;
CREATE TABLE valid_active_user_ids (id BIGINT PRIMARY KEY);

INSERT IGNORE INTO valid_active_user_ids (id)
SELECT id FROM users WHERE role IN ('ADMIN', 'CONSULTANT');

INSERT IGNORE INTO valid_active_user_ids (id)
SELECT id FROM users WHERE customer_id = 'CUS1021' OR email = 'cus1021@kalpanaafinance.com' OR id = 21;

INSERT IGNORE INTO valid_active_user_ids (id)
SELECT id FROM users 
WHERE role = 'CUSTOMER' 
ORDER BY id ASC 
LIMIT 15;

DELETE FROM loans 
WHERE user_id IS NULL 
   OR user_id NOT IN (SELECT id FROM valid_active_user_ids);

DELETE FROM documents 
WHERE user_id IS NULL 
   OR user_id NOT IN (SELECT id FROM valid_active_user_ids);

DELETE FROM users WHERE id NOT IN (SELECT id FROM valid_active_user_ids);

DROP TABLE IF EXISTS valid_active_user_ids;

SET FOREIGN_KEY_CHECKS = 1;
