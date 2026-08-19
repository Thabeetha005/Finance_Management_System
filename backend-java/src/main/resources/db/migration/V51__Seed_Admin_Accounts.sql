-- V51__Seed_Admin_Accounts.sql
-- Ensures admin@kalpanaafinance.com and thabee@kalpanaafinance.com exist with correct BCrypt hashed passwords.
-- Hashes verified by running Spring BCryptPasswordEncoder(10) locally (see HashGenTest.java).

-- Hash for plaintext: "password"
INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
VALUES (
    'System Administrator',
    'admin@kalpanaafinance.com',
    '$2a$10$9kt0AofE8KWaka72yRzL9.30QNEAf9gElK4PKy60LC3cNWHvwoWM2',
    'ADMIN',
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE
    role         = 'ADMIN',
    password_hash = '$2a$10$9kt0AofE8KWaka72yRzL9.30QNEAf9gElK4PKy60LC3cNWHvwoWM2',
    updated_at   = NOW();

-- Hash for plaintext: "admin123"
INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
VALUES (
    'Thabee Admin',
    'thabee@kalpanaafinance.com',
    '$2a$10$qwloGCRO4cQ9VEfKp9rfi.ZuEFUsioI9qrq4.yeCDvIGWzb1.lphq',
    'ADMIN',
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE
    role         = 'ADMIN',
    password_hash = '$2a$10$qwloGCRO4cQ9VEfKp9rfi.ZuEFUsioI9qrq4.yeCDvIGWzb1.lphq',
    updated_at   = NOW();
