-- V7: Seed mock users and transactions using INSERT IGNORE to avoid duplicate key failures
INSERT IGNORE INTO users (name, email, password_hash, role, balance, created_at, updated_at) VALUES 
('Alice Smith', 'alice@example.com', '$2a$10$93dk.v7w4VmpwShh8JtldeEpzKBWJ6UDZNcSOi7ScNBaY8BzaYwlS', 'CUSTOMER', 15000.00, NOW(), NOW()),
('Bob Jones', 'bob@example.com', '$2a$10$93dk.v7w4VmpwShh8JtldeEpzKBWJ6UDZNcSOi7ScNBaY8BzaYwlS', 'CUSTOMER', 2450.50, NOW(), NOW()),
('Charlie Brown', 'charlie@example.com', '$2a$10$93dk.v7w4VmpwShh8JtldeEpzKBWJ6UDZNcSOi7ScNBaY8BzaYwlS', 'CUSTOMER', 10200.75, NOW(), NOW()),
('Admin User', 'admin@kalpanaaafinance.com', '$2a$10$93dk.v7w4VmpwShh8JtldeEpzKBWJ6UDZNcSOi7ScNBaY8BzaYwlS', 'ADMIN', 0.00, NOW(), NOW());

-- Seed accounts using subqueries keyed by email
INSERT IGNORE INTO accounts (user_id, name, balance, type) 
SELECT id, 'Alice Savings', 15000.00, 'SAVINGS' FROM users WHERE email = 'alice@example.com' LIMIT 1;

INSERT IGNORE INTO accounts (user_id, name, balance, type) 
SELECT id, 'Bob Checking', 2450.50, 'CHECKING' FROM users WHERE email = 'bob@example.com' LIMIT 1;

INSERT IGNORE INTO accounts (user_id, name, balance, type) 
SELECT id, 'Charlie Savings', 10200.75, 'SAVINGS' FROM users WHERE email = 'charlie@example.com' LIMIT 1;

-- Seed transactions using subqueries keyed by account name
INSERT IGNORE INTO transactions (account_id, amount, type, date, description)
SELECT id, 5000.00, 'DEPOSIT', NOW() - INTERVAL 5 DAY, 'Initial Deposit' FROM accounts WHERE name = 'Alice Savings' LIMIT 1;

INSERT IGNORE INTO transactions (account_id, amount, type, date, description)
SELECT id, 1000.00, 'WITHDRAWAL', NOW() - INTERVAL 2 DAY, 'ATM Withdrawal' FROM accounts WHERE name = 'Alice Savings' LIMIT 1;

INSERT IGNORE INTO transactions (account_id, amount, type, date, description)
SELECT id, 2500.00, 'DEPOSIT', NOW() - INTERVAL 10 DAY, 'Salary Credit' FROM accounts WHERE name = 'Bob Checking' LIMIT 1;

INSERT IGNORE INTO transactions (account_id, amount, type, date, description)
SELECT id, 49.50, 'WITHDRAWAL', NOW() - INTERVAL 1 DAY, 'Monthly Maintenance' FROM accounts WHERE name = 'Bob Checking' LIMIT 1;

INSERT IGNORE INTO transactions (account_id, amount, type, date, description)
SELECT id, 10000.00, 'DEPOSIT', NOW() - INTERVAL 3 DAY, 'Transfer from external' FROM accounts WHERE name = 'Charlie Savings' LIMIT 1;

INSERT IGNORE INTO transactions (account_id, amount, type, date, description)
SELECT id, 200.75, 'DEPOSIT', NOW(), 'Interest Credit' FROM accounts WHERE name = 'Charlie Savings' LIMIT 1;
