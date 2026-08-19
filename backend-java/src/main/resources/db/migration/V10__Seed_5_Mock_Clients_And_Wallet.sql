-- V10__Seed_5_Mock_Clients_And_Wallet.sql

-- 1. Create wallet_history table for the Financial Analytics chart
CREATE TABLE wallet_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    record_date DATE NOT NULL,
    total_value DECIMAL(14,2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Create investment_plans table
CREATE TABLE investment_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    annual_return_rate DECIMAL(5,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed exactly 6 investment categories
INSERT INTO investment_plans (name, annual_return_rate, description) VALUES 
('Mutual Funds', 12.00, 'Invest in professionally managed funds and grow your wealth.'),
('Fixed Deposits', 7.00, 'Earn guaranteed returns with flexible tenure.'),
('Bonds', 8.00, 'Invest in government & corporate bonds.'),
('Equity', 15.00, 'Invest in stocks and build long-term wealth.'),
('SIP Plans', 12.00, 'Start small, grow big with SIPs.'),
('Gold Funds', 9.00, 'Invest in gold and hedge against inflation.');

-- 3. Clear old mock data for users 1, 2, 3, 5, 6
DELETE FROM wallet_history WHERE user_id IN (1, 2, 3, 5, 6);
DELETE FROM investments WHERE user_id IN (1, 2, 3, 5, 6);
DELETE FROM transactions WHERE account_id IN (SELECT id FROM accounts WHERE user_id IN (1, 2, 3, 5, 6));

-- 4. Reset balances and inject 1 Lakh bonus transaction
-- Note: 'balance' in users/accounts now reflects the 100,000 bonus minus whatever is invested.

-- Client 1 (Alice): 1,00,000 Bonus -> Invests 30,000 (Equity), 20,000 (Gold) = 50,000 cash balance
UPDATE users SET balance = 50000.00 WHERE id = 1;
UPDATE accounts SET balance = 50000.00 WHERE user_id = 1;

-- Client 2 (Bob): 1,00,000 Bonus -> Invests 60,000 (Mutual Funds), 20,000 (SIP) = 20,000 cash balance
UPDATE users SET balance = 20000.00 WHERE id = 2;
UPDATE accounts SET balance = 20000.00 WHERE user_id = 2;

-- Client 3 (Charlie): 1,00,000 Bonus -> Invests 10,000 (Bonds) = 90,000 cash balance
UPDATE users SET balance = 90000.00 WHERE id = 3;
UPDATE accounts SET balance = 90000.00 WHERE user_id = 3;

-- Client 5 (David): 1,00,000 Bonus -> Invests 50,000 (Fixed Deposits), 40,000 (Mutual Funds) = 10,000 cash balance
UPDATE users SET balance = 10000.00 WHERE id = 5;
UPDATE accounts SET balance = 10000.00 WHERE user_id = 5;

-- Client 6 (Eve): 1,00,000 Bonus -> Invests 80,000 (Equity) = 20,000 cash balance
UPDATE users SET balance = 20000.00 WHERE id = 6;
UPDATE accounts SET balance = 20000.00 WHERE user_id = 6;


-- Insert 1 Lakh Bonus Transactions
INSERT INTO transactions (account_id, amount, type, date, description) 
SELECT id, 100000.00, 'DEPOSIT', NOW() - INTERVAL 180 DAY, 'Welcome Bonus - 1 Lakh' 
FROM accounts WHERE user_id IN (1, 2, 3, 5, 6);


-- 5. Seed New Mock Investments 
-- Alice
INSERT INTO investments (user_id, type, invested_amount, current_value, status, created_at) VALUES 
(1, 'Equity', 30000.00, 38000.00, 'ACTIVE', NOW() - INTERVAL 120 DAY),
(1, 'Gold Funds', 20000.00, 21500.00, 'ACTIVE', NOW() - INTERVAL 90 DAY);

-- Bob
INSERT INTO investments (user_id, type, invested_amount, current_value, status, created_at) VALUES 
(2, 'Mutual Funds', 60000.00, 64000.00, 'ACTIVE', NOW() - INTERVAL 150 DAY),
(2, 'SIP Plans', 20000.00, 20500.00, 'ACTIVE', NOW() - INTERVAL 30 DAY);

-- Charlie
INSERT INTO investments (user_id, type, invested_amount, current_value, status, created_at) VALUES 
(3, 'Bonds', 10000.00, 10400.00, 'ACTIVE', NOW() - INTERVAL 160 DAY);

-- David
INSERT INTO investments (user_id, type, invested_amount, current_value, status, created_at) VALUES 
(5, 'Fixed Deposits', 50000.00, 51500.00, 'ACTIVE', NOW() - INTERVAL 100 DAY),
(5, 'Mutual Funds', 40000.00, 48000.00, 'ACTIVE', NOW() - INTERVAL 170 DAY);

-- Eve
INSERT INTO investments (user_id, type, invested_amount, current_value, status, created_at) VALUES 
(6, 'Equity', 80000.00, 95000.00, 'ACTIVE', NOW() - INTERVAL 180 DAY);


-- 6. Seed Wallet History (Monthly snapshots showing gradual growth from 1 Lakh)
-- Alice
INSERT INTO wallet_history (user_id, record_date, total_value) VALUES 
(1, NOW() - INTERVAL 150 DAY, 100000.00),
(1, NOW() - INTERVAL 120 DAY, 101500.00),
(1, NOW() - INTERVAL 90 DAY, 103200.00),
(1, NOW() - INTERVAL 60 DAY, 105800.00),
(1, NOW() - INTERVAL 30 DAY, 108400.00),
(1, NOW(), 109500.00);

-- Bob
INSERT INTO wallet_history (user_id, record_date, total_value) VALUES 
(2, NOW() - INTERVAL 150 DAY, 100000.00),
(2, NOW() - INTERVAL 120 DAY, 100800.00),
(2, NOW() - INTERVAL 90 DAY, 101900.00),
(2, NOW() - INTERVAL 60 DAY, 103100.00),
(2, NOW() - INTERVAL 30 DAY, 103800.00),
(2, NOW(), 104500.00);

-- Charlie
INSERT INTO wallet_history (user_id, record_date, total_value) VALUES 
(3, NOW() - INTERVAL 150 DAY, 100000.00),
(3, NOW() - INTERVAL 120 DAY, 100100.00),
(3, NOW() - INTERVAL 90 DAY, 100200.00),
(3, NOW() - INTERVAL 60 DAY, 100300.00),
(3, NOW() - INTERVAL 30 DAY, 100350.00),
(3, NOW(), 100400.00);

-- David
INSERT INTO wallet_history (user_id, record_date, total_value) VALUES 
(5, NOW() - INTERVAL 150 DAY, 100000.00),
(5, NOW() - INTERVAL 120 DAY, 102000.00),
(5, NOW() - INTERVAL 90 DAY, 104500.00),
(5, NOW() - INTERVAL 60 DAY, 106800.00),
(5, NOW() - INTERVAL 30 DAY, 108200.00),
(5, NOW(), 109500.00);

-- Eve
INSERT INTO wallet_history (user_id, record_date, total_value) VALUES 
(6, NOW() - INTERVAL 150 DAY, 100000.00),
(6, NOW() - INTERVAL 120 DAY, 103000.00),
(6, NOW() - INTERVAL 90 DAY, 106500.00),
(6, NOW() - INTERVAL 60 DAY, 109800.00),
(6, NOW() - INTERVAL 30 DAY, 112400.00),
(6, NOW(), 115000.00);

