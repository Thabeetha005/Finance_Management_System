-- Migration V29: Application Documents Linking Table
-- Supports automatic document reuse, application reference linking, and zero binary duplication.

CREATE TABLE IF NOT EXISTS application_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    application_type VARCHAR(50) NOT NULL, -- 'LOAN' or 'INVESTMENT'
    document_id BIGINT NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    is_newly_uploaded BOOLEAN NOT NULL DEFAULT FALSE,
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_app_docs_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT uk_app_doc_type UNIQUE (application_id, application_type, document_type)
);

-- Index for fast lookup by application
CREATE INDEX idx_app_docs_lookup ON application_documents(application_id, application_type);
