-- V15: Seed mock data safely using subqueries
-- Only uses columns that exist at this migration point (V15):
--   loans: id, user_id, amount, interest_rate, tenure_months, purpose, status, application_status, applied_at
--   investments: id, user_id, type, invested_amount, current_value, status, created_at
--   activity_logs: id, user_id, action, description, created_at
--   documents: id, user_id, type, file_name, file_url, status, verification_status, uploaded_at
-- NOTE: overall_outstanding_amount and overall_paid_amount are NOT yet in schema at V15.
--       They will be added and seeded in V22.

-- Seed Loans (using only columns that exist at V15 time)
INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, status, application_status, applied_at)
SELECT id, 50000.00, 10.5, 24, 'Personal Loan', 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 1 MONTH) FROM users WHERE email = 'rahul@gmail.com' LIMIT 1;

INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, status, application_status, applied_at)
SELECT id, 1200000.00, 8.5, 60, 'Home Renovation', 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 2 MONTH) FROM users WHERE email = 'priya@gmail.com' LIMIT 1;

INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, status, application_status, applied_at)
SELECT id, 300000.00, 12.0, 36, 'Car Loan', 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 3 MONTH) FROM users WHERE email = 'amit@gmail.com' LIMIT 1;

INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, status, application_status, applied_at)
SELECT id, 500000.00, 11.0, 48, 'Business', 'PENDING', 'UNDER_REVIEW', DATE_SUB(NOW(), INTERVAL 5 DAY) FROM users WHERE email = 'neha@gmail.com' LIMIT 1;

INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, status, application_status, applied_at)
SELECT id, 750000.00, 9.5, 60, 'Education', 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 4 MONTH) FROM users WHERE email = 'vikash@gmail.com' LIMIT 1;

INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, status, application_status, applied_at)
SELECT id, 200000.00, 13.0, 24, 'Medical Emergency', 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 5 MONTH) FROM users WHERE email = 'anjali@gmail.com' LIMIT 1;

INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, status, application_status, applied_at)
SELECT id, 45000.00, 14.0, 12, 'Travel', 'APPLIED', 'PENDING', DATE_SUB(NOW(), INTERVAL 2 DAY) FROM users WHERE email = 'mohit@gmail.com' LIMIT 1;

INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, status, application_status, applied_at)
SELECT id, 150000.00, 11.5, 36, 'Wedding', 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 1 MONTH) FROM users WHERE email = 'rina@gmail.com' LIMIT 1;

INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, status, application_status, applied_at)
SELECT id, 600000.00, 10.0, 48, 'Business', 'APPLIED', 'UNDER_REVIEW', DATE_SUB(NOW(), INTERVAL 10 DAY) FROM users WHERE email = 'karan@gmail.com' LIMIT 1;

INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, status, application_status, applied_at)
SELECT id, 80000.00, 12.5, 24, 'Personal Loan', 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 2 MONTH) FROM users WHERE email = 'sneha@gmail.com' LIMIT 1;

-- Seed Investments
INSERT IGNORE INTO investments (user_id, type, invested_amount, current_value, status, created_at)
SELECT id, 'Equity', 250000.00, 280000.00, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 3 MONTH) FROM users WHERE email = 'rahul@gmail.com' LIMIT 1;

INSERT IGNORE INTO investments (user_id, type, invested_amount, current_value, status, created_at)
SELECT id, 'Gold', 500000.00, 520000.00, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 6 MONTH) FROM users WHERE email = 'priya@gmail.com' LIMIT 1;

INSERT IGNORE INTO investments (user_id, type, invested_amount, current_value, status, created_at)
SELECT id, 'Debt', 150000.00, 155000.00, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 2 MONTH) FROM users WHERE email = 'amit@gmail.com' LIMIT 1;

INSERT IGNORE INTO investments (user_id, type, invested_amount, current_value, status, created_at)
SELECT id, 'Fixed Deposit', 100000.00, 102000.00, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 1 MONTH) FROM users WHERE email = 'vikash@gmail.com' LIMIT 1;

INSERT IGNORE INTO investments (user_id, type, invested_amount, current_value, status, created_at)
SELECT id, 'Equity', 300000.00, 340000.00, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 4 MONTH) FROM users WHERE email = 'anjali@gmail.com' LIMIT 1;

INSERT IGNORE INTO investments (user_id, type, invested_amount, current_value, status, created_at)
SELECT id, 'Digital Gold', 200000.00, 210000.00, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 5 MONTH) FROM users WHERE email = 'rina@gmail.com' LIMIT 1;

INSERT IGNORE INTO investments (user_id, type, invested_amount, current_value, status, created_at)
SELECT id, 'Others', 75000.00, 78000.00, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 2 MONTH) FROM users WHERE email = 'sneha@gmail.com' LIMIT 1;

-- Seed Activity Logs
INSERT IGNORE INTO activity_logs (user_id, action, description, created_at)
SELECT id, 'LOAN', 'Rahul Sharma applied for Personal Loan', DATE_SUB(NOW(), INTERVAL 5 MINUTE) FROM users WHERE email = 'rahul@gmail.com' LIMIT 1;

INSERT IGNORE INTO activity_logs (user_id, action, description, created_at)
SELECT id, 'INVESTMENT', 'Priya Mehta invested in Digital Gold', DATE_SUB(NOW(), INTERVAL 25 MINUTE) FROM users WHERE email = 'priya@gmail.com' LIMIT 1;

INSERT IGNORE INTO activity_logs (user_id, action, description, created_at)
SELECT id, 'PAYMENT', 'Amit Verma paid EMI of Rs.12,500', DATE_SUB(NOW(), INTERVAL 45 MINUTE) FROM users WHERE email = 'amit@gmail.com' LIMIT 1;

INSERT IGNORE INTO activity_logs (user_id, action, description, created_at)
SELECT id, 'USER', 'New user Neha Kapoor registered', DATE_SUB(NOW(), INTERVAL 2 HOUR) FROM users WHERE email = 'neha@gmail.com' LIMIT 1;

INSERT IGNORE INTO activity_logs (user_id, action, description, created_at)
SELECT id, 'LOAN', 'Vikash Singh loan application approved', DATE_SUB(NOW(), INTERVAL 5 HOUR) FROM users WHERE email = 'vikash@gmail.com' LIMIT 1;

-- Seed Documents (verification_status added in V11, so safe here)
INSERT IGNORE INTO documents (user_id, type, file_name, file_url, status, verification_status, uploaded_at)
SELECT id, 'ID_PROOF', 'aadhar.pdf', '/docs/aadhar.pdf', 'ACTIVE', 'RESUBMISSION_REQUIRED', DATE_SUB(NOW(), INTERVAL 1 DAY) FROM users WHERE email = 'rahul@gmail.com' LIMIT 1;

INSERT IGNORE INTO documents (user_id, type, file_name, file_url, status, verification_status, uploaded_at)
SELECT id, 'ADDRESS_PROOF', 'utility.pdf', '/docs/utility.pdf', 'ACTIVE', 'RESUBMISSION_REQUIRED', DATE_SUB(NOW(), INTERVAL 2 DAY) FROM users WHERE email = 'priya@gmail.com' LIMIT 1;

INSERT IGNORE INTO documents (user_id, type, file_name, file_url, status, verification_status, uploaded_at)
SELECT id, 'INCOME_PROOF', 'salary.pdf', '/docs/salary.pdf', 'ACTIVE', 'RESUBMISSION_REQUIRED', DATE_SUB(NOW(), INTERVAL 3 DAY) FROM users WHERE email = 'amit@gmail.com' LIMIT 1;
