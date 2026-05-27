-- =====================================================
-- PeopleHub HRMS — Migration v7 (Expenses / Reimbursements)
-- Lets employees submit bills, managers approve them,
-- and approved amounts can be auto-added to next payroll.
-- =====================================================

-- NOTE: On Railway, you're already connected to the right DB.
-- For local dev, uncomment the next line:
-- USE peoplehub_hrms;

CREATE TABLE IF NOT EXISTS expenses (
  id                VARCHAR(40)  NOT NULL PRIMARY KEY,
  employee_id       VARCHAR(40)  NOT NULL,
  expense_date      DATE         NOT NULL,
  category          VARCHAR(40)  NOT NULL DEFAULT 'Other',
  amount            DECIMAL(12,2) NOT NULL,
  currency          VARCHAR(8)   NOT NULL DEFAULT 'INR',
  merchant          VARCHAR(160),
  description       TEXT,
  attachment_url    TEXT,
  status            ENUM('Pending','Approved','Rejected','Reimbursed') NOT NULL DEFAULT 'Pending',
  approver_id       VARCHAR(40),
  approved_at       TIMESTAMP NULL,
  rejected_reason   TEXT,
  paid_in_payroll_id VARCHAR(40),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_exp_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_exp_emp (employee_id),
  INDEX idx_exp_status (status),
  INDEX idx_exp_date (expense_date)
) ENGINE=InnoDB;

SELECT 'Done — expenses table ready' AS info;
SHOW COLUMNS FROM expenses;
