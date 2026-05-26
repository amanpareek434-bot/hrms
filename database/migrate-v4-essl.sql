-- =====================================================
-- PeopleHub HRMS — Migration v4 (eSSL biometric integration)
-- Run in MySQL Workbench.
-- Adds: employees.essl_user_id + essl_settings table
-- =====================================================

USE peoplehub_hrms;

-- 1) Add essl_user_id to employees (nullable)
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA='peoplehub_hrms' AND TABLE_NAME='employees' AND COLUMN_NAME='essl_user_id'
);
SET @stmt := IF(@col_exists = 0,
  'ALTER TABLE employees ADD COLUMN essl_user_id VARCHAR(40) NULL AFTER employee_code, ADD INDEX idx_emp_essl (essl_user_id)',
  'SELECT "essl_user_id column already exists" AS info'
);
PREPARE s FROM @stmt; EXECUTE s; DEALLOCATE PREPARE s;

-- 2) Create essl_settings (single-row config)
CREATE TABLE IF NOT EXISTS essl_settings (
  id              INT NOT NULL PRIMARY KEY DEFAULT 1,
  device_ip       VARCHAR(40),
  device_port     INT DEFAULT 4370,
  comm_password   VARCHAR(40),
  enabled         TINYINT(1) NOT NULL DEFAULT 0,
  last_sync_at    DATETIME,
  last_sync_count INT DEFAULT 0,
  last_error      TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO essl_settings (id, device_port) VALUES (1, 4370);

-- 3) Verify
SELECT 'employees.essl_user_id' AS col, COUNT(*) AS exists_count
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA='peoplehub_hrms' AND TABLE_NAME='employees' AND COLUMN_NAME='essl_user_id'
UNION ALL
SELECT 'essl_settings table', COUNT(*)
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA='peoplehub_hrms' AND TABLE_NAME='essl_settings';

SELECT * FROM essl_settings;
