-- =====================================================
-- PeopleHub HRMS — Migration (non-destructive)
-- Run this in MySQL Workbench AFTER the initial schema.sql,
-- if you do NOT want to wipe existing data.
--
-- Adds: date_of_birth column to employees,
--       announcements, holidays, assets, candidates, reviews, documents tables.
-- =====================================================

USE peoplehub_hrms;

-- --- 1) Add date_of_birth column to employees (if missing) ---
SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'peoplehub_hrms'
    AND TABLE_NAME   = 'employees'
    AND COLUMN_NAME  = 'date_of_birth'
);
SET @stmt := IF(@col_exists = 0,
  'ALTER TABLE employees ADD COLUMN date_of_birth DATE AFTER joining_date, ADD INDEX idx_emp_dob (date_of_birth)',
  'SELECT "date_of_birth column already exists" AS info'
);
PREPARE s FROM @stmt; EXECUTE s; DEALLOCATE PREPARE s;

-- --- 2) New tables (CREATE IF NOT EXISTS) ---

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

-- --- 3) Backfill DOB for seeded employees (if NULL) ---
UPDATE employees SET date_of_birth = '1994-06-15' WHERE id = 'e-1001' AND date_of_birth IS NULL;
UPDATE employees SET date_of_birth = '1992-11-03' WHERE id = 'e-1002' AND date_of_birth IS NULL;
UPDATE employees SET date_of_birth = '1990-02-22' WHERE id = 'e-1003' AND date_of_birth IS NULL;
UPDATE employees SET date_of_birth = '1995-09-30' WHERE id = 'e-1004' AND date_of_birth IS NULL;
UPDATE employees SET date_of_birth = '1997-12-05' WHERE id = 'e-1005' AND date_of_birth IS NULL;

-- --- 4) Initial company_settings row ---
INSERT IGNORE INTO company_settings (id, name) VALUES (1, 'PeopleHub Inc.');

-- --- 5) Seed announcements, holidays, assets, candidates, reviews ---
INSERT IGNORE INTO announcements (id, title, body, posted_by, target, priority, expires_at) VALUES
('an-1','Diwali Bonus Approved','We are pleased to announce a Diwali bonus equivalent to one week''s gross salary for all confirmed employees. Payouts will be processed with the November payroll.','Anil Kapoor','All','High', DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
('an-2','New Office WiFi','The office WiFi has been upgraded. SSID: PeopleHub-5G. Password is shared in your team Slack channel.','Priya Sharma','All','Normal', DATE_ADD(CURDATE(), INTERVAL 14 DAY)),
('an-3','Annual Performance Cycle Begins','Self-assessment forms are now live in the Performance module. Please submit before the 30th.','Anil Kapoor','All','Urgent', DATE_ADD(CURDATE(), INTERVAL 21 DAY));

INSERT IGNORE INTO holidays (id, `date`, name, type, description) VALUES
('h-rep',    CONCAT(YEAR(CURDATE()),'-01-26'), 'Republic Day',      'National', 'Republic Day of India'),
('h-holi',   CONCAT(YEAR(CURDATE()),'-03-14'), 'Holi',              'National', 'Festival of colours'),
('h-ind',    CONCAT(YEAR(CURDATE()),'-08-15'), 'Independence Day',  'National', 'Independence Day of India'),
('h-gan',    CONCAT(YEAR(CURDATE()),'-09-07'), 'Ganesh Chaturthi',  'Regional', 'Ganesh festival'),
('h-gan2',   CONCAT(YEAR(CURDATE()),'-10-02'), 'Gandhi Jayanti',    'National', 'Mahatma Gandhi''s birthday'),
('h-diw',    CONCAT(YEAR(CURDATE()),'-11-01'), 'Diwali',            'National', 'Festival of lights'),
('h-xmas',   CONCAT(YEAR(CURDATE()),'-12-25'), 'Christmas',         'National', 'Christmas Day'),
('h-found',  CONCAT(YEAR(CURDATE()),'-07-10'), 'Foundation Day',    'Company',  'PeopleHub anniversary');

INSERT IGNORE INTO assets (id, name, category, serial_no, assigned_to, assigned_on, status, notes) VALUES
('as-1','MacBook Pro 14"','Laptop','MBP14-001','e-1001', DATE_SUB(CURDATE(), INTERVAL 200 DAY), 'Assigned','M2 Pro, 16GB / 512GB'),
('as-2','Dell XPS 13','Laptop','DELLXPS-014','e-1002', DATE_SUB(CURDATE(), INTERVAL 300 DAY), 'Assigned','i7, 16GB / 1TB'),
('as-3','iPhone 14','Phone','APL-IPH14-09','e-1003', DATE_SUB(CURDATE(), INTERVAL 90 DAY), 'Assigned','128GB, work line'),
('as-4','LG UltraFine 27"','Monitor','LGUF27-22',NULL, NULL, 'Available','Spare 4K display'),
('as-5','Access Card #A12','Access Card','AC-A12','e-1005', DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'Assigned','Floor 4 + parking'),
('as-6','MacBook Air M2','Laptop','MBA-M2-007',NULL, NULL, 'In Repair','Battery service');

INSERT IGNORE INTO candidates (id, name, email, phone, position, department, stage, source, applied_on, expected_salary, notes) VALUES
('c-1','Rhea Kapoor','rhea.k@gmail.com','+91 98765 10001','Frontend Engineer','Engineering','Interview','LinkedIn', DATE_SUB(CURDATE(), INTERVAL 8 DAY), 1100000,'Strong React + TS background'),
('c-2','Aditya Verma','aditya.v@gmail.com','+91 98765 10002','Sales Executive','Sales','Screening','Referral', DATE_SUB(CURDATE(), INTERVAL 4 DAY), 700000,'5 years SaaS sales'),
('c-3','Meera Iyer','meera.iyer@gmail.com','+91 98765 10003','HR Generalist','Human Resources','Applied','Job Board', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 600000,NULL),
('c-4','Karan Malhotra','karan.m@gmail.com','+91 98765 10004','Senior Designer','Marketing','Offer','LinkedIn', DATE_SUB(CURDATE(), INTERVAL 14 DAY), 1400000,'Offer extended, awaiting response'),
('c-5','Sneha Joshi','sneha.j@gmail.com','+91 98765 10005','Accountant','Finance','Rejected','Referral', DATE_SUB(CURDATE(), INTERVAL 18 DAY), 550000,'Skill mismatch');

INSERT IGNORE INTO reviews (id, employee_id, period, reviewer, rating, strengths, improvements, goals, status, reviewed_on) VALUES
('r-1','e-1001', CONCAT(YEAR(CURDATE()),'-Q1'),'Priya Sharma',4.5,'Strong ownership, mentors juniors, ships consistently','Could improve cross-team comms','Lead the new billing module rewrite','Acknowledged', DATE_SUB(CURDATE(), INTERVAL 30 DAY)),
('r-2','e-1003', CONCAT(YEAR(CURDATE()),'-Q1'),'Anil Kapoor',4.0,'Hit 110% of quota, great client rapport','Pipeline forecasting needs work','Build a junior SDR pod','Submitted', DATE_SUB(CURDATE(), INTERVAL 20 DAY)),
('r-3','e-1005', CONCAT(YEAR(CURDATE()),'-Q1'),'Sara Khan',3.5,'Creative output is solid','Improve turnaround time on briefs','Own the quarterly content calendar end-to-end','Draft', NULL);

INSERT IGNORE INTO documents (id, employee_id, title, category, file_url, notes, uploaded_on) VALUES
('do-1','e-1001','Offer Letter — Aarav Singh','Offer Letter','https://example.com/docs/offer-aarav.pdf','Signed copy', DATE_SUB(CURDATE(), INTERVAL 400 DAY)),
('do-2','e-1001','PAN Card','ID Proof','https://example.com/docs/pan-aarav.pdf', NULL, DATE_SUB(CURDATE(), INTERVAL 400 DAY)),
('do-3','e-1002','Contract — Diya Patel','Contract','https://example.com/docs/contract-diya.pdf', '3-year contract', DATE_SUB(CURDATE(), INTERVAL 600 DAY)),
('do-4','e-1003','Resume','Resume','https://example.com/docs/resume-kabir.pdf', NULL, DATE_SUB(CURDATE(), INTERVAL 300 DAY));

-- --- 6) Verification ---
SELECT
  (SELECT COUNT(*) FROM announcements) AS announcements,
  (SELECT COUNT(*) FROM holidays)      AS holidays,
  (SELECT COUNT(*) FROM assets)        AS assets,
  (SELECT COUNT(*) FROM candidates)    AS candidates,
  (SELECT COUNT(*) FROM reviews)       AS reviews,
  (SELECT COUNT(*) FROM documents)     AS documents,
  (SELECT COUNT(*) FROM company_settings) AS settings;
