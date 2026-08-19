-- V15: Seed mock data safely using subqueries (avoids hardcoded user_id FK failures on fresh DB)
-- This migration uses INSERT IGNORE and subqueries to gracefully handle any missing references.

-- Seed Loans using email-based user lookup (safe for fresh Railway DB)
INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, overall_outstanding_amount, overall_paid_amount, status, application_status, applied_at)
SELECT id, 50000.00, 10.5, 24, 'Personal Loan', 40000.00, 10000.00, 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 1 MONTH) FROM users WHERE email = 'rahul@gmail.com' LIMIT 1;

INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, overall_outstanding_amount, overall_paid_amount, status, application_status, applied_at)
SELECT id, 1200000.00, 8.5, 60, 'Home Renovation', 1100000.00, 100000.00, 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 2 MONTH) FROM users WHERE email = 'priya@gmail.com' LIMIT 1;

INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, overall_outstanding_amount, overall_paid_amount, status, application_status, applied_at)
SELECT id, 300000.00, 12.0, 36, 'Car Loan', 250000.00, 50000.00, 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 3 MONTH) FROM users WHERE email = 'amit@gmail.com' LIMIT 1;

INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, overall_outstanding_amount, overall_paid_amount, status, application_status, applied_at)
SELECT id, 500000.00, 11.0, 48, 'Business', 0, 0, 'PENDING', 'UNDER_REVIEW', DATE_SUB(NOW(), INTERVAL 5 DAY) FROM users WHERE email = 'neha@gmail.com' LIMIT 1;

INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, overall_outstanding_amount, overall_paid_amount, status, application_status, applied_at)
SELECT id, 750000.00, 9.5, 60, 'Education', 700000.00, 50000.00, 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 4 MONTH) FROM users WHERE email = 'vikash@gmail.com' LIMIT 1;

INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, overall_outstanding_amount, overall_paid_amount, status, application_status, applied_at)
SELECT id, 200000.00, 13.0, 24, 'Medical Emergency', 150000.00, 50000.00, 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 5 MONTH) FROM users WHERE email = 'anjali@gmail.com' LIMIT 1;

INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, overall_outstanding_amount, overall_paid_amount, status, application_status, applied_at)
SELECT id, 45000.00, 14.0, 12, 'Travel', 0, 0, 'APPLIED', 'PENDING', DATE_SUB(NOW(), INTERVAL 2 DAY) FROM users WHERE email = 'mohit@gmail.com' LIMIT 1;

INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, overall_outstanding_amount, overall_paid_amount, status, application_status, applied_at)
SELECT id, 150000.00, 11.5, 36, 'Wedding', 120000.00, 30000.00, 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 1 MONTH) FROM users WHERE email = 'rina@gmail.com' LIMIT 1;

INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, overall_outstanding_amount, overall_paid_amount, status, application_status, applied_at)
SELECT id, 600000.00, 10.0, 48, 'Business', 0, 0, 'APPLIED', 'UNDER_REVIEW', DATE_SUB(NOW(), INTERVAL 10 DAY) FROM users WHERE email = 'karan@gmail.com' LIMIT 1;

INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, overall_outstanding_amount, overall_paid_amount, status, application_status, applied_at)
SELECT id, 80000.00, 12.5, 24, 'Personal Loan', 60000.00, 20000.00, 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 2 MONTH) FROM users WHERE email = 'sneha@gmail.com' LIMIT 1;

-- Seed Investments using email-based user lookup
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

-- Seed Activity Logs using email-based user lookup
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

-- Seed Documents using email-based user lookup
INSERT IGNORE INTO documents (user_id, type, file_name, file_url, status, verification_status, uploaded_at)
SELECT id, 'ID_PROOF', 'aadhar.pdf', '/docs/aadhar.pdf', 'ACTIVE', 'RESUBMISSION_REQUIRED', DATE_SUB(NOW(), INTERVAL 1 DAY) FROM users WHERE email = 'rahul@gmail.com' LIMIT 1;

INSERT IGNORE INTO documents (user_id, type, file_name, file_url, status, verification_status, uploaded_at)
SELECT id, 'ADDRESS_PROOF', 'utility.pdf', '/docs/utility.pdf', 'ACTIVE', 'RESUBMISSION_REQUIRED', DATE_SUB(NOW(), INTERVAL 2 DAY) FROM users WHERE email = 'priya@gmail.com' LIMIT 1;

INSERT IGNORE INTO documents (user_id, type, file_name, file_url, status, verification_status, uploaded_at)
SELECT id, 'INCOME_PROOF', 'salary.pdf', '/docs/salary.pdf', 'ACTIVE', 'RESUBMISSION_REQUIRED', DATE_SUB(NOW(), INTERVAL 3 DAY) FROM users WHERE email = 'amit@gmail.com' LIMIT 1;
