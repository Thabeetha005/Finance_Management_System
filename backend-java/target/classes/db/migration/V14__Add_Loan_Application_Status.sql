-- V14: Add application_status to loans table
ALTER TABLE loans ADD COLUMN application_status VARCHAR(50) NULL;
