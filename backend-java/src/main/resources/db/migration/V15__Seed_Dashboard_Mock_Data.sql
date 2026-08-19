-- V15: Seed mock data for loans, investments, activity_logs, and documents to populate the dashboard

-- Insert Loans for the charts (spread over last 6 months)
INSERT INTO loans (user_id, amount, interest_rate, tenure_months, purpose, overall_outstanding_amount, overall_paid_amount, status, application_status, applied_at)
VALUES 
(1, 50000.00, 10.5, 24, 'Personal Loan', 40000.00, 10000.00, 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(2, 1200000.00, 8.5, 60, 'Home Renovation', 1100000.00, 100000.00, 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(3, 300000.00, 12.0, 36, 'Car Loan', 250000.00, 50000.00, 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 3 MONTH)),
(4, 500000.00, 11.0, 48, 'Business', 0, 0, 'PENDING', 'UNDER_REVIEW', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(5, 750000.00, 9.5, 60, 'Education', 700000.00, 50000.00, 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 4 MONTH)),
(6, 200000.00, 13.0, 24, 'Medical Emergency', 150000.00, 50000.00, 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 5 MONTH)),
(7, 45000.00, 14.0, 12, 'Travel', 0, 0, 'APPLIED', 'PENDING', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(8, 150000.00, 11.5, 36, 'Wedding', 120000.00, 30000.00, 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(9, 600000.00, 10.0, 48, 'Business', 0, 0, 'APPLIED', 'UNDER_REVIEW', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(10, 80000.00, 12.5, 24, 'Personal Loan', 60000.00, 20000.00, 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 2 MONTH));

-- Insert Investments for the donut chart (Equity, Gold, Debt, Others)
INSERT INTO investments (user_id, type, invested_amount, current_value, status, created_at)
VALUES 
(1, 'Equity', 250000.00, 280000.00, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 3 MONTH)),
(2, 'Gold', 500000.00, 520000.00, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 6 MONTH)),
(3, 'Debt', 150000.00, 155000.00, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(5, 'Fixed Deposit', 100000.00, 102000.00, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(6, 'Equity', 300000.00, 340000.00, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 4 MONTH)),
(8, 'Digital Gold', 200000.00, 210000.00, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 5 MONTH)),
(10, 'Others', 75000.00, 78000.00, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 2 MONTH));

-- Insert Activity Logs for the Recent Activity feed
INSERT INTO activity_logs (user_id, action, description, created_at)
VALUES 
(1, 'LOAN', 'Rahul Sharma applied for Personal Loan', DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
(2, 'INVESTMENT', 'Priya Mehta invested in Digital Gold', DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(3, 'PAYMENT', 'Amit Verma paid EMI of ₹12,500', DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(4, 'USER', 'New user Neha Kapoor registered', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(5, 'LOAN', 'Vikash Singh loan application approved', DATE_SUB(NOW(), INTERVAL 5 HOUR));

-- Insert some Documents requiring resubmission to trigger system alerts
INSERT INTO documents (user_id, type, file_name, file_url, status, verification_status, uploaded_at)
VALUES 
(1, 'ID_PROOF', 'aadhar.pdf', '/docs/1/aadhar.pdf', 'ACTIVE', 'RESUBMISSION_REQUIRED', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 'ADDRESS_PROOF', 'utility.pdf', '/docs/2/utility.pdf', 'ACTIVE', 'RESUBMISSION_REQUIRED', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 'INCOME_PROOF', 'salary.pdf', '/docs/3/salary.pdf', 'ACTIVE', 'RESUBMISSION_REQUIRED', DATE_SUB(NOW(), INTERVAL 3 DAY));
