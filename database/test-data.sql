-- =====================================================
-- PeopleHub HRMS — Test Data Upload Script
-- Safe to re-run: uses INSERT IGNORE everywhere.
-- Run AFTER schema.sql + all migrate-*.sql files.
--
-- Usage in MySQL Workbench:
--   File → Open SQL Script → test-data.sql → Execute (Ctrl+Shift+Enter)
--
-- Usage in phpMyAdmin (Hostinger / shared hosting):
--   Select your database first (e.g. u711358496_jipl) → Import tab →
--   choose this file → Go. Don't pre-select; phpMyAdmin will use the
--   currently open database. The "USE peoplehub_hrms" line has been
--   removed so this script is portable across database names.
-- =====================================================

-- NOTE: This script assumes you have already selected the target database
-- (e.g. clicked on it in the phpMyAdmin sidebar, or used USE manually).
-- Do NOT add `USE peoplehub_hrms;` on shared hosting where DB name differs.

-- =====================================================
-- 1) DEPARTMENTS (5 extra)
-- =====================================================
INSERT IGNORE INTO departments (id, name, head, description) VALUES
('d-eng',    'Engineering',      'Priya Sharma',   'Product & platform engineering'),
('d-hr',     'Human Resources',  'Anil Kapoor',    'People operations'),
('d-sales',  'Sales',            'Rohan Mehta',    'Revenue & growth'),
('d-fin',    'Finance',          'Neha Verma',     'Accounts & payroll'),
('d-mkt',    'Marketing',        'Sara Khan',      'Brand & demand gen'),
('d-ops',    'Operations',       'Vikram Rao',     'Logistics & vendor mgmt'),
('d-design', 'Design',           'Anjali Desai',   'UI/UX & brand design'),
('d-support','Customer Support', 'Rahul Sinha',    '24x7 customer support'),
('d-legal',  'Legal',            'Maya Iyer',      'Compliance & contracts'),
('d-it',     'IT & Admin',       'Suresh Pillai',  'Internal IT & facilities');

-- =====================================================
-- 2) EMPLOYEES (20 total — 5 from seed + 15 new)
-- =====================================================
INSERT IGNORE INTO employees
(id, employee_code, first_name, last_name, email, phone, department, designation, joining_date, date_of_birth, salary, status, address) VALUES
('e-1006','EMP1006','Rhea',    'Kapoor',    'rhea.kapoor@company.com',    '+91 98200 66666','Engineering',     'Frontend Engineer',     '2024-05-10','1996-03-18', 82000,'Active','Bengaluru, KA'),
('e-1007','EMP1007','Arjun',   'Mehta',     'arjun.mehta@company.com',    '+91 98200 77777','Engineering',     'Backend Engineer',      '2023-09-22','1993-07-25', 92000,'Active','Pune, MH'),
('e-1008','EMP1008','Sneha',   'Iyer',      'sneha.iyer@company.com',     '+91 98200 88888','Sales',           'Account Executive',     '2024-01-08','1994-11-12', 70000,'Active','Mumbai, MH'),
('e-1009','EMP1009','Rohan',   'Gupta',     'rohan.gupta@company.com',    '+91 98200 99999','Finance',         'Accounts Manager',      '2022-06-15','1989-04-09',105000,'Active','Delhi, DL'),
('e-1010','EMP1010','Priya',   'Bhat',      'priya.bhat@company.com',     '+91 98201 11111','Marketing',       'Digital Marketing Lead','2023-03-20','1991-08-14', 88000,'Active','Bengaluru, KA'),
('e-1011','EMP1011','Karan',   'Malhotra',  'karan.malhotra@company.com', '+91 98201 22222','Design',          'Senior UI Designer',    '2024-02-01','1992-12-30', 90000,'Active','Gurugram, HR'),
('e-1012','EMP1012','Tanvi',   'Shah',      'tanvi.shah@company.com',     '+91 98201 33333','Human Resources', 'HR Executive',          '2024-07-15','1998-05-20', 55000,'Active','Ahmedabad, GJ'),
('e-1013','EMP1013','Aditya',  'Verma',     'aditya.verma@company.com',   '+91 98201 44444','Customer Support','Support Engineer',      '2023-11-05','1995-10-08', 60000,'Active','Noida, UP'),
('e-1014','EMP1014','Nisha',   'Pillai',    'nisha.pillai@company.com',   '+91 98201 55555','Operations',      'Operations Analyst',    '2023-04-18','1994-02-14', 68000,'Active','Chennai, TN'),
('e-1015','EMP1015','Vikram',  'Rao',       'vikram.rao@company.com',     '+91 98201 66666','Operations',      'Operations Manager',    '2021-12-01','1987-06-22',115000,'Active','Hyderabad, TS'),
('e-1016','EMP1016','Anjali',  'Desai',     'anjali.desai@company.com',   '+91 98201 77777','Design',          'Design Lead',           '2022-02-14','1988-09-17',125000,'Active','Mumbai, MH'),
('e-1017','EMP1017','Manish',  'Tiwari',    'manish.tiwari@company.com',  '+91 98201 88888','Engineering',     'DevOps Engineer',       '2023-08-08','1992-01-25', 95000,'Active','Bengaluru, KA'),
('e-1018','EMP1018','Pooja',   'Reddy',     'pooja.reddy@company.com',    '+91 98201 99999','Sales',           'Sales Executive',       '2024-09-01','1996-07-11', 58000,'Active','Hyderabad, TS'),
('e-1019','EMP1019','Sandeep', 'Khanna',    'sandeep.khanna@company.com', '+91 98202 11111','IT & Admin',      'System Administrator',  '2022-10-10','1990-03-05', 76000,'Active','Delhi, DL'),
('e-1020','EMP1020','Meera',   'Pillai',    'meera.pillai@company.com',   '+91 98202 22222','Legal',           'Legal Counsel',         '2023-05-25','1989-12-19',110000,'Active','Bengaluru, KA'),
('e-1021','EMP1021','Rakesh',  'Yadav',     'rakesh.yadav@company.com',   '+91 98202 33333','Engineering',     'Junior Developer',      '2025-01-15','1999-04-08', 45000,'Active','Jaipur, RJ'),
('e-1022','EMP1022','Divya',   'Menon',     'divya.menon@company.com',    '+91 98202 44444','Marketing',       'SEO Specialist',        '2024-06-12','1995-08-28', 62000,'Active','Kochi, KL'),
('e-1023','EMP1023','Harsh',   'Agarwal',   'harsh.agarwal@company.com',  '+91 98202 55555','Finance',         'Senior Accountant',     '2023-02-20','1990-11-15', 82000,'On Leave','Kolkata, WB'),
('e-1024','EMP1024','Sara',    'Khan',      'sara.khan@company.com',      '+91 98202 66666','Marketing',       'Marketing Director',    '2020-04-01','1985-05-10',150000,'Active','Mumbai, MH'),
('e-1025','EMP1025','Mohit',   'Saxena',    'mohit.saxena@company.com',   '+91 98202 77777','Engineering',     'Tech Lead',             '2021-07-15','1986-10-02',140000,'Active','Bengaluru, KA');

-- =====================================================
-- 3) USERS (login accounts — password = 'password123' bcrypt hash)
--    NOTE: Replace the password_hash with a real bcrypt hash from your app
--    Below uses a placeholder that matches what register API generates.
--    For testing, register via UI OR replace these hashes.
-- =====================================================
INSERT IGNORE INTO users (id, email, password_hash, name, role, employee_id) VALUES
('u-admin','admin@company.com',     '$2b$10$abcdefghijklmnopqrstuvabcdefghijklmnopqrstuv12345678','Admin User',      'admin',   NULL),
('u-hr',   'hr@company.com',        '$2b$10$abcdefghijklmnopqrstuvabcdefghijklmnopqrstuv12345678','HR Manager',      'manager', 'e-1002'),
('u-1001', 'aarav.singh@company.com','$2b$10$abcdefghijklmnopqrstuvabcdefghijklmnopqrstuv12345678','Aarav Singh',     'user',    'e-1001'),
('u-1006', 'rhea.kapoor@company.com','$2b$10$abcdefghijklmnopqrstuvabcdefghijklmnopqrstuv12345678','Rhea Kapoor',     'user',    'e-1006'),
('u-1009', 'rohan.gupta@company.com','$2b$10$abcdefghijklmnopqrstuvabcdefghijklmnopqrstuv12345678','Rohan Gupta',     'manager', 'e-1009');

-- =====================================================
-- 4) ATTENDANCE — last 7 days for first 10 employees (~70 rows)
--    Skips employees on leave / random absences
-- =====================================================
INSERT IGNORE INTO attendance (id, employee_id, `date`, check_in, check_out, status) VALUES
-- Today (d0)
('att-1001-d0','e-1001', CURDATE(),'09:28','18:42','Present'),
('att-1002-d0','e-1002', CURDATE(),'09:32','18:35','Present'),
('att-1003-d0','e-1003', CURDATE(),'09:15','18:50','Present'),
('att-1004-d0','e-1004', CURDATE(), NULL,  NULL,  'Leave'),
('att-1005-d0','e-1005', CURDATE(),'09:55','18:30','Present'),
('att-1006-d0','e-1006', CURDATE(),'09:40','18:25','Present'),
('att-1007-d0','e-1007', CURDATE(),'09:10','18:45','Present'),
('att-1008-d0','e-1008', CURDATE(),'10:15','18:30','Half Day'),
('att-1009-d0','e-1009', CURDATE(),'09:20','19:10','Present'),
('att-1010-d0','e-1010', CURDATE(),'09:45','18:35','Present'),
-- Yesterday (d1)
('att-1001-d1','e-1001', DATE_SUB(CURDATE(), INTERVAL 1 DAY),'09:30','18:30','Present'),
('att-1002-d1','e-1002', DATE_SUB(CURDATE(), INTERVAL 1 DAY),'09:35','18:25','Present'),
('att-1003-d1','e-1003', DATE_SUB(CURDATE(), INTERVAL 1 DAY),'09:20','18:40','Present'),
('att-1004-d1','e-1004', DATE_SUB(CURDATE(), INTERVAL 1 DAY), NULL,  NULL,  'Absent'),
('att-1005-d1','e-1005', DATE_SUB(CURDATE(), INTERVAL 1 DAY),'09:50','18:20','Present'),
('att-1006-d1','e-1006', DATE_SUB(CURDATE(), INTERVAL 1 DAY),'09:40','18:30','Present'),
('att-1007-d1','e-1007', DATE_SUB(CURDATE(), INTERVAL 1 DAY),'09:00','18:50','Present'),
('att-1008-d1','e-1008', DATE_SUB(CURDATE(), INTERVAL 1 DAY),'09:30','18:30','Present'),
('att-1009-d1','e-1009', DATE_SUB(CURDATE(), INTERVAL 1 DAY),'09:15','19:00','Present'),
('att-1010-d1','e-1010', DATE_SUB(CURDATE(), INTERVAL 1 DAY),'09:45','18:30','Present'),
-- d2
('att-1001-d2','e-1001', DATE_SUB(CURDATE(), INTERVAL 2 DAY),'09:25','18:45','Present'),
('att-1002-d2','e-1002', DATE_SUB(CURDATE(), INTERVAL 2 DAY),'09:30','18:30','Present'),
('att-1003-d2','e-1003', DATE_SUB(CURDATE(), INTERVAL 2 DAY),'09:35','18:35','Present'),
('att-1004-d2','e-1004', DATE_SUB(CURDATE(), INTERVAL 2 DAY), NULL,  NULL,  'Leave'),
('att-1005-d2','e-1005', DATE_SUB(CURDATE(), INTERVAL 2 DAY),'09:40','18:25','Present'),
('att-1006-d2','e-1006', DATE_SUB(CURDATE(), INTERVAL 2 DAY),'10:05','18:40','Half Day'),
('att-1007-d2','e-1007', DATE_SUB(CURDATE(), INTERVAL 2 DAY),'09:15','18:50','Present'),
('att-1008-d2','e-1008', DATE_SUB(CURDATE(), INTERVAL 2 DAY),'09:45','18:30','Present'),
('att-1009-d2','e-1009', DATE_SUB(CURDATE(), INTERVAL 2 DAY),'09:20','19:00','Present'),
('att-1010-d2','e-1010', DATE_SUB(CURDATE(), INTERVAL 2 DAY),'09:50','18:35','Present'),
-- d3
('att-1001-d3','e-1001', DATE_SUB(CURDATE(), INTERVAL 3 DAY),'09:30','18:35','Present'),
('att-1002-d3','e-1002', DATE_SUB(CURDATE(), INTERVAL 3 DAY),'09:25','18:40','Present'),
('att-1003-d3','e-1003', DATE_SUB(CURDATE(), INTERVAL 3 DAY),'09:30','18:30','Present'),
('att-1005-d3','e-1005', DATE_SUB(CURDATE(), INTERVAL 3 DAY),'09:45','18:25','Present'),
('att-1006-d3','e-1006', DATE_SUB(CURDATE(), INTERVAL 3 DAY),'09:40','18:35','Present'),
('att-1007-d3','e-1007', DATE_SUB(CURDATE(), INTERVAL 3 DAY),'09:20','18:45','Present'),
('att-1008-d3','e-1008', DATE_SUB(CURDATE(), INTERVAL 3 DAY),'09:35','18:30','Present'),
('att-1009-d3','e-1009', DATE_SUB(CURDATE(), INTERVAL 3 DAY),'09:15','19:05','Present'),
('att-1010-d3','e-1010', DATE_SUB(CURDATE(), INTERVAL 3 DAY),'09:50','18:30','Present');

-- =====================================================
-- 5) LEAVES (mix of statuses & types)
-- =====================================================
INSERT IGNORE INTO leaves (id, employee_id, type, from_date, to_date, reason, status, applied_on) VALUES
('lv-001','e-1004','Sick',     CURDATE(),                              DATE_ADD(CURDATE(), INTERVAL 2 DAY),  'Viral fever, doctor advised rest',           'Approved', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
('lv-002','e-1003','Casual',   DATE_ADD(CURDATE(), INTERVAL 5 DAY),    DATE_ADD(CURDATE(), INTERVAL 5 DAY),  'Personal work',                              'Pending',  CURDATE()),
('lv-003','e-1006','Earned',   DATE_ADD(CURDATE(), INTERVAL 10 DAY),   DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'Family vacation to Goa',                     'Pending',  CURDATE()),
('lv-004','e-1007','Sick',     DATE_SUB(CURDATE(), INTERVAL 5 DAY),    DATE_SUB(CURDATE(), INTERVAL 4 DAY),  'Migraine',                                   'Approved', DATE_SUB(CURDATE(), INTERVAL 6 DAY)),
('lv-005','e-1008','Casual',   DATE_SUB(CURDATE(), INTERVAL 15 DAY),   DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'Bank work',                                  'Approved', DATE_SUB(CURDATE(), INTERVAL 16 DAY)),
('lv-006','e-1010','Maternity',DATE_ADD(CURDATE(), INTERVAL 30 DAY),   DATE_ADD(CURDATE(), INTERVAL 210 DAY),'Maternity leave — 6 months',                 'Approved', DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
('lv-007','e-1013','Casual',   DATE_ADD(CURDATE(), INTERVAL 2 DAY),    DATE_ADD(CURDATE(), INTERVAL 2 DAY),  'Sister wedding',                             'Approved', DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
('lv-008','e-1015','Earned',   DATE_SUB(CURDATE(), INTERVAL 30 DAY),   DATE_SUB(CURDATE(), INTERVAL 25 DAY), 'Annual vacation',                            'Approved', DATE_SUB(CURDATE(), INTERVAL 40 DAY)),
('lv-009','e-1023','Sick',     DATE_SUB(CURDATE(), INTERVAL 3 DAY),    DATE_ADD(CURDATE(), INTERVAL 7 DAY),  'Surgery & recovery',                         'Approved', DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
('lv-010','e-1018','Casual',   DATE_ADD(CURDATE(), INTERVAL 20 DAY),   DATE_ADD(CURDATE(), INTERVAL 22 DAY), 'Personal trip',                              'Pending',  CURDATE()),
('lv-011','e-1011','Unpaid',   DATE_SUB(CURDATE(), INTERVAL 60 DAY),   DATE_SUB(CURDATE(), INTERVAL 50 DAY), 'Extended personal leave',                    'Approved', DATE_SUB(CURDATE(), INTERVAL 70 DAY)),
('lv-012','e-1022','Sick',     DATE_SUB(CURDATE(), INTERVAL 8 DAY),    DATE_SUB(CURDATE(), INTERVAL 7 DAY),  'Food poisoning',                             'Rejected', DATE_SUB(CURDATE(), INTERVAL 10 DAY)),
('lv-013','e-1017','Paternity',DATE_ADD(CURDATE(), INTERVAL 45 DAY),   DATE_ADD(CURDATE(), INTERVAL 59 DAY), 'Paternity leave — 2 weeks',                  'Pending',  CURDATE()),
('lv-014','e-1021','Casual',   DATE_ADD(CURDATE(), INTERVAL 1 DAY),    DATE_ADD(CURDATE(), INTERVAL 1 DAY),  'Visa appointment',                           'Pending',  CURDATE());

-- =====================================================
-- 6) PAYROLL — current + previous 2 months for all 20 employees
-- =====================================================
INSERT IGNORE INTO payroll (id, employee_id, month, basic, hra, allowances, deductions, net, paid) VALUES
-- Current month (unpaid)
('pay-1001-m0','e-1001', DATE_FORMAT(CURDATE(),'%Y-%m'),                              57000,19000,19000,7600,87400,0),
('pay-1002-m0','e-1002', DATE_FORMAT(CURDATE(),'%Y-%m'),                              46800,15600,15600,6240,71760,0),
('pay-1003-m0','e-1003', DATE_FORMAT(CURDATE(),'%Y-%m'),                              51000,17000,17000,6800,78200,0),
('pay-1004-m0','e-1004', DATE_FORMAT(CURDATE(),'%Y-%m'),                              43200,14400,14400,5760,66240,0),
('pay-1005-m0','e-1005', DATE_FORMAT(CURDATE(),'%Y-%m'),                              39000,13000,13000,5200,59800,0),
('pay-1006-m0','e-1006', DATE_FORMAT(CURDATE(),'%Y-%m'),                              49200,16400,16400,6560,75440,0),
('pay-1007-m0','e-1007', DATE_FORMAT(CURDATE(),'%Y-%m'),                              55200,18400,18400,7360,84640,0),
('pay-1008-m0','e-1008', DATE_FORMAT(CURDATE(),'%Y-%m'),                              42000,14000,14000,5600,64400,0),
('pay-1009-m0','e-1009', DATE_FORMAT(CURDATE(),'%Y-%m'),                              63000,21000,21000,8400,96600,0),
('pay-1010-m0','e-1010', DATE_FORMAT(CURDATE(),'%Y-%m'),                              52800,17600,17600,7040,80960,0),
-- Previous month (paid)
('pay-1001-m1','e-1001', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH),'%Y-%m'),  57000,19000,19000,7600,87400,1),
('pay-1002-m1','e-1002', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH),'%Y-%m'),  46800,15600,15600,6240,71760,1),
('pay-1003-m1','e-1003', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH),'%Y-%m'),  51000,17000,17000,6800,78200,1),
('pay-1004-m1','e-1004', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH),'%Y-%m'),  43200,14400,14400,5760,66240,1),
('pay-1005-m1','e-1005', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH),'%Y-%m'),  39000,13000,13000,5200,59800,1),
('pay-1006-m1','e-1006', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH),'%Y-%m'),  49200,16400,16400,6560,75440,1),
('pay-1007-m1','e-1007', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH),'%Y-%m'),  55200,18400,18400,7360,84640,1),
('pay-1008-m1','e-1008', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH),'%Y-%m'),  42000,14000,14000,5600,64400,1),
('pay-1009-m1','e-1009', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH),'%Y-%m'),  63000,21000,21000,8400,96600,1),
('pay-1010-m1','e-1010', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH),'%Y-%m'),  52800,17600,17600,7040,80960,1),
-- Two months ago (paid)
('pay-1001-m2','e-1001', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH),'%Y-%m'),  57000,19000,19000,7600,87400,1),
('pay-1002-m2','e-1002', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH),'%Y-%m'),  46800,15600,15600,6240,71760,1),
('pay-1003-m2','e-1003', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH),'%Y-%m'),  51000,17000,17000,6800,78200,1),
('pay-1004-m2','e-1004', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH),'%Y-%m'),  43200,14400,14400,5760,66240,1),
('pay-1005-m2','e-1005', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH),'%Y-%m'),  39000,13000,13000,5200,59800,1);

-- =====================================================
-- 7) ANNOUNCEMENTS
-- =====================================================
INSERT IGNORE INTO announcements (id, title, body, posted_by, target, target_dept, priority, expires_at) VALUES
('ann-001','Quarterly Town Hall — Mark Your Calendar','Join us for the Q1 town hall on the 15th at 4 PM in the main auditorium. CEO will share financial results and roadmap.','Anil Kapoor','All',NULL,'High',         DATE_ADD(CURDATE(), INTERVAL 14 DAY)),
('ann-002','New Health Insurance Provider','Effective next month, our group health insurance moves to MediCare Plus. Cards will be shared via email. Coverage increased to ₹5L for self + family.','Anil Kapoor','All',NULL,'Urgent',        DATE_ADD(CURDATE(), INTERVAL 21 DAY)),
('ann-003','Engineering All-Hands Friday','Tech leads will present the new microservices architecture. Mandatory for all engineering staff.','Priya Sharma','Department','Engineering','Normal', DATE_ADD(CURDATE(), INTERVAL 7 DAY)),
('ann-004','Office Closed — Diwali Week','Office will remain closed from Diwali eve through the next Monday. Wishing everyone a safe & joyful festival.','Anil Kapoor','All',NULL,'High',          DATE_ADD(CURDATE(), INTERVAL 45 DAY)),
('ann-005','Quarterly Sales Targets Achieved','Sales team has exceeded Q1 targets by 18%. Special recognition lunch on Friday at 1 PM.','Rohan Mehta','Department','Sales','Normal',                  DATE_ADD(CURDATE(), INTERVAL 5 DAY)),
('ann-006','New Coffee Machine in Pantry','A new espresso machine has been installed on the 4th floor. Please clean up after use.','Suresh Pillai','All',NULL,'Low',                                  DATE_ADD(CURDATE(), INTERVAL 10 DAY)),
('ann-007','Mandatory POSH Training','All employees must complete the POSH compliance training by month-end. Link shared via email.','Maya Iyer','All',NULL,'Urgent',                              DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
('ann-008','Performance Review Cycle Opens','Self-assessment forms are now live. Manager reviews due by the 25th.','Anil Kapoor','All',NULL,'High',                                                   DATE_ADD(CURDATE(), INTERVAL 25 DAY)),
('ann-009','New Hires Welcome','Please welcome 5 new joiners this week across Engineering, Sales, and Design. See the intranet for intros.','Diya Patel','All',NULL,'Normal',                       DATE_ADD(CURDATE(), INTERVAL 14 DAY)),
('ann-010','VPN Maintenance Saturday Night','VPN servers will be down between 11 PM and 2 AM Saturday for upgrades. Plan accordingly.','Sandeep Khanna','All',NULL,'Normal',                       DATE_ADD(CURDATE(), INTERVAL 3 DAY));

-- =====================================================
-- 8) HOLIDAYS — for current year
-- =====================================================
INSERT IGNORE INTO holidays (id, `date`, name, type, description) VALUES
('hol-rep',    CONCAT(YEAR(CURDATE()),'-01-26'), 'Republic Day',       'National', 'Republic Day of India'),
('hol-holi',   CONCAT(YEAR(CURDATE()),'-03-14'), 'Holi',               'National', 'Festival of colours'),
('hol-rama',   CONCAT(YEAR(CURDATE()),'-04-10'), 'Ram Navami',         'Regional', 'Birth of Lord Rama'),
('hol-may',    CONCAT(YEAR(CURDATE()),'-05-01'), 'May Day',            'National', 'Labour Day'),
('hol-buddha', CONCAT(YEAR(CURDATE()),'-05-23'), 'Buddha Purnima',     'Optional', 'Buddha''s birthday'),
('hol-eid',    CONCAT(YEAR(CURDATE()),'-06-07'), 'Eid ul-Fitr',        'National', 'End of Ramadan'),
('hol-found',  CONCAT(YEAR(CURDATE()),'-07-10'), 'Foundation Day',     'Company',  'PeopleHub anniversary'),
('hol-ind',    CONCAT(YEAR(CURDATE()),'-08-15'), 'Independence Day',   'National', 'Independence Day of India'),
('hol-janm',   CONCAT(YEAR(CURDATE()),'-08-26'), 'Janmashtami',        'Regional', 'Birth of Lord Krishna'),
('hol-gan',    CONCAT(YEAR(CURDATE()),'-09-07'), 'Ganesh Chaturthi',   'Regional', 'Ganesh festival'),
('hol-gan2',   CONCAT(YEAR(CURDATE()),'-10-02'), 'Gandhi Jayanti',     'National', 'Mahatma Gandhi''s birthday'),
('hol-duss',   CONCAT(YEAR(CURDATE()),'-10-23'), 'Dussehra',           'National', 'Victory of good over evil'),
('hol-diw',    CONCAT(YEAR(CURDATE()),'-11-01'), 'Diwali',             'National', 'Festival of lights'),
('hol-guru',   CONCAT(YEAR(CURDATE()),'-11-15'), 'Guru Nanak Jayanti', 'Regional', 'Birth of Guru Nanak'),
('hol-xmas',   CONCAT(YEAR(CURDATE()),'-12-25'), 'Christmas',          'National', 'Christmas Day'),
('hol-anniv',  CONCAT(YEAR(CURDATE()),'-12-30'), 'Year-end Party',     'Company',  'Annual employee meet'),
('hol-onam',   CONCAT(YEAR(CURDATE()),'-09-14'), 'Onam',               'Optional', 'Kerala harvest festival');

-- =====================================================
-- 9) ASSETS
-- =====================================================
INSERT IGNORE INTO assets (id, name, category, serial_no, assigned_to, assigned_on, returned_on, status, notes) VALUES
('ast-001','MacBook Pro 14" M3',     'Laptop',     'MBP14-M3-001','e-1001', DATE_SUB(CURDATE(), INTERVAL 200 DAY), NULL,'Assigned',  'M3 Pro, 16GB / 512GB'),
('ast-002','Dell XPS 15',            'Laptop',     'DELLXPS15-22','e-1002', DATE_SUB(CURDATE(), INTERVAL 300 DAY), NULL,'Assigned',  'i7, 32GB / 1TB'),
('ast-003','iPhone 15 Pro',          'Phone',      'IPH15PRO-09', 'e-1003', DATE_SUB(CURDATE(), INTERVAL 90 DAY),  NULL,'Assigned',  '256GB, work line'),
('ast-004','LG UltraFine 27" 4K',    'Monitor',    'LGUF27-22',   NULL,     NULL,                                  NULL,'Available', 'Spare 4K display'),
('ast-005','Access Card #A12',       'Access Card','AC-A12',      'e-1005', DATE_SUB(CURDATE(), INTERVAL 30 DAY),  NULL,'Assigned',  'Floor 4 + parking'),
('ast-006','MacBook Air M2',         'Laptop',     'MBA-M2-007',  NULL,     NULL,                                  NULL,'In Repair', 'Battery service at Apple'),
('ast-007','Samsung Galaxy S24',     'Phone',      'SGS24-101',   'e-1008', DATE_SUB(CURDATE(), INTERVAL 60 DAY),  NULL,'Assigned',  '128GB, sales phone'),
('ast-008','HP EliteBook 840',       'Laptop',     'HPEB840-15',  'e-1009', DATE_SUB(CURDATE(), INTERVAL 400 DAY), NULL,'Assigned',  'i7, 16GB / 512GB'),
('ast-009','Dell U2723QE Monitor',   'Monitor',    'DELLU27-31',  'e-1007', DATE_SUB(CURDATE(), INTERVAL 180 DAY), NULL,'Assigned',  '4K, USB-C hub'),
('ast-010','iPad Pro 12.9"',         'Tablet',     'IPADPRO-44',  'e-1011', DATE_SUB(CURDATE(), INTERVAL 120 DAY), NULL,'Assigned',  'Design tablet with Pencil'),
('ast-011','Honda City',             'Vehicle',    'KA01AB1234',  'e-1015', DATE_SUB(CURDATE(), INTERVAL 500 DAY), NULL,'Assigned',  'Company car for operations'),
('ast-012','MacBook Pro 16" M3 Max', 'Laptop',     'MBP16-M3MAX', 'e-1025', DATE_SUB(CURDATE(), INTERVAL 100 DAY), NULL,'Assigned',  'Tech lead workstation'),
('ast-013','Wacom Cintiq 22',        'Other',      'WAC-CIN22-7', 'e-1016', DATE_SUB(CURDATE(), INTERVAL 250 DAY), NULL,'Assigned',  'Design drawing tablet'),
('ast-014','Logitech MX Master 3',   'Other',      'MXM3-50',     NULL,     NULL,                                  NULL,'Available', 'Spare wireless mouse'),
('ast-015','OnePlus 11',             'Phone',      'OP11-99',     'e-1018', DATE_SUB(CURDATE(), INTERVAL 45 DAY),  NULL,'Assigned',  '256GB'),
('ast-016','Lenovo ThinkPad X1',     'Laptop',     'TPX1-77',     NULL,     NULL,                                  DATE_SUB(CURDATE(), INTERVAL 20 DAY),'Retired','End of life — disposed'),
('ast-017','Microsoft Surface Pro',  'Tablet',     'SURFACE-12',  NULL,     NULL,                                  NULL,'Available', 'Loaner for travel');

-- =====================================================
-- 10) CANDIDATES — full recruitment pipeline
-- =====================================================
INSERT IGNORE INTO candidates (id, name, email, phone, position, department, stage, source, applied_on, expected_salary, notes) VALUES
('cnd-001','Rhea Kapoor',     'rhea.k@gmail.com',     '+91 98765 10001','Frontend Engineer',  'Engineering',      'Hired',     'LinkedIn',  DATE_SUB(CURDATE(), INTERVAL 60 DAY), 1100000,'Joined as EMP1006'),
('cnd-002','Aditya Verma',    'aditya.v@gmail.com',   '+91 98765 10002','Sales Executive',    'Sales',            'Screening', 'Referral',  DATE_SUB(CURDATE(), INTERVAL 4 DAY),   700000,'5 years SaaS sales'),
('cnd-003','Meera Iyer',      'meera.iyer@gmail.com', '+91 98765 10003','HR Generalist',      'Human Resources',  'Applied',   'Job Board', DATE_SUB(CURDATE(), INTERVAL 2 DAY),   600000, NULL),
('cnd-004','Karan Malhotra',  'karan.m@gmail.com',    '+91 98765 10004','Senior Designer',    'Marketing',        'Hired',     'LinkedIn',  DATE_SUB(CURDATE(), INTERVAL 80 DAY), 1400000,'Joined as EMP1011'),
('cnd-005','Sneha Joshi',     'sneha.j@gmail.com',    '+91 98765 10005','Accountant',         'Finance',          'Rejected',  'Referral',  DATE_SUB(CURDATE(), INTERVAL 18 DAY),  550000,'Skill mismatch'),
('cnd-006','Vikas Sharma',    'vikas.s@gmail.com',    '+91 98765 10006','DevOps Engineer',    'Engineering',      'Interview', 'Naukri',    DATE_SUB(CURDATE(), INTERVAL 7 DAY),  1200000,'Strong AWS/K8s background'),
('cnd-007','Anita Roy',       'anita.r@gmail.com',    '+91 98765 10007','Product Manager',    'Engineering',      'Offer',     'LinkedIn',  DATE_SUB(CURDATE(), INTERVAL 25 DAY), 1800000,'Offer extended at 18L'),
('cnd-008','Rajiv Kumar',     'rajiv.k@gmail.com',    '+91 98765 10008','Customer Success',   'Customer Support', 'Interview', 'Walk-in',   DATE_SUB(CURDATE(), INTERVAL 5 DAY),   650000,'Good communication'),
('cnd-009','Pooja Sharma',    'pooja.sh@gmail.com',   '+91 98765 10009','Content Writer',     'Marketing',        'Applied',   'Job Board', DATE_SUB(CURDATE(), INTERVAL 1 DAY),   500000,'Sample writing requested'),
('cnd-010','Amit Singh',      'amit.s@gmail.com',     '+91 98765 10010','Backend Engineer',   'Engineering',      'Screening', 'Referral',  DATE_SUB(CURDATE(), INTERVAL 3 DAY),  1500000,'7 yrs experience'),
('cnd-011','Neha Gupta',      'neha.g@gmail.com',     '+91 98765 10011','Legal Associate',    'Legal',            'Interview', 'LinkedIn',  DATE_SUB(CURDATE(), INTERVAL 10 DAY),  900000,'Corporate law specialist'),
('cnd-012','Suraj Patil',     'suraj.p@gmail.com',    '+91 98765 10012','System Admin',       'IT & Admin',       'Offer',     'Naukri',    DATE_SUB(CURDATE(), INTERVAL 14 DAY),  850000,'Awaiting response'),
('cnd-013','Anjali Verma',    'anjali.v@gmail.com',   '+91 98765 10013','QA Engineer',        'Engineering',      'Rejected',  'Job Board', DATE_SUB(CURDATE(), INTERVAL 30 DAY),  800000,'Did not clear technical'),
('cnd-014','Rohit Bansal',    'rohit.b@gmail.com',    '+91 98765 10014','Sales Manager',      'Sales',            'Interview', 'Referral',  DATE_SUB(CURDATE(), INTERVAL 12 DAY), 1600000,'Final round scheduled'),
('cnd-015','Kavita Reddy',    'kavita.r@gmail.com',   '+91 98765 10015','UX Researcher',      'Design',           'Applied',   'LinkedIn',  DATE_SUB(CURDATE(), INTERVAL 1 DAY),   950000,'PhD in HCI');

-- =====================================================
-- 11) REVIEWS — performance reviews
-- =====================================================
INSERT IGNORE INTO reviews (id, employee_id, period, reviewer, rating, strengths, improvements, goals, status, reviewed_on) VALUES
('rev-001','e-1001', CONCAT(YEAR(CURDATE()),'-Q1'),'Priya Sharma',4.5,'Strong ownership, mentors juniors, ships consistently','Could improve cross-team comms','Lead the new billing module rewrite','Acknowledged', DATE_SUB(CURDATE(), INTERVAL 30 DAY)),
('rev-002','e-1003', CONCAT(YEAR(CURDATE()),'-Q1'),'Rohan Mehta', 4.0,'Hit 110% of quota, great client rapport',              'Pipeline forecasting needs work', 'Build a junior SDR pod',           'Submitted',    DATE_SUB(CURDATE(), INTERVAL 20 DAY)),
('rev-003','e-1005', CONCAT(YEAR(CURDATE()),'-Q1'),'Sara Khan',   3.5,'Creative output is solid',                              'Improve turnaround time on briefs','Own the quarterly content calendar end-to-end','Draft',  NULL),
('rev-004','e-1006', CONCAT(YEAR(CURDATE()),'-Q1'),'Priya Sharma',4.2,'Quick learner, good React skills',                      'Needs to communicate blockers earlier','Ship the new dashboard by month end','Submitted', DATE_SUB(CURDATE(), INTERVAL 15 DAY)),
('rev-005','e-1007', CONCAT(YEAR(CURDATE()),'-Q1'),'Priya Sharma',4.8,'Excellent system design, mentors team',                 'Documentation could be more thorough','Architect the payments module','Acknowledged',     DATE_SUB(CURDATE(), INTERVAL 25 DAY)),
('rev-006','e-1009', CONCAT(YEAR(CURDATE()),'-Q1'),'Anil Kapoor', 4.3,'Accurate, reliable, great team player',                'Could take on more strategic projects','Lead the new ERP migration','Submitted',         DATE_SUB(CURDATE(), INTERVAL 18 DAY)),
('rev-007','e-1010', CONCAT(YEAR(CURDATE()),'-Q1'),'Sara Khan',   4.0,'Strong campaign ideas, good analytics',                 'Stakeholder mgmt could improve','Launch 3 new campaigns','Acknowledged',                 DATE_SUB(CURDATE(), INTERVAL 22 DAY)),
('rev-008','e-1015', CONCAT(YEAR(CURDATE()),'-Q1'),'Anil Kapoor', 4.6,'Process improvements saved 20% costs',                  'Delegate more, avoid bottlenecks','Roll out new vendor mgmt tool','Submitted',            DATE_SUB(CURDATE(), INTERVAL 12 DAY)),
('rev-009','e-1016', CONCAT(YEAR(CURDATE()),'-Q1'),'Sara Khan',   4.7,'Outstanding visual design, brand consistency',          'Mentorship time could increase','Hire 2 junior designers','Acknowledged',                 DATE_SUB(CURDATE(), INTERVAL 28 DAY)),
('rev-010','e-1025', CONCAT(YEAR(CURDATE()),'-Q1'),'Anil Kapoor', 4.9,'Exceptional technical leadership',                      'Could write more technical blogs','Lead platform modernization','Acknowledged',           DATE_SUB(CURDATE(), INTERVAL 10 DAY)),
('rev-011','e-1002', CONCAT(YEAR(CURDATE()),'-Q1'),'Anil Kapoor', 4.4,'Empathetic, great with employee concerns',              'HRIS automation knowledge gap','Roll out new HRMS platform','Submitted',                   DATE_SUB(CURDATE(), INTERVAL 14 DAY)),
('rev-012','e-1011', CONCAT(YEAR(CURDATE()),'-Q1'),'Anjali Desai',4.1,'Strong UI sense, prototypes quickly',                   'Design system contributions',     'Build the new component library',  'Draft',     NULL);

-- =====================================================
-- 12) DOCUMENTS
-- =====================================================
INSERT IGNORE INTO documents (id, employee_id, title, category, file_url, notes, uploaded_on) VALUES
('doc-001','e-1001','Offer Letter — Aarav Singh',     'Offer Letter','https://example.com/docs/offer-aarav.pdf',    'Signed copy', DATE_SUB(CURDATE(), INTERVAL 400 DAY)),
('doc-002','e-1001','PAN Card',                       'ID Proof',    'https://example.com/docs/pan-aarav.pdf',      NULL,          DATE_SUB(CURDATE(), INTERVAL 400 DAY)),
('doc-003','e-1001','Aadhaar Card',                   'ID Proof',    'https://example.com/docs/aadhaar-aarav.pdf', NULL,          DATE_SUB(CURDATE(), INTERVAL 400 DAY)),
('doc-004','e-1002','Contract — Diya Patel',          'Contract',    'https://example.com/docs/contract-diya.pdf', '3-year contract', DATE_SUB(CURDATE(), INTERVAL 600 DAY)),
('doc-005','e-1002','Form 16 — FY 2024-25',           'Tax',         'https://example.com/docs/form16-diya-2024.pdf', NULL,        DATE_SUB(CURDATE(), INTERVAL 60 DAY)),
('doc-006','e-1003','Resume',                         'Resume',      'https://example.com/docs/resume-kabir.pdf',   NULL,          DATE_SUB(CURDATE(), INTERVAL 300 DAY)),
('doc-007','e-1003','AWS Certification',              'Certificate', 'https://example.com/docs/aws-cert-kabir.pdf','Solutions Architect Associate', DATE_SUB(CURDATE(), INTERVAL 90 DAY)),
('doc-008','e-1006','Offer Letter — Rhea Kapoor',     'Offer Letter','https://example.com/docs/offer-rhea.pdf',     NULL,          DATE_SUB(CURDATE(), INTERVAL 200 DAY)),
('doc-009','e-1006','Payslip — Last Month',           'Payslip',     'https://example.com/docs/payslip-rhea.pdf',   NULL,          DATE_SUB(CURDATE(), INTERVAL 30 DAY)),
('doc-010','e-1007','Resume',                         'Resume',      'https://example.com/docs/resume-arjun.pdf',   NULL,          DATE_SUB(CURDATE(), INTERVAL 500 DAY)),
('doc-011','e-1009','Contract — Rohan Gupta',         'Contract',    'https://example.com/docs/contract-rohan.pdf','Renewed 2024',  DATE_SUB(CURDATE(), INTERVAL 90 DAY)),
('doc-012','e-1015','Driving License',                'ID Proof',    'https://example.com/docs/dl-vikram.pdf',      NULL,          DATE_SUB(CURDATE(), INTERVAL 700 DAY)),
('doc-013','e-1016','Portfolio',                      'Other',       'https://example.com/docs/portfolio-anjali.pdf','Design portfolio 2024', DATE_SUB(CURDATE(), INTERVAL 150 DAY)),
('doc-014','e-1020','Bar Council Certificate',        'Certificate', 'https://example.com/docs/barcouncil-meera.pdf',NULL,         DATE_SUB(CURDATE(), INTERVAL 800 DAY)),
('doc-015','e-1025','Tech Lead Promotion Letter',     'Other',       'https://example.com/docs/promo-mohit.pdf',    'Promoted to Tech Lead', DATE_SUB(CURDATE(), INTERVAL 180 DAY));

-- =====================================================
-- 13) COMPANY SETTINGS
-- =====================================================
INSERT IGNORE INTO company_settings
(id, name, legal_name, email, phone, website, address, logo_url, currency, timezone, work_start, work_end, weekly_offs) VALUES
(1, 'PeopleHub Inc.', 'PeopleHub Technologies Pvt. Ltd.', 'hr@peoplehub.com', '+91 80 1234 5678', 'https://peoplehub.com',
 'Plot 42, 4th Floor, Outer Ring Road, Bengaluru, KA 560103', NULL, 'INR', 'Asia/Kolkata', '09:30:00', '18:30:00', 'Sat,Sun');

-- If you want to overwrite the existing settings row, run this update instead:
-- UPDATE company_settings SET
--   name='PeopleHub Inc.',
--   legal_name='PeopleHub Technologies Pvt. Ltd.',
--   email='hr@peoplehub.com',
--   phone='+91 80 1234 5678',
--   website='https://peoplehub.com',
--   address='Plot 42, 4th Floor, Outer Ring Road, Bengaluru, KA 560103',
--   currency='INR', timezone='Asia/Kolkata',
--   work_start='09:30:00', work_end='18:30:00', weekly_offs='Sat,Sun'
-- WHERE id=1;

-- =====================================================
-- 14) ESSL SETTINGS (biometric device config)
-- =====================================================
INSERT IGNORE INTO essl_settings (id, device_ip, device_port, comm_password, enabled) VALUES
(1, '192.168.1.201', 4370, '0', 0);

-- Link some employees to eSSL device user IDs (only useful if you have a real device)
UPDATE employees SET essl_user_id = '1001' WHERE id = 'e-1001' AND essl_user_id IS NULL;
UPDATE employees SET essl_user_id = '1002' WHERE id = 'e-1002' AND essl_user_id IS NULL;
UPDATE employees SET essl_user_id = '1003' WHERE id = 'e-1003' AND essl_user_id IS NULL;
UPDATE employees SET essl_user_id = '1006' WHERE id = 'e-1006' AND essl_user_id IS NULL;
UPDATE employees SET essl_user_id = '1007' WHERE id = 'e-1007' AND essl_user_id IS NULL;

-- =====================================================
-- 15) WEBAUTHN — fingerprint credentials
--    NOTE: real credentials are generated by the app during registration.
--    These rows are placeholders for testing the table layout only.
-- =====================================================
-- INSERT IGNORE INTO webauthn_credentials (id, employee_id, public_key, counter, device_name, transports) VALUES
-- ('test-cred-1','e-1001','PLACEHOLDER_PUBLIC_KEY_BASE64URL', 0, 'iPhone 15 Pro - Face ID', 'internal,hybrid');

-- =====================================================
-- VERIFICATION — run after the inserts above
-- =====================================================
SELECT
  (SELECT COUNT(*) FROM departments)          AS departments,
  (SELECT COUNT(*) FROM employees)            AS employees,
  (SELECT COUNT(*) FROM users)                AS users,
  (SELECT COUNT(*) FROM attendance)           AS attendance,
  (SELECT COUNT(*) FROM leaves)               AS `leaves`,
  (SELECT COUNT(*) FROM payroll)              AS payroll,
  (SELECT COUNT(*) FROM announcements)        AS announcements,
  (SELECT COUNT(*) FROM holidays)             AS holidays,
  (SELECT COUNT(*) FROM assets)               AS assets,
  (SELECT COUNT(*) FROM candidates)           AS candidates,
  (SELECT COUNT(*) FROM reviews)              AS reviews,
  (SELECT COUNT(*) FROM documents)            AS documents,
  (SELECT COUNT(*) FROM company_settings)     AS settings,
  (SELECT COUNT(*) FROM essl_settings)        AS essl;
