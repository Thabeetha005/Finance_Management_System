-- Flyway migration V44: Add missing bonus_balance and deposit_balance columns to users table
ALTER TABLE users ADD COLUMN bonus_balance DECIMAL(19, 2) NOT NULL DEFAULT 100000.00;
ALTER TABLE users ADD COLUMN deposit_balance DECIMAL(19, 2) NOT NULL DEFAULT 0.00;
