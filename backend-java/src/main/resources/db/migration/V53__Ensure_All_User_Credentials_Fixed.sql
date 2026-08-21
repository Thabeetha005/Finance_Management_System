-- V53__Ensure_All_User_Credentials_Fixed.sql
-- Fixes and enforces exact BCrypt password hashes for Admin, Consultant, and Customer demo accounts across domain aliases.

INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
VALUES 
('System Admin', 'admin@kalpanaafinance.com', '$2a$10$LCS8mfafXyNbSA9SJ.yI6OY5aVPhIRP8arPyvBTAJ48dHBZpedUpG', 'ADMIN', NOW(), NOW()),
('System Admin (3a)', 'admin@kalpanaaafinance.com', '$2a$10$LCS8mfafXyNbSA9SJ.yI6OY5aVPhIRP8arPyvBTAJ48dHBZpedUpG', 'ADMIN', NOW(), NOW()),
('Senior Consultant', 'consultant@kalpanaafinance.com', '$2a$10$U.SxhegPCkuYx.Vlao5R7.KCX/5627lP/OTszwALvC66FlkjUl7am', 'CONSULTANT', NOW(), NOW()),
('Senior Consultant (3a)', 'consultant@kalpanaaafinance.com', '$2a$10$U.SxhegPCkuYx.Vlao5R7.KCX/5627lP/OTszwALvC66FlkjUl7am', 'CONSULTANT', NOW(), NOW()),
('Standard Customer', 'user@kalpanaafinance.com', '$2a$10$BOw5.mvEnEtfgoubLkj2DeHs9/.K1XewoQDL8HEopcrl0Oq1ibgva', 'CUSTOMER', NOW(), NOW()),
('Standard Customer (3a)', 'user@kalpanaaafinance.com', '$2a$10$BOw5.mvEnEtfgoubLkj2DeHs9/.K1XewoQDL8HEopcrl0Oq1ibgva', 'CUSTOMER', NOW(), NOW()),
('John Doe', 'john.doe@example.com', '$2a$10$BOw5.mvEnEtfgoubLkj2DeHs9/.K1XewoQDL8HEopcrl0Oq1ibgva', 'CUSTOMER', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
password_hash = VALUES(password_hash),
role = VALUES(role),
updated_at = NOW();
