-- Migration: V55__add_missing_amount_to_loan_installments.sql
-- Purpose: Add missing 'amount' column to 'loan_installments' table required by LoanInstallment entity.

ALTER TABLE loan_installments 
ADD COLUMN amount DECIMAL(19, 2) NOT NULL DEFAULT 0.00;

-- Populate 'amount' with 'amount_due' where amount is zero
UPDATE loan_installments 
SET amount = amount_due 
WHERE amount = 0.00 AND amount_due > 0.00;
