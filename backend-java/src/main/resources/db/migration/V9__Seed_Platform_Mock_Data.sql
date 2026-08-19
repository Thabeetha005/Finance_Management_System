-- V9__Seed_Platform_Mock_Data.sql
-- Uses INSERT IGNORE and email-based subqueries instead of hardcoded user IDs

-- Insert 2 additional Users
INSERT IGNORE INTO users (name, email, password_hash, role, balance) VALUES
('David Test', 'david@example.com', '$2a$10$93dk.v7w4VmpwShh8JtldeEpzKBWJ6UDZNcSOi7ScNBaY8BzaYwlS', 'CUSTOMER', 500.00),
('Eve Sample', 'eve.sample@example.com', '$2a$10$93dk.v7w4VmpwShh8JtldeEpzKBWJ6UDZNcSOi7ScNBaY8BzaYwlS', 'CUSTOMER', 99000.00);

-- Insert Accounts using email-based subqueries
INSERT IGNORE INTO accounts (name, type, balance, user_id)
SELECT 'KF1001', 'SAVINGS', 15000.00, id FROM users WHERE email = 'alice@example.com' LIMIT 1;
INSERT IGNORE INTO accounts (name, type, balance, user_id)
SELECT 'KF1002', 'CHECKING', 4200.50, id FROM users WHERE email = 'bob@example.com' LIMIT 1;
INSERT IGNORE INTO accounts (name, type, balance, user_id)
SELECT 'KF1003', 'SAVINGS', 8900.00, id FROM users WHERE email = 'charlie@example.com' LIMIT 1;
INSERT IGNORE INTO accounts (name, type, balance, user_id)
SELECT 'KF1004', 'SAVINGS', 250.75, id FROM users WHERE email = 'david@example.com' LIMIT 1;
INSERT IGNORE INTO accounts (name, type, balance, user_id)
SELECT 'KF1005', 'INVESTMENT', 99000.00, id FROM users WHERE email = 'eve.sample@example.com' LIMIT 1;

-- Insert Loans using email-based subqueries
INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, status, applied_at, approved_at)
SELECT id, 500000.00, 10.5, 60, 'Home Renovation', 'ACTIVE', '2026-07-01 10:00:00', '2026-07-05 14:00:00' FROM users WHERE email = 'alice@example.com' LIMIT 1;
INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, status, applied_at, approved_at)
SELECT id, 100000.00, 12.0, 24, 'Personal', 'PENDING', '2026-08-10 09:30:00', NULL FROM users WHERE email = 'bob@example.com' LIMIT 1;
INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, status, applied_at, approved_at)
SELECT id, 300000.00, 11.0, 36, 'Car Loan', 'COMPLETED', '2023-01-10 10:00:00', '2023-01-15 10:00:00' FROM users WHERE email = 'alice@example.com' LIMIT 1;
INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, status, applied_at, approved_at)
SELECT id, 10000.00, 12.5, 12, 'Personal', 'ACTIVE', '2026-08-14 10:00:00', '2026-08-14 11:00:00' FROM users WHERE email = 'charlie@example.com' LIMIT 1;
INSERT IGNORE INTO loans (user_id, amount, interest_rate, tenure_months, purpose, status, applied_at, approved_at)
SELECT id, 25000.00, 8.0, 36, 'Auto', 'ACTIVE', '2026-08-14 12:00:00', '2026-08-14 13:00:00' FROM users WHERE email = 'david@example.com' LIMIT 1;

-- Insert Investments using email-based subqueries
INSERT IGNORE INTO investments (user_id, type, invested_amount, current_value, status, created_at)
SELECT id, 'Digital Gold', 50000.00, 55000.00, 'ACTIVE', '2026-01-15 11:00:00' FROM users WHERE email = 'alice@example.com' LIMIT 1;
INSERT IGNORE INTO investments (user_id, type, invested_amount, current_value, status, created_at)
SELECT id, 'Mutual Funds', 150000.00, 175000.00, 'ACTIVE', '2025-11-20 10:00:00' FROM users WHERE email = 'alice@example.com' LIMIT 1;
INSERT IGNORE INTO investments (user_id, type, invested_amount, current_value, status, created_at)
SELECT id, 'Startup Investment', 200000.00, 200000.00, 'PENDING', '2026-08-12 15:00:00' FROM users WHERE email = 'bob@example.com' LIMIT 1;
INSERT IGNORE INTO investments (user_id, type, invested_amount, current_value, status, created_at)
SELECT id, 'Growth Fund A', 5000.00, 5200.00, 'ACTIVE', '2026-08-14 09:00:00' FROM users WHERE email = 'bob@example.com' LIMIT 1;
INSERT IGNORE INTO investments (user_id, type, invested_amount, current_value, status, created_at)
SELECT id, 'Tech ETF', 2000.00, 1950.00, 'ACTIVE', '2026-08-14 09:30:00' FROM users WHERE email = 'charlie@example.com' LIMIT 1;
INSERT IGNORE INTO investments (user_id, type, invested_amount, current_value, status, created_at)
SELECT id, 'Venture Capital', 50000.00, 62000.00, 'ACTIVE', '2026-08-14 11:00:00' FROM users WHERE email = 'eve.sample@example.com' LIMIT 1;

-- Insert Payments using email-based subqueries
INSERT IGNORE INTO payments (user_id, amount, method, reference, status, created_at)
SELECT id, 10746.00, 'UPI', 'UPI1234567890', 'COMPLETED', '2026-08-01 10:00:00' FROM users WHERE email = 'alice@example.com' LIMIT 1;
INSERT IGNORE INTO payments (user_id, amount, method, reference, status, created_at)
SELECT id, 5000.00, 'Bank Transfer', 'NEFT987654321', 'COMPLETED', '2026-08-05 14:30:00' FROM users WHERE email = 'bob@example.com' LIMIT 1;

-- Insert Consultations using email-based subqueries
INSERT IGNORE INTO consultations (user_id, type, preferred_date, preferred_time, message, status, notes, created_at)
SELECT id, 'Wealth Management', '2026-08-20', '10:00 AM', 'Looking to diversify my portfolio.', 'REQUESTED', NULL, '2026-08-13 09:00:00' FROM users WHERE email = 'alice@example.com' LIMIT 1;
INSERT IGNORE INTO consultations (user_id, type, preferred_date, preferred_time, message, status, notes, created_at)
SELECT id, 'Loan Consultation', '2026-08-15', '02:00 PM', 'Need info on business loans.', 'CONFIRMED', 'Assigned to agent John.', '2026-08-10 11:00:00' FROM users WHERE email = 'charlie@example.com' LIMIT 1;

-- Insert Contact Requests
INSERT IGNORE INTO contact_requests (name, email, phone, subject, message, request_type, status, created_at) VALUES 
('David Test', 'david@test.com', '9876543210', 'App Issue', 'Cannot login to my app', 'Support', 'NEW', '2026-08-13 08:00:00'),
('Eve Sample', 'eve@sample.com', '1234567890', 'Partnership', 'Interested in B2B partnership', 'Business', 'IN_PROGRESS', '2026-08-11 10:00:00');

-- Insert Notifications using email-based subqueries
INSERT IGNORE INTO notifications (user_id, title, message, is_read, created_at)
SELECT id, 'Payment Received', 'Your EMI payment of 10,746 was successful.', FALSE, '2026-08-01 10:05:00' FROM users WHERE email = 'alice@example.com' LIMIT 1;
INSERT IGNORE INTO notifications (user_id, title, message, is_read, created_at) VALUES
(NULL, 'System Maintenance', 'Downtime scheduled for this weekend.', FALSE, '2026-08-12 18:00:00');

-- Insert Documents using email-based subqueries
INSERT IGNORE INTO documents (user_id, type, file_name, file_url, status, uploaded_at)
SELECT id, 'Identity Proof', 'aadhar_card.pdf', '/uploads/docs/aadhar_1.pdf', 'VERIFIED', '2026-01-10 10:00:00' FROM users WHERE email = 'alice@example.com' LIMIT 1;
INSERT IGNORE INTO documents (user_id, type, file_name, file_url, status, uploaded_at)
SELECT id, 'Income Proof', 'salary_slip.pdf', '/uploads/docs/salary_2.pdf', 'PENDING', '2026-08-10 09:35:00' FROM users WHERE email = 'bob@example.com' LIMIT 1;

-- Insert Activity Logs using email-based subqueries
INSERT IGNORE INTO activity_logs (user_id, action, description, created_at)
SELECT id, 'LOGIN', 'User logged in successfully', '2026-08-13 10:00:00' FROM users WHERE email = 'alice@example.com' LIMIT 1;
INSERT IGNORE INTO activity_logs (user_id, action, description, created_at)
SELECT id, 'VIEW_PORTFOLIO', 'User viewed their investment portfolio', '2026-08-13 10:05:00' FROM users WHERE email = 'alice@example.com' LIMIT 1;
INSERT IGNORE INTO activity_logs (user_id, action, description, created_at)
SELECT id, 'LOAN_APPLICATION', 'Applied for personal loan of 100,000', '2026-08-10 09:30:00' FROM users WHERE email = 'bob@example.com' LIMIT 1;

-- Insert Audit Logs using email-based subqueries
INSERT IGNORE INTO audit_logs (admin_id, action, target_type, target_id, description, ip_address, created_at)
SELECT u.id, 'ADMIN_LOGIN', 'USER', u.id, 'Admin successfully logged in', '192.168.1.100', '2026-08-13 09:00:00' FROM users u WHERE u.email = 'admin@kalpanaafinance.com' LIMIT 1;
INSERT IGNORE INTO audit_logs (admin_id, action, target_type, target_id, description, ip_address, created_at)
SELECT a.id, 'ADMIN_VIEWED_USER_PROFILE', 'USER', c.id, 'Admin viewed user profile', '192.168.1.100', '2026-08-13 09:15:00'
FROM users a, users c WHERE a.email = 'admin@kalpanaafinance.com' AND c.email = 'alice@example.com' LIMIT 1;

-- Insert Services
INSERT IGNORE INTO services (title, description, image_url, features, benefits, cta, category, is_published) VALUES 
('Digital Gold', 'Invest in 24K pure digital gold with ease.', 'gold.jpg', '24K Purity, Secure Storage', 'High liquidity, inflation hedge', 'Invest Now', 'Investment', TRUE),
('Personal Loans', 'Quick and hassle-free personal loans for all your needs.', 'loan.jpg', 'Low Interest, Fast Approval', 'Instant cash, flexible tenure', 'Apply Now', 'Loans', TRUE);
