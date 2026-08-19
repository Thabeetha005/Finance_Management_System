-- V33: Customer Profile Management & Security Enhancements

ALTER TABLE users 
ADD COLUMN username VARCHAR(100) NULL UNIQUE,
ADD COLUMN last_username_changed_at DATETIME NULL,
ADD COLUMN token_version INT NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS pending_email_changes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    old_email VARCHAR(255) NOT NULL,
    new_email VARCHAR(255) NOT NULL,
    token VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, EXPIRED
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pending_email_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_pending_email_token ON pending_email_changes (token);
CREATE INDEX idx_pending_email_user_status ON pending_email_changes (user_id, status);
