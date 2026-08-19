-- V16: Add application_status to investments table
ALTER TABLE investments ADD COLUMN application_status VARCHAR(50) NULL;
