CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_user_id BIGINT NOT NULL,
    sender_user_id BIGINT,
    sender_role VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    message_type VARCHAR(50),
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_messages_recipient_user_id ON messages (recipient_user_id);
CREATE INDEX idx_messages_is_read ON messages (is_read);
CREATE INDEX idx_messages_created_at ON messages (created_at);
CREATE INDEX idx_messages_related_entity ON messages (related_entity_type, related_entity_id);
