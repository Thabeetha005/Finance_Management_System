-- V10__Seed_5_Mock_Clients_And_Wallet.sql

-- 1. Create wallet_history table for the Financial Analytics chart
CREATE TABLE IF NOT EXISTS wallet_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    record_date DATE NOT NULL,
    total_value DECIMAL(14,2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Create investment_plans table
CREATE TABLE IF NOT EXISTS investment_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    annual_return_rate DECIMAL(5,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed exactly 6 investment categories
INSERT IGNORE INTO investment_plans (name, annual_return_rate, description) VALUES 
('Mutual Funds', 12.00, 'Invest in professionally managed funds and grow your wealth.'),
('Fixed Deposits', 7.00, 'Earn guaranteed returns with flexible tenure.'),
('Bonds', 8.00, 'Invest in government & corporate bonds.'),
('Equity', 15.00, 'Invest in stocks and build long-term wealth.'),
('SIP Plans', 12.00, 'Start small, grow big with SIPs.'),
('Gold Funds', 9.00, 'Invest in gold and hedge against inflation.');

-- 3. Update balances and data using email-based lookups (no hardcoded user IDs)

-- Alice: Invests 30k Equity + 20k Gold = 50,000 cash balance
UPDATE users SET balance = 50000.00 WHERE email = 'alice@example.com';
UPDATE accounts SET balance = 50000.00 WHERE user_id = (SELECT id FROM users WHERE email = 'alice@example.com' LIMIT 1);

-- Bob: Invests 60k Mutual Funds + 20k SIP = 20,000 cash balance
UPDATE users SET balance = 20000.00 WHERE email = 'bob@example.com';
UPDATE accounts SET balance = 20000.00 WHERE user_id = (SELECT id FROM users WHERE email = 'bob@example.com' LIMIT 1);

-- Charlie: Invests 10k Bonds = 90,000 cash balance
UPDATE users SET balance = 90000.00 WHERE email = 'charlie@example.com';
UPDATE accounts SET balance = 90000.00 WHERE user_id = (SELECT id FROM users WHERE email = 'charlie@example.com' LIMIT 1);

-- Insert 1 Lakh Bonus Transactions using email lookup
INSERT IGNORE INTO transactions (account_id, amount, type, date, description)
SELECT a.id, 100000.00, 'DEPOSIT', NOW() - INTERVAL 180 DAY, 'Welcome Bonus - 1 Lakh'
FROM accounts a JOIN users u ON a.user_id = u.id
WHERE u.email IN ('alice@example.com', 'bob@example.com', 'charlie@example.com');

-- 5. Seed New Mock Investments using email lookup

-- Alice
INSERT IGNORE INTO investments (user_id, type, invested_amount, current_value, status, created_at)
SELECT id, 'Equity', 30000.00, 38000.00, 'ACTIVE', NOW() - INTERVAL 120 DAY FROM users WHERE email = 'alice@example.com' LIMIT 1;

INSERT IGNORE INTO investments (user_id, type, invested_amount, current_value, status, created_at)
SELECT id, 'Gold Funds', 20000.00, 21500.00, 'ACTIVE', NOW() - INTERVAL 90 DAY FROM users WHERE email = 'alice@example.com' LIMIT 1;

-- Bob
INSERT IGNORE INTO investments (user_id, type, invested_amount, current_value, status, created_at)
SELECT id, 'Mutual Funds', 60000.00, 64000.00, 'ACTIVE', NOW() - INTERVAL 150 DAY FROM users WHERE email = 'bob@example.com' LIMIT 1;

INSERT IGNORE INTO investments (user_id, type, invested_amount, current_value, status, created_at)
SELECT id, 'SIP Plans', 20000.00, 20500.00, 'ACTIVE', NOW() - INTERVAL 30 DAY FROM users WHERE email = 'bob@example.com' LIMIT 1;

-- Charlie
INSERT IGNORE INTO investments (user_id, type, invested_amount, current_value, status, created_at)
SELECT id, 'Bonds', 10000.00, 10400.00, 'ACTIVE', NOW() - INTERVAL 160 DAY FROM users WHERE email = 'charlie@example.com' LIMIT 1;

-- 6. Seed Wallet History using email lookup

-- Alice
INSERT IGNORE INTO wallet_history (user_id, record_date, total_value)
SELECT id, NOW() - INTERVAL 150 DAY, 100000.00 FROM users WHERE email = 'alice@example.com' LIMIT 1;
INSERT IGNORE INTO wallet_history (user_id, record_date, total_value)
SELECT id, NOW() - INTERVAL 120 DAY, 101500.00 FROM users WHERE email = 'alice@example.com' LIMIT 1;
INSERT IGNORE INTO wallet_history (user_id, record_date, total_value)
SELECT id, NOW() - INTERVAL 90 DAY, 103200.00 FROM users WHERE email = 'alice@example.com' LIMIT 1;
INSERT IGNORE INTO wallet_history (user_id, record_date, total_value)
SELECT id, NOW() - INTERVAL 60 DAY, 105800.00 FROM users WHERE email = 'alice@example.com' LIMIT 1;
INSERT IGNORE INTO wallet_history (user_id, record_date, total_value)
SELECT id, NOW() - INTERVAL 30 DAY, 108400.00 FROM users WHERE email = 'alice@example.com' LIMIT 1;
INSERT IGNORE INTO wallet_history (user_id, record_date, total_value)
SELECT id, NOW(), 109500.00 FROM users WHERE email = 'alice@example.com' LIMIT 1;

-- Bob
INSERT IGNORE INTO wallet_history (user_id, record_date, total_value)
SELECT id, NOW() - INTERVAL 150 DAY, 100000.00 FROM users WHERE email = 'bob@example.com' LIMIT 1;
INSERT IGNORE INTO wallet_history (user_id, record_date, total_value)
SELECT id, NOW() - INTERVAL 120 DAY, 100800.00 FROM users WHERE email = 'bob@example.com' LIMIT 1;
INSERT IGNORE INTO wallet_history (user_id, record_date, total_value)
SELECT id, NOW() - INTERVAL 90 DAY, 101900.00 FROM users WHERE email = 'bob@example.com' LIMIT 1;
INSERT IGNORE INTO wallet_history (user_id, record_date, total_value)
SELECT id, NOW() - INTERVAL 60 DAY, 103100.00 FROM users WHERE email = 'bob@example.com' LIMIT 1;
INSERT IGNORE INTO wallet_history (user_id, record_date, total_value)
SELECT id, NOW() - INTERVAL 30 DAY, 103800.00 FROM users WHERE email = 'bob@example.com' LIMIT 1;
INSERT IGNORE INTO wallet_history (user_id, record_date, total_value)
SELECT id, NOW(), 104500.00 FROM users WHERE email = 'bob@example.com' LIMIT 1;

-- Charlie
INSERT IGNORE INTO wallet_history (user_id, record_date, total_value)
SELECT id, NOW() - INTERVAL 150 DAY, 100000.00 FROM users WHERE email = 'charlie@example.com' LIMIT 1;
INSERT IGNORE INTO wallet_history (user_id, record_date, total_value)
SELECT id, NOW() - INTERVAL 120 DAY, 100100.00 FROM users WHERE email = 'charlie@example.com' LIMIT 1;
INSERT IGNORE INTO wallet_history (user_id, record_date, total_value)
SELECT id, NOW() - INTERVAL 90 DAY, 100200.00 FROM users WHERE email = 'charlie@example.com' LIMIT 1;
INSERT IGNORE INTO wallet_history (user_id, record_date, total_value)
SELECT id, NOW() - INTERVAL 60 DAY, 100300.00 FROM users WHERE email = 'charlie@example.com' LIMIT 1;
INSERT IGNORE INTO wallet_history (user_id, record_date, total_value)
SELECT id, NOW() - INTERVAL 30 DAY, 100350.00 FROM users WHERE email = 'charlie@example.com' LIMIT 1;
INSERT IGNORE INTO wallet_history (user_id, record_date, total_value)
SELECT id, NOW(), 100400.00 FROM users WHERE email = 'charlie@example.com' LIMIT 1;
