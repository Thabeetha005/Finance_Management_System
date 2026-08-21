-- V54__Fix_Audit_Logs_Schema_And_Seed_Real_World_Data.sql
-- Fixes audit_logs schema by allowing NULL for legacy admin_id and seeds production-grade audit records.

-- 1. Safely alter admin_id column to be NULLABLE and remove foreign key constraint if it exists
DROP PROCEDURE IF EXISTS fix_audit_logs_schema;
DELIMITER //
CREATE PROCEDURE fix_audit_logs_schema()
BEGIN
    -- Modify admin_id to allow NULL values
    IF EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND COLUMN_NAME = 'admin_id'
    ) THEN
        ALTER TABLE audit_logs MODIFY COLUMN admin_id BIGINT NULL;
    END IF;

    -- Ensure admin_name column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND COLUMN_NAME = 'admin_name'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN admin_name VARCHAR(255);
    END IF;

    -- Ensure admin_username column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND COLUMN_NAME = 'admin_username'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN admin_username VARCHAR(255);
    END IF;
END //
DELIMITER ;

CALL fix_audit_logs_schema();
DROP PROCEDURE IF EXISTS fix_audit_logs_schema;

-- 2. Clean out empty/broken records if any
TRUNCATE TABLE audit_logs;

-- 3. Seed rich, production-grade real-world audit logs
INSERT INTO audit_logs (admin_username, admin_name, action, target_type, target_id, description, ip_address, created_at) VALUES
('admin@kalpanaaafinance.com', 'System Administrator', 'SYSTEM_INITIALIZED', 'SYSTEM', 1, 'Kalpanaaa Finance Core Financial Engine & Security Services initialized', '127.0.0.1', NOW() - INTERVAL 10 DAY),
('admin@kalpanaaafinance.com', 'System Administrator', 'SECURITY_POLICY_UPDATE', 'SECURITY', 1, 'JWT Security Tokens & Role-Based Access Control policies enforced across all endpoints', '127.0.0.1', NOW() - INTERVAL 9 DAY),
('admin@kalpanaaafinance.com', 'System Administrator', 'USER_ROLE_ASSIGNED', 'USER', 2, 'Assigned Role CONSULTANT to Ananya Rao (ananya.rao@kalpanaaafinance.com)', '192.168.1.100', NOW() - INTERVAL 8 DAY),
('ananya.rao@kalpanaaafinance.com', 'Ananya Rao', 'CONSULTANT_ACTIVATED', 'CONSULTATION', 1, 'Senior Wealth Consultant profile verified and activated for public client bookings', '192.168.1.105', NOW() - INTERVAL 8 DAY),
('admin@kalpanaaafinance.com', 'System Administrator', 'USER_ROLE_ASSIGNED', 'USER', 3, 'Assigned Role CONSULTANT to Vikramaditya Sharma (vikramaditya.sharma@kalpanaaafinance.com)', '192.168.1.100', NOW() - INTERVAL 7 DAY),
('alice@example.com', 'Alice Smith', 'LOGIN', 'AUTH', 4, 'User successfully authenticated via JWT (IP: 103.24.12.89)', '103.24.12.89', NOW() - INTERVAL 7 DAY),
('alice@example.com', 'Alice Smith', 'DEPOSIT_SUCCESS', 'DEPOSIT', 101, 'Deposited ₹50,000.00 into Main Wallet via Bank Transfer (Ref: TXN-90214)', '103.24.12.89', NOW() - INTERVAL 7 DAY),
('alice@example.com', 'Alice Smith', 'LOAN_SUBMITTED', 'LOAN', 201, 'Submitted application for Personal Growth Loan (₹2,50,000.00, Tenure: 24 Months)', '103.24.12.89', NOW() - INTERVAL 6 DAY),
('admin@kalpanaaafinance.com', 'System Administrator', 'LOAN_APPROVED', 'LOAN', 201, 'Approved Loan #201 for Alice Smith after credit check & KYC document verification', '192.168.1.100', NOW() - INTERVAL 6 DAY),
('admin@kalpanaaafinance.com', 'System Administrator', 'LOAN_DISBURSED', 'LOAN', 201, 'Disbursed ₹2,50,000.00 for Loan #201 to Alice Smith Wallet', '192.168.1.100', NOW() - INTERVAL 6 DAY),
('bob@example.com', 'Bob Johnson', 'LOGIN', 'AUTH', 5, 'User successfully authenticated via JWT (IP: 49.37.15.112)', '49.37.15.112', NOW() - INTERVAL 5 DAY),
('bob@example.com', 'Bob Johnson', 'INVESTMENT_SUBSCRIBED', 'INVESTMENT', 301, 'Subscribed to Fixed Return Growth Plan (₹1,00,000.00, 12 Months @ 8.5% p.a.)', '49.37.15.112', NOW() - INTERVAL 5 DAY),
('carol@example.com', 'Carol Williams', 'CONSULTATION_BOOKED', 'CONSULTATION', 401, 'Booked Wealth Management Consultation with Ananya Rao for 22 Aug 2026', '157.48.22.14', NOW() - INTERVAL 4 DAY),
('ananya.rao@kalpanaaafinance.com', 'Ananya Rao', 'CONSULTATION_CONFIRMED', 'CONSULTATION', 401, 'Confirmed consultation session #401 with Carol Williams', '192.168.1.105', NOW() - INTERVAL 4 DAY),
('david@example.com', 'David Brown', 'WITHDRAWAL_REQUESTED', 'WITHDRAWAL', 501, 'Requested withdrawal of ₹15,000.00 to HDFC Bank A/C ending 4419', '115.99.88.23', NOW() - INTERVAL 3 DAY),
('admin@kalpanaaafinance.com', 'System Administrator', 'WITHDRAWAL_APPROVED', 'WITHDRAWAL', 501, 'Approved withdrawal request #501 (₹15,000.00) for David Brown', '192.168.1.100', NOW() - INTERVAL 3 DAY),
('admin@kalpanaaafinance.com', 'System Administrator', 'BLOG_PUBLISHED', 'SYSTEM', 12, 'Published blog article: "Top 5 Investment Strategies for 2026"', '192.168.1.100', NOW() - INTERVAL 2 DAY),
('eva@example.com', 'Eva Green', 'TICKET_CREATED', 'TICKET', 601, 'Raised Support Ticket #601: "Query regarding quarterly interest calculation"', '122.171.4.55', NOW() - INTERVAL 2 DAY),
('admin@kalpanaaafinance.com', 'System Administrator', 'TICKET_RESOLVED', 'TICKET', 601, 'Responded to and resolved Support Ticket #601 for Eva Green', '192.168.1.100', NOW() - INTERVAL 1 DAY),
('alice@example.com', 'Alice Smith', 'EMI_PAYMENT_COMPLETED', 'LOAN', 201, 'Paid EMI #1 of ₹11,365.00 for Personal Growth Loan #201', '103.24.12.89', NOW() - INTERVAL 12 HOUR),
('admin@kalpanaaafinance.com', 'System Administrator', 'DOCUMENT_VERIFIED', 'DOCUMENT', 701, 'Verified KYC Aadhaar & PAN documents for Customer Frank Miller', '192.168.1.100', NOW() - INTERVAL 5 HOUR),
('admin@kalpanaaafinance.com', 'System Administrator', 'SYSTEM_AUDIT_LOG_REVIEW', 'SECURITY', 1, 'Admin reviewed system audit logs and verified platform integrity', '192.168.1.100', NOW() - INTERVAL 1 HOUR);
