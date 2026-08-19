-- V13: Seed 10 mock customers to match the design screenshot
INSERT INTO users (name, email, password_hash, role, phone, account_status, is_verified, created_at, updated_at, balance)
VALUES 
('Rahul Sharma', 'rahul@gmail.com', 'password', 'CUSTOMER', '9876543210', 'Active', TRUE, '2026-08-10 10:00:00', NOW(), 5000),
('Priya Mehta', 'priya@gmail.com', 'password', 'CUSTOMER', '9123456780', 'Active', TRUE, '2026-08-08 14:30:00', NOW(), 12500),
('Amit Verma', 'amit@gmail.com', 'password', 'CUSTOMER', '9988776655', 'Active', TRUE, '2026-08-05 09:15:00', NOW(), 0),
('Neha Kapoor', 'neha@gmail.com', 'password', 'CUSTOMER', '8899001122', 'Inactive', FALSE, '2026-08-03 16:45:00', NOW(), 100),
('Vikash Singh', 'vikash@gmail.com', 'password', 'CUSTOMER', '7766554433', 'Active', FALSE, '2026-08-01 11:20:00', NOW(), 3000),
('Anjali Patel', 'anjali@gmail.com', 'password', 'CUSTOMER', '6655443322', 'Active', TRUE, '2026-07-31 10:05:00', NOW(), 450),
('Mohit Jain', 'mohit@gmail.com', 'password', 'CUSTOMER', '5544332211', 'Active', TRUE, '2026-07-28 12:40:00', NOW(), 0),
('Rina Das', 'rina@gmail.com', 'password', 'CUSTOMER', '4433221100', 'Active', TRUE, '2026-07-25 15:55:00', NOW(), 15000),
('Karan Malhotra', 'karan@gmail.com', 'password', 'CUSTOMER', '9988112233', 'Suspended', FALSE, '2026-07-20 08:30:00', NOW(), 0),
('Sneha Reddy', 'sneha@gmail.com', 'password', 'CUSTOMER', '7766889900', 'Active', TRUE, '2026-07-15 17:10:00', NOW(), 8200);
