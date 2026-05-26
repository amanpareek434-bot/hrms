-- =====================================================
-- PeopleHub HRMS — MySQL Schema
-- Run this file in MySQL Workbench:
--   File → Open SQL Script → schema.sql → Execute (Ctrl+Shift+Enter)
-- =====================================================

DROP DATABASE IF EXISTS peoplehub_hrms;
CREATE DATABASE peoplehub_hrms
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE peoplehub_hrms;

-- =====================================================
-- Core Tables
-- =====================================================

CREATE TABLE users (
  id            VARCHAR(40)  NOT NULL PRIMARY KEY,
  email         VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(120) NOT NULL,
  role          ENUM('admin','manager','user') DEFAULT 'admin',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE departments (
  id            VARCHAR(40)  NOT NULL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL UNIQUE,
  head          VARCHAR(120),
  description   TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE employees (
  id              VARCHAR(40)   NOT NULL PRIMARY KEY,
  employee_code   VARCHAR(40)   NOT NULL UNIQUE,
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
  INDEX idx_emp_dob (date_of_birth)
) ENGINE=InnoDB;

CREATE TABLE attendance (
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

CREATE TABLE leaves (
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

CREATE TABLE payroll (
  id            VARCHAR(40)   NOT NULL PRIMARY KEY,
  employee_id   VARCHAR(40)   NOT NULL,
  month         CHAR(7)       NOT NULL,            -- YYYY-MM
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

-- =====================================================
-- New Modules
-- =====================================================

CREATE TABLE announcements (
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

CREATE TABLE holidays (
  id            VARCHAR(40)  NOT NULL PRIMARY KEY,
  `date`        DATE NOT NULL,
  name          VARCHAR(200) NOT NULL,
  type          ENUM('National','Regional','Company','Optional') DEFAULT 'National',
  description   TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_holiday_date_name (`date`, name),
  INDEX idx_holiday_date (`date`)
) ENGINE=InnoDB;

CREATE TABLE assets (
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

CREATE TABLE candidates (
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

CREATE TABLE reviews (
  id            VARCHAR(40)  NOT NULL PRIMARY KEY,
  employee_id   VARCHAR(40)  NOT NULL,
  period        VARCHAR(20)  NOT NULL,                -- e.g. 2026-Q1 or 2026-H1
  reviewer      VARCHAR(120),
  rating        DECIMAL(3,2),                          -- 1.00 to 5.00
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

-- =====================================================
-- Seed Data
-- =====================================================

INSERT INTO departments (id, name, head, description) VALUES
('d-eng',   'Engineering',      'Priya Sharma', 'Product & platform engineering'),
('d-hr',    'Human Resources',  'Anil Kapoor',  'People operations'),
('d-sales', 'Sales',            'Rohan Mehta',  'Revenue & growth'),
('d-fin',   'Finance',          'Neha Verma',   'Accounts & payroll'),
('d-mkt',   'Marketing',        'Sara Khan',    'Brand & demand gen');

INSERT INTO employees (id, employee_code, first_name, last_name, email, phone, department, designation, joining_date, date_of_birth, salary, status, address) VALUES
('e-1001','EMP1001','Aarav','Singh','aarav.singh@company.com','+91 98200 11111','Engineering','Senior Software Engineer','2022-04-12','1994-06-15',95000,'Active','Bengaluru, KA'),
('e-1002','EMP1002','Diya','Patel','diya.patel@company.com','+91 99000 22222','Human Resources','HR Business Partner','2021-08-01','1992-11-03',78000,'Active','Mumbai, MH'),
('e-1003','EMP1003','Kabir','Joshi','kabir.joshi@company.com','+91 99876 33333','Sales','Sales Manager','2023-01-15','1990-02-22',85000,'Active','Delhi, DL'),
('e-1004','EMP1004','Ishita','Nair','ishita.nair@company.com','+91 98111 44444','Finance','Financial Analyst','2023-06-20','1995-09-30',72000,'On Leave','Pune, MH'),
('e-1005','EMP1005','Vivaan','Reddy','vivaan.reddy@company.com','+91 99001 55555','Marketing','Content Strategist','2024-02-10','1997-12-05',65000,'Active','Hyderabad, TS');

-- Attendance for last 5 days
INSERT INTO attendance (id, employee_id, `date`, check_in, check_out, status) VALUES
('a-1001-d0','e-1001', CURDATE(),                 '09:30','18:35','Present'),
('a-1002-d0','e-1002', CURDATE(),                 '09:35','18:30','Present'),
('a-1003-d0','e-1003', CURDATE(),                 '09:25','18:40','Present'),
('a-1004-d0','e-1004', CURDATE(),                  NULL,   NULL,   'Leave'),
('a-1005-d0','e-1005', CURDATE(),                 '09:45','18:30','Present'),
('a-1001-d1','e-1001', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:30','18:35','Present'),
('a-1002-d1','e-1002', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:35','18:30','Present'),
('a-1003-d1','e-1003', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:25','18:40','Present'),
('a-1004-d1','e-1004', DATE_SUB(CURDATE(), INTERVAL 1 DAY),  NULL,   NULL,   'Absent'),
('a-1005-d1','e-1005', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:45','18:30','Present');

INSERT INTO leaves (id, employee_id, type, from_date, to_date, reason, status, applied_on) VALUES
('l-1','e-1004','Sick',    CURDATE(),                              DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Viral fever, doctor advised rest', 'Approved', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
('l-2','e-1003','Casual',  DATE_ADD(CURDATE(), INTERVAL 5 DAY),    DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Personal work',                    'Pending',  CURDATE());

INSERT INTO payroll (id, employee_id, month, basic, hra, allowances, deductions, net, paid) VALUES
('p-1001','e-1001', DATE_FORMAT(CURDATE(),'%Y-%m'), 57000,19000,19000,7600,87400,0),
('p-1002','e-1002', DATE_FORMAT(CURDATE(),'%Y-%m'), 46800,15600,15600,6240,71760,0),
('p-1003','e-1003', DATE_FORMAT(CURDATE(),'%Y-%m'), 51000,17000,17000,6800,78200,0),
('p-1004','e-1004', DATE_FORMAT(CURDATE(),'%Y-%m'), 43200,14400,14400,5760,66240,0),
('p-1005','e-1005', DATE_FORMAT(CURDATE(),'%Y-%m'), 39000,13000,13000,5200,59800,0);

-- Announcements
INSERT INTO announcements (id, title, body, posted_by, target, priority, expires_at) VALUES
('an-1','Diwali Bonus Approved','We are pleased to announce a Diwali bonus equivalent to one week''s gross salary for all confirmed employees. Payouts will be processed with the November payroll.','Anil Kapoor','All','High', DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
('an-2','New Office WiFi','The office WiFi has been upgraded. SSID: PeopleHub-5G. Password is shared in your team Slack channel.','Priya Sharma','All','Normal', DATE_ADD(CURDATE(), INTERVAL 14 DAY)),
('an-3','Annual Performance Cycle Begins','Self-assessment forms are now live in the Performance module. Please submit before the 30th.','Anil Kapoor','All','Urgent', DATE_ADD(CURDATE(), INTERVAL 21 DAY));

-- Holidays for current year
INSERT INTO holidays (id, `date`, name, type, description) VALUES
('h-rep',    CONCAT(YEAR(CURDATE()),'-01-26'), 'Republic Day',      'National', 'Republic Day of India'),
('h-holi',   CONCAT(YEAR(CURDATE()),'-03-14'), 'Holi',              'National', 'Festival of colours'),
('h-ind',    CONCAT(YEAR(CURDATE()),'-08-15'), 'Independence Day',  'National', 'Independence Day of India'),
('h-gan',    CONCAT(YEAR(CURDATE()),'-09-07'), 'Ganesh Chaturthi',  'Regional', 'Ganesh festival'),
('h-gan2',   CONCAT(YEAR(CURDATE()),'-10-02'), 'Gandhi Jayanti',    'National', 'Mahatma Gandhi''s birthday'),
('h-diw',    CONCAT(YEAR(CURDATE()),'-11-01'), 'Diwali',            'National', 'Festival of lights'),
('h-xmas',   CONCAT(YEAR(CURDATE()),'-12-25'), 'Christmas',         'National', 'Christmas Day'),
('h-found',  CONCAT(YEAR(CURDATE()),'-07-10'), 'Foundation Day',    'Company',  'PeopleHub anniversary');

-- Assets
INSERT INTO assets (id, name, category, serial_no, assigned_to, assigned_on, status, notes) VALUES
('as-1','MacBook Pro 14"','Laptop','MBP14-001','e-1001', DATE_SUB(CURDATE(), INTERVAL 200 DAY), 'Assigned','M2 Pro, 16GB / 512GB'),
('as-2','Dell XPS 13','Laptop','DELLXPS-014','e-1002', DATE_SUB(CURDATE(), INTERVAL 300 DAY), 'Assigned','i7, 16GB / 1TB'),
('as-3','iPhone 14','Phone','APL-IPH14-09','e-1003', DATE_SUB(CURDATE(), INTERVAL 90 DAY), 'Assigned','128GB, work line'),
('as-4','LG UltraFine 27"','Monitor','LGUF27-22',NULL, NULL, 'Available','Spare 4K display'),
('as-5','Access Card #A12','Access Card','AC-A12','e-1005', DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'Assigned','Floor 4 + parking'),
('as-6','MacBook Air M2','Laptop','MBA-M2-007',NULL, NULL, 'In Repair','Battery service');

-- Candidates pipeline
INSERT INTO candidates (id, name, email, phone, position, department, stage, source, applied_on, expected_salary, notes) VALUES
('c-1','Rhea Kapoor','rhea.k@gmail.com','+91 98765 10001','Frontend Engineer','Engineering','Interview','LinkedIn', DATE_SUB(CURDATE(), INTERVAL 8 DAY), 1100000,'Strong React + TS background'),
('c-2','Aditya Verma','aditya.v@gmail.com','+91 98765 10002','Sales Executive','Sales','Screening','Referral', DATE_SUB(CURDATE(), INTERVAL 4 DAY), 700000,'5 years SaaS sales'),
('c-3','Meera Iyer','meera.iyer@gmail.com','+91 98765 10003','HR Generalist','Human Resources','Applied','Job Board', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 600000,NULL),
('c-4','Karan Malhotra','karan.m@gmail.com','+91 98765 10004','Senior Designer','Marketing','Offer','LinkedIn', DATE_SUB(CURDATE(), INTERVAL 14 DAY), 1400000,'Offer extended, awaiting response'),
('c-5','Sneha Joshi','sneha.j@gmail.com','+91 98765 10005','Accountant','Finance','Rejected','Referral', DATE_SUB(CURDATE(), INTERVAL 18 DAY), 550000,'Skill mismatch');

-- Performance reviews
INSERT INTO reviews (id, employee_id, period, reviewer, rating, strengths, improvements, goals, status, reviewed_on) VALUES
('r-1','e-1001', CONCAT(YEAR(CURDATE()),'-Q1'),'Priya Sharma',4.5,'Strong ownership, mentors juniors, ships consistently','Could improve cross-team comms','Lead the new billing module rewrite','Acknowledged', DATE_SUB(CURDATE(), INTERVAL 30 DAY)),
('r-2','e-1003', CONCAT(YEAR(CURDATE()),'-Q1'),'Anil Kapoor',4.0,'Hit 110% of quota, great client rapport','Pipeline forecasting needs work','Build a junior SDR pod','Submitted', DATE_SUB(CURDATE(), INTERVAL 20 DAY)),
('r-3','e-1005', CONCAT(YEAR(CURDATE()),'-Q1'),'Sara Khan',3.5,'Creative output is solid','Improve turnaround time on briefs','Own the quarterly content calendar end-to-end','Draft', NULL);

-- =====================================================
-- Verification queries (optional — run separately)
-- =====================================================
-- SELECT COUNT(*) AS departments  FROM departments;
-- SELECT COUNT(*) AS employees    FROM employees;
-- SELECT COUNT(*) AS attendance   FROM attendance;
-- SELECT COUNT(*) AS leaves       FROM leaves;
-- SELECT COUNT(*) AS payroll      FROM payroll;
-- SELECT COUNT(*) AS announcements FROM announcements;
-- SELECT COUNT(*) AS holidays     FROM holidays;
-- SELECT COUNT(*) AS assets       FROM assets;
-- SELECT COUNT(*) AS candidates   FROM candidates;
-- SELECT COUNT(*) AS reviews      FROM reviews;
