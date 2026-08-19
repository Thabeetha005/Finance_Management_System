SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE blogs;
TRUNCATE TABLE blog_categories;
SET FOREIGN_KEY_CHECKS = 1;

-- Categories
INSERT INTO blog_categories (name, type) VALUES
('Market Updates', 'LATEST_NEWS'),
('Economy', 'LATEST_NEWS'),
('Regulatory', 'LATEST_NEWS'),
('Kalpanaa Finance', 'LATEST_NEWS'),
('Investment', 'FINANCIAL_INSIGHTS'),
('Wealth Management', 'FINANCIAL_INSIGHTS'),
('Financial Planning', 'FINANCIAL_INSIGHTS'),
('Taxation', 'FINANCIAL_INSIGHTS'),
('Announcements', 'COMPANY_UPDATES'),
('Achievements', 'COMPANY_UPDATES'),
('Events', 'COMPANY_UPDATES'),
('Partnerships', 'COMPANY_UPDATES');

-- Latest News Blogs
INSERT INTO blogs (title, excerpt, content, image_url, date, category_id, type) VALUES
('Market Rally Continues as Global Indices Close Higher', 'Global markets extended gains this week as investors responded positively to...', '<p>Detailed content for Market Rally Continues as Global Indices Close Higher goes here.</p>', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop', '2025-05-20', (SELECT id FROM blog_categories WHERE name = 'Market Updates'), 'LATEST_NEWS'),
('RBI Maintains Repo Rate; Signals Stable Economic Outlook', 'The Reserve Bank of India has decided to keep the repo rate unchanged...', '<p>Detailed content for RBI Maintains Repo Rate; Signals Stable Economic Outlook goes here.</p>', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop', '2025-05-16', (SELECT id FROM blog_categories WHERE name = 'Economy' LIMIT 1), 'LATEST_NEWS'),
('Kalpanaa Finance Launches New Digital Wealth Platform', 'We are excited to announce the launch of our new digital wealth platform...', '<p>Detailed content for Kalpanaa Finance Launches New Digital Wealth Platform goes here.</p>', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop', '2025-05-10', (SELECT id FROM blog_categories WHERE name = 'Kalpanaa Finance'), 'LATEST_NEWS'),
('India''s GDP Growth Estimate Revised Upwards', 'Recent estimates point towards stronger economic performance...', '<p>Detailed content for India''s GDP Growth Estimate Revised Upwards goes here.</p>', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop', '2025-05-18', (SELECT id FROM blog_categories WHERE name = 'Economy' LIMIT 1), 'LATEST_NEWS'),
('Rupee Strengthens Against Major Currencies', 'Currency markets see positive movement for the domestic currency...', '<p>Detailed content for Rupee Strengthens Against Major Currencies goes here.</p>', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop', '2025-05-14', (SELECT id FROM blog_categories WHERE name = 'Market Updates'), 'LATEST_NEWS'),
('SEBI Introduces New Disclosure Norms', 'Regulatory body announces tighter norms for corporate disclosures...', '<p>Detailed content for SEBI Introduces New Disclosure Norms goes here.</p>', 'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop', '2025-05-12', (SELECT id FROM blog_categories WHERE name = 'Regulatory'), 'LATEST_NEWS');


-- Financial Insights Blogs
INSERT INTO blogs (title, excerpt, content, image_url, date, category_id, type) VALUES
('SIP vs Lump Sum: Which Strategy Works Better?', 'A detailed comparison to help you choose the right investment approach...', '<p>Detailed content for SIP vs Lump Sum: Which Strategy Works Better? goes here.</p>', 'https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=2070&auto=format&fit=crop', '2025-05-18', (SELECT id FROM blog_categories WHERE name = 'Investment'), 'FINANCIAL_INSIGHTS'),
('5 Smart Financial Habits for Long-term Wealth', 'Simple habits that can significantly improve your financial future...', '<p>Detailed content for 5 Smart Financial Habits for Long-term Wealth goes here.</p>', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2036&auto=format&fit=crop', '2025-05-17', (SELECT id FROM blog_categories WHERE name = 'Financial Planning' LIMIT 1), 'FINANCIAL_INSIGHTS'),
('Diversification: The Key to Managing Risk', 'Understand how diversification can protect your portfolio in volatile markets...', '<p>Detailed content for Diversification: The Key to Managing Risk goes here.</p>', 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop', '2025-05-15', (SELECT id FROM blog_categories WHERE name = 'Wealth Management' LIMIT 1), 'FINANCIAL_INSIGHTS'),
('How to Build an Emergency Fund', 'Step-by-step guide to securing your financial safety net...', '<p>Detailed content for How to Build an Emergency Fund goes here.</p>', 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop', '2025-05-15', (SELECT id FROM blog_categories WHERE name = 'Financial Planning' LIMIT 1), 'FINANCIAL_INSIGHTS'),
('Understanding Asset Allocation', 'Learn the basics of spreading your investments across asset classes...', '<p>Detailed content for Understanding Asset Allocation goes here.</p>', 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?q=80&w=2070&auto=format&fit=crop', '2025-05-11', (SELECT id FROM blog_categories WHERE name = 'Wealth Management' LIMIT 1), 'FINANCIAL_INSIGHTS'),
('Retirement Planning in Your 30s vs 40s', 'How your approach to retirement should evolve over time...', '<p>Detailed content for Retirement Planning in Your 30s vs 40s goes here.</p>', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop', '2025-05-09', (SELECT id FROM blog_categories WHERE name = 'Financial Planning' LIMIT 1), 'FINANCIAL_INSIGHTS');

-- Company Updates Blogs
INSERT INTO blogs (title, excerpt, content, image_url, date, category_id, type) VALUES
('Kalpanaa Finance Partners with Leading Fintech Platform', 'This partnership will help us deliver enhanced financial solutions...', '<p>Detailed content for Kalpanaa Finance Partners with Leading Fintech Platform goes here.</p>', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2069&auto=format&fit=crop', '2025-05-21', (SELECT id FROM blog_categories WHERE name = 'Partnerships'), 'COMPANY_UPDATES'),
('We are Among the Top 10 Fastest Growing Finance Companies', 'A proud moment for our team and customers. Thank you for your trust...', '<p>Detailed content for We are Among the Top 10 Fastest Growing Finance Companies goes here.</p>', 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=2070&auto=format&fit=crop', '2025-05-18', (SELECT id FROM blog_categories WHERE name = 'Achievements' LIMIT 1), 'COMPANY_UPDATES'),
('Kalpanaa Finance Annual Meet 2025 Highlights', 'A glimpse of our annual meet where we celebrated success and shared our...', '<p>Detailed content for Kalpanaa Finance Annual Meet 2025 Highlights goes here.</p>', 'https://images.unsplash.com/photo-1515169067868-5387ec356754?q=80&w=2070&auto=format&fit=crop', '2025-05-16', (SELECT id FROM blog_categories WHERE name = 'Events'), 'COMPANY_UPDATES'),
('New Office Opening in Bengaluru', 'Expanding our footprint to serve more customers in South India...', '<p>Detailed content for New Office Opening in Bengaluru goes here.</p>', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop', '2025-05-14', (SELECT id FROM blog_categories WHERE name = 'Announcements' LIMIT 1), 'COMPANY_UPDATES'),
('Q1 2025 Performance Highlights', 'Review of our strong performance in the first quarter of the year...', '<p>Detailed content for Q1 2025 Performance Highlights goes here.</p>', 'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1974&auto=format&fit=crop', '2025-05-12', (SELECT id FROM blog_categories WHERE name = 'Announcements' LIMIT 1), 'COMPANY_UPDATES'),
('Employee Recognition Program 2025', 'Celebrating our top performers and their contribution to our success...', '<p>Detailed content for Employee Recognition Program 2025 goes here.</p>', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop', '2025-05-10', (SELECT id FROM blog_categories WHERE name = 'Achievements' LIMIT 1), 'COMPANY_UPDATES');
