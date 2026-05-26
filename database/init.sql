-- =====================================================
-- PeopleHub HRMS — Production Init Schema
-- Run this ONCE on a fresh MySQL database (Railway / Aiven / etc.).
-- All tables + indexes. NO seed data, NO DROP DATABASE.
-- =====================================================

-- ===== Core =====

CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(40)  NOT NULL PRIMARY KEY,
  email         VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(120) NOT NULL,
  role          ENUM('admin','manager','user') DEFAULT 'admin',
  employee_id   VARCHAR(40),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_emp (employee_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS departments (
  id            VARCHAR(40)  NOT NULL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL UNIQUE,
  head          VARCHAR(120),
  description   TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS employees (
  id              VARCHAR(40)   NOT NULL PRIMARY KEY,
  employee_code   VARCHAR(40)   NOT NULL UNIQUE,
  essl_user_id    VARCHAR(40),
  first_name      VARCHAR(80)   NOT NULL,
  last_name       VARCHAR(80),
  email           VARCHAR(180)  NOT NULL UNIQUE,
  phone           VARCHAR(40),
  department      VARCHAR(120),
  designation     VARCHAR(120),
  joining_date    DATE,
  date_of_birth   DATE,
  salary          DECIMAL(12,2) DEFAULT 0,
  status          ENUM('Active','On Leave','Resigned','Terminated') DEFAULT 'Active',
  address         TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_emp_dept (department),
  INDEX idx_emp_status (status),
  INDEX idx_emp_dob (date_of_birth),
  INDEX idx_emp_essl (essl_user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS attendance (
  id            VARCHAR(40) NOT NULL PRIMARY KEY,
  employee_id   VARCHAR(40) NOT NULL,
  `date`        DATE        NOT NULL,
  check_in      TIME,
  check_out     TIME,
  status        ENUM('Present','Absent','Half Day','Leave','Holiday') DEFAULT 'Present',
  notes         VARCHAR(255),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_emp_date (employee_id, `date`),
  CONSTRAINT fk_att_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_att_date (`date`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS leaves (
  id            VARCHAR(40) NOT NULL PRIMARY KEY,
  employee_id   VARCHAR(40) NOT NULL,
  type          ENUM('Casual','Sick','Earned','Unpaid','Maternity','Paternity') DEFAULT 'Casual',
  from_date     DATE NOT NULL,
  to_date       DATE NOT NULL,
  reason        TEXT,
  status        ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
  applied_on    DATE NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_leave_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_leave_status (status),
  INDEX idx_leave_dates (from_date, to_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payroll (
  id            VARCHAR(40)   NOT NULL PRIMARY KEY,
  employee_id   VARCHAR(40)   NOT NULL,
  month         CHAR(7)       NOT NULL,
  basic         DECIMAL(12,2) NOT NULL DEFAULT 0,
  hra           DECIMAL(12,2) NOT NULL DEFAULT 0,
  allowances    DECIMAL(12,2) NOT NULL DEFAULT 0,
  deductions    DECIMAL(12,2) NOT NULL DEFAULT 0,
  net           DECIMAL(12,2) NOT NULL DEFAULT 0,
  paid          TINYINT(1)    NOT NULL DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_emp_month (employee_id, month),
  CONSTRAINT fk_pay_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ===== Workplace modules =====

CREATE TABLE IF NOT EXISTS announcements (
  id            VARCHAR(40)  NOT NULL PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  body          TEXT NOT NULL,
  posted_by     VARCHAR(120),
  target        ENUM('All','Department') DEFAULT 'All',
  target_dept   VARCHAR(120),
  priority      ENUM('Low','Normal','High','Urgent') DEFAULT 'Normal',
  posted_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at    DATE,
  INDEX idx_ann_posted (posted_at),
  INDEX idx_ann_priority (priority)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS holidays (
  id            VARCHAR(40)  NOT NULL PRIMARY KEY,
  `date`        DATE NOT NULL,
  name          VARCHAR(200) NOT NULL,
  type          ENUM('National','Regional','Company','Optional') DEFAULT 'National',
  description   TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_holiday_date_name (`date`, name),
  INDEX idx_holiday_date (`date`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS assets (
  id            VARCHAR(40)  NOT NULL PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  category      ENUM('Laptop','Desktop','Phone','Tablet','Monitor','Access Card','Vehicle','Other') DEFAULT 'Other',
  serial_no     VARCHAR(120),
  assigned_to   VARCHAR(40),
  assigned_on   DATE,
  returned_on   DATE,
  status        ENUM('Available','Assigned','In Repair','Retired') DEFAULT 'Available',
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_asset_emp FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL,
  INDEX idx_asset_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS candidates (
  id              VARCHAR(40)  NOT NULL PRIMARY KEY,
  name            VARCHAR(200) NOT NULL,
  email           VARCHAR(200),
  phone           VARCHAR(40),
  position        VARCHAR(120),
  department      VARCHAR(120),
  stage           ENUM('Applied','Screening','Interview','Offer','Hired','Rejected') DEFAULT 'Applied',
  source          VARCHAR(80),
  applied_on      DATE,
  expected_salary DECIMAL(12,2),
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cand_stage (stage),
  INDEX idx_cand_dept (department)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reviews (
  id            VARCHAR(40)  NOT NULL PRIMARY KEY,
  employee_id   VARCHAR(40)  NOT NULL,
  period        VARCHAR(20)  NOT NULL,
  reviewer      VARCHAR(120),
  rating        DECIMAL(3,2),
  strengths     TEXT,
  improvements  TEXT,
  goals         TEXT,
  status        ENUM('Draft','Submitted','Acknowledged') DEFAULT 'Draft',
  reviewed_on   DATE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_review_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_review_period (period),
  INDEX idx_review_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS documents (
  id            VARCHAR(40)  NOT NULL PRIMARY KEY,
  employee_id   VARCHAR(40)  NOT NULL,
  title         VARCHAR(200) NOT NULL,
  category      ENUM('Offer Letter','Contract','ID Proof','Resume','Certificate','Payslip','Tax','Other') DEFAULT 'Other',
  file_url      VARCHAR(500),
  notes         TEXT,
  uploaded_on   DATE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_doc_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_doc_emp (employee_id),
  INDEX idx_doc_category (category)
) ENGINE=InnoDB;

-- ===== Settings & integrations =====

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

INSERT IGNORE INTO company_settings (id, name) VALUES (1, 'PeopleHub Inc.');

CREATE TABLE IF NOT EXISTS essl_settings (
  id                    INT NOT NULL PRIMARY KEY DEFAULT 1,
  device_ip             VARCHAR(40),
  device_port           INT DEFAULT 4370,
  comm_password         VARCHAR(40),
  enabled               TINYINT(1) NOT NULL DEFAULT 0,
  auto_create_employees TINYINT(1) NOT NULL DEFAULT 0,
  last_sync_at          DATETIME,
  last_sync_count       INT DEFAULT 0,
  last_error            TEXT,
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO essl_settings (id, device_port) VALUES (1, 4370);

-- ===== WebAuthn (phone fingerprint) =====

CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id              VARCHAR(255) NOT NULL PRIMARY KEY,
  employee_id     VARCHAR(40)  NOT NULL,
  public_key      TEXT         NOT NULL,
  counter         BIGINT       NOT NULL DEFAULT 0,
  device_name     VARCHAR(160),
  transports      VARCHAR(255),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at    TIMESTAMP    NULL,
  CONSTRAINT fk_wac_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_wac_emp (employee_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS webauthn_challenges (
  employee_id     VARCHAR(40)  NOT NULL PRIMARY KEY,
  challenge       VARCHAR(255) NOT NULL,
  kind            ENUM('register','auth') NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wch_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SELECT 'PeopleHub schema initialized' AS status,
       (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()) AS tables;
