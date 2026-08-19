CREATE TABLE blog_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blogs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content LONGTEXT,
    image_url VARCHAR(1000),
    date DATE,
    category_id BIGINT,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_blog_category FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL
);
