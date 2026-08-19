ALTER TABLE transactions 
ADD COLUMN balance_before DECIMAL(19, 2),
ADD COLUMN balance_after DECIMAL(19, 2),
ADD COLUMN reference_entity VARCHAR(255),
ADD COLUMN reference_id BIGINT;

CREATE TABLE IF NOT EXISTS loan_emis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_id BIGINT NOT NULL,
    month_year VARCHAR(255) NOT NULL,
    amount DECIMAL(19, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(255) NOT NULL,
    paid_date DATETIME,
    transaction_id BIGINT
);

CREATE TABLE IF NOT EXISTS loan_installments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_id BIGINT NOT NULL,
    installment_number INT NOT NULL,
    amount_due DECIMAL(19, 2) NOT NULL,
    amount_paid DECIMAL(19, 2) NOT NULL DEFAULT 0.00,
    due_date DATE NOT NULL,
    status VARCHAR(255) NOT NULL
);
