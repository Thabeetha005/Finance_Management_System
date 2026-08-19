-- V22: Add missing loan columns (safe - uses IF NOT EXISTS syntax)
ALTER TABLE loans ADD COLUMN IF NOT EXISTS outstanding_balance DECIMAL(19,2) NULL;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS overall_outstanding_amount DECIMAL(19,2) NULL;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS overall_paid_amount DECIMAL(19,2) NULL;

-- Backfill outstanding amounts for seeded loans from V15
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
