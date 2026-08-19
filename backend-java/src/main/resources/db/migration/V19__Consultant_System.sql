-- Additive migration for Consultant System

-- 1. Consultant Profiles
CREATE TABLE consultant_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    experience_years INT DEFAULT 0,
    qualification VARCHAR(255),
    bio TEXT,
    profile_image_url VARCHAR(255),
    working_days VARCHAR(255),
    working_hours_start VARCHAR(10),
    working_hours_end VARCHAR(10),
    max_sessions_per_day INT DEFAULT 5,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 2. Consultant Availability
CREATE TABLE consultant_availability (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    consultant_id BIGINT NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    current_sessions INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (consultant_id) REFERENCES consultant_profiles(id),
    UNIQUE KEY uk_consultant_date (consultant_id, date)
);

-- 3. We modify existing consultations table instead of dropping it
ALTER TABLE consultations 
ADD COLUMN duration_minutes INT DEFAULT 60 AFTER preferred_time,
ADD COLUMN communication_method VARCHAR(50) DEFAULT 'Video Call' AFTER duration_minutes,
ADD COLUMN priority VARCHAR(50) DEFAULT 'NORMAL' AFTER communication_method;

-- 4. Consultation Assignments
CREATE TABLE consultation_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    consultation_id BIGINT NOT NULL,
    consultant_id BIGINT NOT NULL,
    assigned_by_admin_id BIGINT,
    status VARCHAR(50) DEFAULT 'PENDING_APPROVAL',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id),
    FOREIGN KEY (consultant_id) REFERENCES consultant_profiles(id),
    FOREIGN KEY (assigned_by_admin_id) REFERENCES users(id)
);

-- 5. Consultation Sessions
CREATE TABLE consultation_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    actual_start_time TIMESTAMP NULL,
    actual_end_time TIMESTAMP NULL,
    meeting_link VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES consultation_assignments(id)
);

-- 6. Consultation Notes
CREATE TABLE consultation_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES consultation_sessions(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
);
