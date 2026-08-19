INSERT INTO users (name, email, password_hash, role, balance, created_at, updated_at) VALUES 
('Alice Smith', 'alice@example.com', '$2a$10$93dk.v7w4VmpwShh8JtldeEpzKBWJ6UDZNcSOi7ScNBaY8BzaYwlS', 'CUSTOMER', 15000.00, NOW(), NOW()),
('Bob Jones', 'bob@example.com', '$2a$10$93dk.v7w4VmpwShh8JtldeEpzKBWJ6UDZNcSOi7ScNBaY8BzaYwlS', 'CUSTOMER', 2450.50, NOW(), NOW()),
('Charlie Brown', 'charlie@example.com', '$2a$10$93dk.v7w4VmpwShh8JtldeEpzKBWJ6UDZNcSOi7ScNBaY8BzaYwlS', 'CUSTOMER', 10200.75, NOW(), NOW()),
('Admin User', 'admin@kalpanaafinance.com', '$2a$10$93dk.v7w4VmpwShh8JtldeEpzKBWJ6UDZNcSOi7ScNBaY8BzaYwlS', 'ADMIN', 0.00, NOW(), NOW());

INSERT INTO accounts (user_id, name, balance, type) VALUES 
(1, 'Alice Savings', 15000.00, 'SAVINGS'),
(2, 'Bob Checking', 2450.50, 'CHECKING'),
(3, 'Charlie Savings', 10200.75, 'SAVINGS');

INSERT INTO transactions (account_id, amount, type, date, description) VALUES 
(1, 5000.00, 'DEPOSIT', NOW() - INTERVAL 5 DAY, 'Initial Deposit'),
(1, 1000.00, 'WITHDRAWAL', NOW() - INTERVAL 2 DAY, 'ATM Withdrawal'),
(2, 2500.00, 'DEPOSIT', NOW() - INTERVAL 10 DAY, 'Salary Credit'),
(2, 49.50, 'WITHDRAWAL', NOW() - INTERVAL 1 DAY, 'Monthly Maintenance'),
(3, 10000.00, 'DEPOSIT', NOW() - INTERVAL 3 DAY, 'Transfer from external'),
(3, 200.75, 'DEPOSIT', NOW(), 'Interest Credit');
