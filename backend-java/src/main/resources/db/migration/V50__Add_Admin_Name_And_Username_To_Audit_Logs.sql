-- V50__Add_Admin_Name_And_Username_To_Audit_Logs.sql
-- Uses safe conditional column addition via stored procedures to avoid IF NOT EXISTS compatibility issues.

DROP PROCEDURE IF EXISTS add_col_admin_name;
CREATE PROCEDURE add_col_admin_name()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND COLUMN_NAME = 'admin_name'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN admin_name VARCHAR(255);
    END IF;
END;
CALL add_col_admin_name();
DROP PROCEDURE IF EXISTS add_col_admin_name;

DROP PROCEDURE IF EXISTS add_col_admin_username;
CREATE PROCEDURE add_col_admin_username()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND COLUMN_NAME = 'admin_username'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN admin_username VARCHAR(255);
    END IF;
END;
CALL add_col_admin_username();
DROP PROCEDURE IF EXISTS add_col_admin_username;

DROP PROCEDURE IF EXISTS add_col_termination_reason;
CREATE PROCEDURE add_col_termination_reason()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'termination_reason'
    ) THEN
        ALTER TABLE users ADD COLUMN termination_reason TEXT;
    END IF;
END;
CALL add_col_termination_reason();
DROP PROCEDURE IF EXISTS add_col_termination_reason;
