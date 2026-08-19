-- V50__Add_Admin_Name_And_Username_To_Audit_Logs.sql

ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS admin_name VARCHAR(255);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS admin_username VARCHAR(255);
ALTER TABLE audit_logs MODIFY COLUMN admin_id BIGINT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS termination_reason TEXT;
