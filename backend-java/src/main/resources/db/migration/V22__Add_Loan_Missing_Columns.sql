-- V22: Add missing loan columns
-- Uses SET/PREPARE pattern to add columns only if they don't already exist (idempotent)

SET @dbname = DATABASE();

-- Add outstanding_balance if not exists
SET @col1 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'loans' AND COLUMN_NAME = 'outstanding_balance');
SET @sql1 = IF(@col1 = 0, 'ALTER TABLE loans ADD COLUMN outstanding_balance DECIMAL(19,2) NULL', 'SELECT 1');
PREPARE stmt1 FROM @sql1; EXECUTE stmt1; DEALLOCATE PREPARE stmt1;

-- Add overall_outstanding_amount if not exists
SET @col2 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'loans' AND COLUMN_NAME = 'overall_outstanding_amount');
SET @sql2 = IF(@col2 = 0, 'ALTER TABLE loans ADD COLUMN overall_outstanding_amount DECIMAL(19,2) NULL', 'SELECT 1');
PREPARE stmt2 FROM @sql2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

-- Add overall_paid_amount if not exists
SET @col3 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'loans' AND COLUMN_NAME = 'overall_paid_amount');
SET @sql3 = IF(@col3 = 0, 'ALTER TABLE loans ADD COLUMN overall_paid_amount DECIMAL(19,2) NULL', 'SELECT 1');
PREPARE stmt3 FROM @sql3; EXECUTE stmt3; DEALLOCATE PREPARE stmt3;

-- Now update the seeded loans with outstanding and paid amounts (safe since columns now exist)
UPDATE loans SET overall_outstanding_amount = 40000.00, overall_paid_amount = 10000.00
WHERE user_id = (SELECT id FROM users WHERE email = 'rahul@gmail.com' LIMIT 1) AND purpose = 'Personal Loan' AND amount = 50000.00;

UPDATE loans SET overall_outstanding_amount = 1100000.00, overall_paid_amount = 100000.00
WHERE user_id = (SELECT id FROM users WHERE email = 'priya@gmail.com' LIMIT 1) AND purpose = 'Home Renovation';

UPDATE loans SET overall_outstanding_amount = 250000.00, overall_paid_amount = 50000.00
WHERE user_id = (SELECT id FROM users WHERE email = 'amit@gmail.com' LIMIT 1) AND purpose = 'Car Loan';

UPDATE loans SET overall_outstanding_amount = 700000.00, overall_paid_amount = 50000.00
WHERE user_id = (SELECT id FROM users WHERE email = 'vikash@gmail.com' LIMIT 1) AND purpose = 'Education';

UPDATE loans SET overall_outstanding_amount = 150000.00, overall_paid_amount = 50000.00
WHERE user_id = (SELECT id FROM users WHERE email = 'anjali@gmail.com' LIMIT 1) AND purpose = 'Medical Emergency';

UPDATE loans SET overall_outstanding_amount = 120000.00, overall_paid_amount = 30000.00
WHERE user_id = (SELECT id FROM users WHERE email = 'rina@gmail.com' LIMIT 1) AND purpose = 'Wedding';

UPDATE loans SET overall_outstanding_amount = 60000.00, overall_paid_amount = 20000.00
WHERE user_id = (SELECT id FROM users WHERE email = 'sneha@gmail.com' LIMIT 1) AND purpose = 'Personal Loan';
