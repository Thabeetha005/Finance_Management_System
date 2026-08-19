-- Migration: Investment Plans and Rates Overhaul
-- Creates investment_plans, investment_plan_rates tables, seeds demo plans & rates, and updates investments table.

CREATE TABLE IF NOT EXISTS investment_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Make legacy annual_return_rate column NULLABLE if present
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'investment_plans' AND column_name = 'annual_return_rate' AND table_schema = DATABASE());
SET @sql = IF(@col_exists > 0, 'ALTER TABLE investment_plans MODIFY COLUMN annual_return_rate DECIMAL(5,2) NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure investment_plans has all required overhaul columns safely
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'investment_plans' AND column_name = 'is_variable' AND table_schema = DATABASE());
SET @sql = IF(@col_exists = 0, 'ALTER TABLE investment_plans ADD COLUMN is_variable BOOLEAN NOT NULL DEFAULT FALSE, ADD COLUMN variable_rate DECIMAL(5,2) DEFAULT NULL, ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE, ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS investment_plan_rates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plan_id BIGINT NOT NULL,
    duration_months INT NOT NULL,
    return_rate DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_plan_rates_plan FOREIGN KEY (plan_id) REFERENCES investment_plans(id) ON DELETE CASCADE,
    CONSTRAINT uk_plan_duration UNIQUE (plan_id, duration_months)
);

-- Seed Initial Investment Plans
INSERT INTO investment_plans (name, description, is_variable, variable_rate, is_active) VALUES
('Mutual Funds', 'Diversified portfolios managed by professional fund managers for steady capital growth. Demo rates only.', FALSE, NULL, TRUE),
('Fixed Deposit', 'Guaranteed return term deposits backed by institutional financial security. Demo rates only.', FALSE, NULL, TRUE),
('Bonds', 'Fixed-income government and corporate debt securities providing reliable income. Demo rates only.', FALSE, NULL, TRUE),
('Equity', 'Direct market equity growth opportunities with admin-configured variable return rates. Demo rates only.', TRUE, 12.50, TRUE),
('SIP Plans', 'Systematic Investment Plans for disciplined monthly compounding. Demo rates only.', FALSE, NULL, TRUE),
('Gold Funds', 'Precious metal asset backed investment funds tracking physical gold prices. Demo rates only.', TRUE, 10.00, TRUE)
ON DUPLICATE KEY UPDATE 
    description = VALUES(description),
    is_variable = VALUES(is_variable),
    variable_rate = VALUES(variable_rate),
    is_active = VALUES(is_active);

-- Seed Duration Rates for Fixed Rate Plans
INSERT INTO investment_plan_rates (plan_id, duration_months, return_rate)
SELECT p.id, d.duration_months, d.return_rate
FROM investment_plans p
CROSS JOIN (
    SELECT 'Mutual Funds' as plan_name, 6 as duration_months, 4.00 as return_rate UNION ALL
    SELECT 'Mutual Funds', 12, 8.00 UNION ALL
    SELECT 'Mutual Funds', 36, 25.00 UNION ALL
    SELECT 'Mutual Funds', 60, 45.00 UNION ALL
    
    SELECT 'Fixed Deposit', 6, 3.50 UNION ALL
    SELECT 'Fixed Deposit', 12, 7.00 UNION ALL
    SELECT 'Fixed Deposit', 36, 22.00 UNION ALL
    SELECT 'Fixed Deposit', 60, 40.00 UNION ALL
    
    SELECT 'Bonds', 6, 3.00 UNION ALL
    SELECT 'Bonds', 12, 6.50 UNION ALL
    SELECT 'Bonds', 36, 20.00 UNION ALL
    SELECT 'Bonds', 60, 38.00 UNION ALL

    SELECT 'SIP Plans', 6, 4.50 UNION ALL
    SELECT 'SIP Plans', 12, 9.00 UNION ALL
    SELECT 'SIP Plans', 36, 28.00 UNION ALL
    SELECT 'SIP Plans', 60, 50.00
) d ON p.name = d.plan_name
ON DUPLICATE KEY UPDATE return_rate = VALUES(return_rate);

-- Schema Update for investments table safely
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'duration_months' AND table_schema = DATABASE());
SET @sql = IF(@col_exists = 0, 'ALTER TABLE investments ADD COLUMN plan_id BIGINT NULL AFTER user_id, ADD COLUMN duration_months INT NOT NULL DEFAULT 0 AFTER type, ADD COLUMN locked_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER invested_amount, ADD COLUMN estimated_profit DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER locked_rate, ADD COLUMN maturity_value DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER estimated_profit, ADD COLUMN start_date TIMESTAMP NULL AFTER maturity_value, ADD COLUMN maturity_date TIMESTAMP NULL AFTER start_date, ADD COLUMN redeemed_at TIMESTAMP NULL AFTER maturity_date, ADD COLUMN legacy_unverified BOOLEAN NOT NULL DEFAULT FALSE AFTER redeemed_at', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Safe Foreign Key Addition
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_name = 'fk_investments_plan' AND table_name = 'investments' AND table_schema = DATABASE());
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE investments ADD CONSTRAINT fk_investments_plan FOREIGN KEY (plan_id) REFERENCES investment_plans(id) ON DELETE SET NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Safe Backfill for existing legacy rows
UPDATE investments
SET legacy_unverified = TRUE,
    maturity_value = current_value,
    start_date = created_at
WHERE plan_id IS NULL AND duration_months = 0;

-- Create Performance Indexes Safely
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_name = 'investments' AND index_name = 'idx_investments_maturity_date' AND table_schema = DATABASE());
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_investments_maturity_date ON investments(maturity_date)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_name = 'investments' AND index_name = 'idx_investments_status' AND table_schema = DATABASE());
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_investments_status ON investments(status)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_name = 'investments' AND index_name = 'idx_investments_user_status' AND table_schema = DATABASE());
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_investments_user_status ON investments(user_id, status)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_name = 'investments' AND index_name = 'idx_investments_legacy' AND table_schema = DATABASE());
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_investments_legacy ON investments(legacy_unverified)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
