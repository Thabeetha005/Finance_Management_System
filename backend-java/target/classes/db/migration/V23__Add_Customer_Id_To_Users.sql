ALTER TABLE users 
ADD COLUMN customer_id VARCHAR(50) UNIQUE;

UPDATE users SET customer_id = CONCAT('CUS', 1000 + id) WHERE customer_id IS NULL;
