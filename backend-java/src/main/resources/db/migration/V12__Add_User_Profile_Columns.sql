-- V12: Add profile columns to users table
ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL;
ALTER TABLE users ADD COLUMN account_status VARCHAR(50) DEFAULT 'ACTIVE';
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
