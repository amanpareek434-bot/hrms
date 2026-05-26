-- =====================================================
-- PeopleHub HRMS — Migration v5
-- Adds auto-create toggle to essl_settings.
-- =====================================================

USE peoplehub_hrms;

SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA='peoplehub_hrms' AND TABLE_NAME='essl_settings' AND COLUMN_NAME='auto_create_employees'
);
SET @stmt := IF(@col_exists = 0,
  'ALTER TABLE essl_settings ADD COLUMN auto_create_employees TINYINT(1) NOT NULL DEFAULT 0 AFTER enabled',
  'SELECT "auto_create_employees already exists" AS info'
);
PREPARE s FROM @stmt; EXECUTE s; DEALLOCATE PREPARE s;

SELECT * FROM essl_settings;
