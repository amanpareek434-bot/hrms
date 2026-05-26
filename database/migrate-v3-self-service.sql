-- =====================================================
-- PeopleHub HRMS — Migration v3 (Self-service portal)
-- Run in MySQL Workbench AFTER the previous migrations.
-- Adds: users.employee_id linkage so employees can log in
--       and see only their own data.
-- =====================================================

USE peoplehub_hrms;

-- 1) Add employee_id column to users (nullable)
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA='peoplehub_hrms' AND TABLE_NAME='users' AND COLUMN_NAME='employee_id'
);
SET @stmt := IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN employee_id VARCHAR(40) NULL AFTER role, ADD INDEX idx_users_emp (employee_id)',
  'SELECT "users.employee_id already exists" AS info'
);
PREPARE s FROM @stmt; EXECUTE s; DEALLOCATE PREPARE s;

-- 2) Verification
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA='peoplehub_hrms' AND TABLE_NAME='users';
