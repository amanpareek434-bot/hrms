-- =====================================================
-- PeopleHub HRMS — Migration v6 (WebAuthn / Fingerprint Attendance)
-- Lets employees enroll their phone's fingerprint/Face ID
-- and use it to mark attendance.
-- =====================================================

USE peoplehub_hrms;

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

-- Short-lived challenge cache (5 minute validity).
-- We only need 1 active challenge per employee at a time.
CREATE TABLE IF NOT EXISTS webauthn_challenges (
  employee_id     VARCHAR(40)  NOT NULL PRIMARY KEY,
  challenge       VARCHAR(255) NOT NULL,
  kind            ENUM('register','auth') NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wch_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SELECT 'Done — webauthn tables ready' AS info;
SHOW TABLES LIKE 'webauthn_%';
