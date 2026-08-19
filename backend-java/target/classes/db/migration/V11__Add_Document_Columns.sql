-- V11: Add missing BLOB document columns (skip ones already added by entity/previous migrations)
ALTER TABLE documents ADD COLUMN content_type VARCHAR(100) NULL;
ALTER TABLE documents ADD COLUMN file_size BIGINT NULL;
ALTER TABLE documents ADD COLUMN file_data LONGBLOB NULL;
ALTER TABLE documents ADD COLUMN verification_status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE documents ADD COLUMN admin_note TEXT NULL;
ALTER TABLE documents ADD COLUMN reviewed_at DATETIME NULL;
ALTER TABLE documents ADD COLUMN reviewed_by VARCHAR(255) NULL;
