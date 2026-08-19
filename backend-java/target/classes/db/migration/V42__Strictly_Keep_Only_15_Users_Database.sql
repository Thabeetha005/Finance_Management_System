-- V42__Strictly_Keep_Only_15_Users_Database.sql
-- Delete all user accounts except strictly 15 customer accounts (including CUS1021) + Admin + Consultants.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS allowed_user_ids;
CREATE TABLE allowed_user_ids (id BIGINT PRIMARY KEY);

INSERT IGNORE INTO allowed_user_ids (id)
SELECT id FROM users WHERE role IN ('ADMIN', 'CONSULTANT');

INSERT IGNORE INTO allowed_user_ids (id)
SELECT id FROM users WHERE customer_id = 'CUS1021' OR email = 'cus1021@kalpanaafinance.com' OR id = 21;

INSERT IGNORE INTO allowed_user_ids (id)
SELECT id FROM users 
WHERE role = 'CUSTOMER'
ORDER BY id ASC 
LIMIT 15;

DELETE FROM loans WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM allowed_user_ids);

DELETE FROM documents WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM allowed_user_ids);

DELETE FROM users WHERE id NOT IN (SELECT id FROM allowed_user_ids);

DROP TABLE IF EXISTS allowed_user_ids;

SET FOREIGN_KEY_CHECKS = 1;
