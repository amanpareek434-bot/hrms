-- =====================================================
-- Fix: create company_settings table if missing
-- Run this in MySQL Workbench (Ctrl+Shift+Enter).
-- =====================================================

USE peoplehub_hrms;

CREATE TABLE IF NOT EXISTS company_settings (
  id            INT NOT NULL PRIMARY KEY DEFAULT 1,
  name          VARCHAR(200) DEFAULT 'My Company',
  legal_name    VARCHAR(200),
  email         VARCHAR(180),
  phone         VARCHAR(40),
  website       VARCHAR(200),
  address       TEXT,
  logo_url      VARCHAR(500),
  currency      VARCHAR(8)  DEFAULT 'INR',
  timezone      VARCHAR(80) DEFAULT 'Asia/Kolkata',
  work_start    TIME DEFAULT '09:30:00',
  work_end      TIME DEFAULT '18:30:00',
  weekly_offs   VARCHAR(40) DEFAULT 'Sat,Sun',
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insert default row
INSERT IGNORE INTO company_settings (id, name) VALUES (1, 'PeopleHub Inc.');

-- Verify
SELECT * FROM company_settings;
