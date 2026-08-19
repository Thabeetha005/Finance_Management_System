-- V30: Add user_id, status, and composite indexes to transactions table for Wallet System

ALTER TABLE transactions 
MODIFY COLUMN account_id BIGINT NULL,
ADD COLUMN user_id BIGINT NULL,
ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED';

-- Backfill user_id from account_id for existing records
UPDATE transactions t 
JOIN accounts a ON t.account_id = a.id 
SET t.user_id = a.user_id 
WHERE t.user_id IS NULL;

-- Add Foreign Key constraint for user_id
ALTER TABLE transactions
ADD CONSTRAINT fk_tx_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Section 5 Indexing Requirement: Composite indexes to support backend filtered queries
CREATE INDEX idx_tx_user_date ON transactions (user_id, date);
CREATE INDEX idx_tx_user_type ON transactions (user_id, type);
CREATE INDEX idx_tx_user_status ON transactions (user_id, status);
