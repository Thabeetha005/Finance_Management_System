-- V31: Bank Accounts & Wallet Withdrawals System

ALTER TABLE notifications 
ADD COLUMN title VARCHAR(255) NULL,
ADD COLUMN type VARCHAR(50) NULL;

CREATE TABLE IF NOT EXISTS bank_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    verified_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bank_accounts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS withdrawals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    bank_account_id BIGINT NOT NULL,
    
    -- Bank Account Snapshot (captured at request time)
    account_holder_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_number_masked VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    
    amount DECIMAL(14,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, PROCESSING, COMPLETED, REJECTED
    
    balance_before DECIMAL(14,2) NULL,
    balance_after DECIMAL(14,2) NULL,
    
    reference_number VARCHAR(100) NOT NULL UNIQUE,
    rejection_reason VARCHAR(500) NULL,
    admin_id BIGINT NULL,
    
    requested_at DATETIME NOT NULL,
    approved_at DATETIME NULL,
    processed_at DATETIME NULL,
    completed_at DATETIME NULL,
    rejected_at DATETIME NULL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_withdrawals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_withdrawals_bank_account FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id),
    CONSTRAINT fk_withdrawals_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Section 21 Indexing Requirement: Efficient eligibility and daily limit queries
CREATE INDEX idx_withdrawals_user_status ON withdrawals (user_id, status);
CREATE INDEX idx_withdrawals_user_created ON withdrawals (user_id, created_at);

-- Seed default verified bank account for existing active customer users
INSERT INTO bank_accounts (user_id, account_holder_name, bank_name, account_number, ifsc_code, is_verified, verified_at)
SELECT u.id, u.name, 'HDFC Bank', '987654321012', 'HDFC0001234', TRUE, NOW()
FROM users u
WHERE u.role = 'CUSTOMER' AND u.is_verified = TRUE
AND NOT EXISTS (SELECT 1 FROM bank_accounts ba WHERE ba.user_id = u.id);
