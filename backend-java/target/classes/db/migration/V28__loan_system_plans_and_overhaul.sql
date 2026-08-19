-- Migration: Loan System Plans, Rates, and Overhaul
-- Creates loan_plans, loan_plan_rates tables, seeds 3 loan plans & duration rates, updates loans, loan_emis, and documents tables.

CREATE TABLE IF NOT EXISTS loan_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    min_amount DECIMAL(14,2) NOT NULL,
    max_amount DECIMAL(14,2) NOT NULL,
    allowed_purposes TEXT NOT NULL,
    requires_business_doc BOOLEAN NOT NULL DEFAULT FALSE,
    requires_property_doc BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loan_plan_rates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plan_id BIGINT NOT NULL,
    duration_months INT NOT NULL,
    annual_interest_rate DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_plan_rates_loan_plan FOREIGN KEY (plan_id) REFERENCES loan_plans(id) ON DELETE CASCADE,
    CONSTRAINT uk_loan_plan_duration UNIQUE (plan_id, duration_months)
);

-- Seed Initial Loan Plans with Exact Specs
INSERT INTO loan_plans (name, min_amount, max_amount, allowed_purposes, requires_business_doc, requires_property_doc, description, is_active) VALUES
('Personal Loan', 10000.00, 500000.00, 'Medical expenses,Travel,Emergency expenses,Personal expenses,Debt consolidation', FALSE, FALSE, 'Quick multi-purpose personal credit with flexible repayment options. Minimal documentation.', TRUE),
('Business Loan', 50000.00, 1000000.00, 'Working capital,Inventory,Equipment,Business expansion', TRUE, FALSE, 'Capital financing tailored for SMEs and business growth. Simple application process.', TRUE),
('Home Loan', 100000.00, 2500000.00, 'Home purchase,Home construction,Home renovation', FALSE, TRUE, 'Long-term property acquisition and home construction/renovation financing. Structured EMI payments.', TRUE)
ON DUPLICATE KEY UPDATE 
    min_amount = VALUES(min_amount),
    max_amount = VALUES(max_amount),
    allowed_purposes = VALUES(allowed_purposes),
    requires_business_doc = VALUES(requires_business_doc),
    requires_property_doc = VALUES(requires_property_doc),
    description = VALUES(description);

-- Seed Duration Rates for Loan Plans
INSERT INTO loan_plan_rates (plan_id, duration_months, annual_interest_rate)
SELECT p.id, d.duration_months, d.annual_interest_rate
FROM loan_plans p
CROSS JOIN (
    -- Personal Loan: 6, 12, 36, 60 months
    SELECT 'Personal Loan' as plan_name, 6 as duration_months, 9.50 as annual_interest_rate UNION ALL
    SELECT 'Personal Loan', 12, 10.50 UNION ALL
    SELECT 'Personal Loan', 36, 11.50 UNION ALL
    SELECT 'Personal Loan', 60, 12.50 UNION ALL

    -- Business Loan: 6, 12, 36, 60 months
    SELECT 'Business Loan', 6, 11.00 UNION ALL
    SELECT 'Business Loan', 12, 12.00 UNION ALL
    SELECT 'Business Loan', 36, 13.00 UNION ALL
    SELECT 'Business Loan', 60, 14.00 UNION ALL

    -- Home Loan: 12, 36, 60, 120 months
    SELECT 'Home Loan', 12, 7.50 UNION ALL
    SELECT 'Home Loan', 36, 8.00 UNION ALL
    SELECT 'Home Loan', 60, 8.50 UNION ALL
    SELECT 'Home Loan', 120, 9.00
) d ON p.name = d.plan_name
ON DUPLICATE KEY UPDATE annual_interest_rate = VALUES(annual_interest_rate);

-- Schema Updates for loans table safely
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'plan_id' AND table_schema = DATABASE());
SET @sql = IF(@col_exists = 0, 'ALTER TABLE loans ADD COLUMN plan_id BIGINT NULL AFTER user_id, ADD COLUMN duration_months INT NOT NULL DEFAULT 12 AFTER tenure_months, ADD COLUMN estimated_emi DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER interest_rate, ADD COLUMN estimated_interest DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER estimated_emi, ADD COLUMN estimated_repayment DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER estimated_interest, ADD COLUMN first_emi_date DATE NULL AFTER estimated_repayment, ADD COLUMN final_emi_date DATE NULL AFTER first_emi_date, ADD COLUMN resubmission_reason TEXT NULL AFTER status, ADD COLUMN resubmitted_at TIMESTAMP NULL AFTER resubmission_reason, ADD COLUMN legacy_unverified BOOLEAN NOT NULL DEFAULT FALSE AFTER completed_at', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Foreign Key for loans -> loan_plans
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_name = 'fk_loans_plan' AND table_name = 'loans' AND table_schema = DATABASE());
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE loans ADD CONSTRAINT fk_loans_plan FOREIGN KEY (plan_id) REFERENCES loan_plans(id) ON DELETE SET NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill legacy loan rows safely
UPDATE loans
SET legacy_unverified = TRUE,
    duration_months = tenure_months
WHERE plan_id IS NULL;

-- Schema Updates for loan_emis table safely
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'loan_emis' AND column_name = 'reminder_sent' AND table_schema = DATABASE());
SET @sql = IF(@col_exists = 0, 'ALTER TABLE loan_emis ADD COLUMN reminder_sent BOOLEAN NOT NULL DEFAULT FALSE AFTER status, ADD COLUMN version INT NOT NULL DEFAULT 1 AFTER reminder_sent', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Schema Updates for documents table safely
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'version' AND table_schema = DATABASE());
SET @sql = IF(@col_exists = 0, 'ALTER TABLE documents ADD COLUMN version INT NOT NULL DEFAULT 1 AFTER verification_status', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create Performance Indexes Safely
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_name = 'loan_emis' AND index_name = 'idx_loan_emis_reminder' AND table_schema = DATABASE());
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_loan_emis_reminder ON loan_emis(due_date, status, reminder_sent)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_name = 'loans' AND index_name = 'idx_loans_status' AND table_schema = DATABASE());
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_loans_status ON loans(user_id, status)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
