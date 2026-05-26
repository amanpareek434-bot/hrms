export type EmployeeStatus = "Active" | "On Leave" | "Resigned" | "Terminated";

export interface Employee {
  id: string;
  employeeCode: string;
  esslUserId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: string; // ISO date
  dateOfBirth?: string; // ISO date
  salary: number;
  status: EmployeeStatus;
  address?: string;
}

export type AttendanceStatus = "Present" | "Absent" | "Half Day" | "Leave" | "Holiday";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:MM
  checkOut?: string; // HH:MM
  status: AttendanceStatus;
  notes?: string;
}

export type LeaveType = "Casual" | "Sick" | "Earned" | "Unpaid" | "Maternity" | "Paternity";
export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  description?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string; // YYYY-MM
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
  net: number;
  paid: boolean;
}

export type AnnouncementPriority = "Low" | "Normal" | "High" | "Urgent";
export type AnnouncementTarget = "All" | "Department";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  postedBy: string;
  target: AnnouncementTarget;
  targetDept?: string;
  priority: AnnouncementPriority;
  postedAt: string;
  expiresAt?: string;
}

export type HolidayType = "National" | "Regional" | "Company" | "Optional";

export interface Holiday {
  id: string;
  date: string;
  name: string;
  type: HolidayType;
  description?: string;
}

export type AssetCategory =
  | "Laptop"
  | "Desktop"
  | "Phone"
  | "Tablet"
  | "Monitor"
  | "Access Card"
  | "Vehicle"
  | "Other";
export type AssetStatus = "Available" | "Assigned" | "In Repair" | "Retired";

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  serialNo?: string;
  assignedTo?: string; // employee id
  assignedOn?: string;
  returnedOn?: string;
  status: AssetStatus;
  notes?: string;
}

export type CandidateStage =
  | "Applied"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Hired"
  | "Rejected";

export interface Candidate {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position: string;
  department?: string;
  stage: CandidateStage;
  source?: string;
  appliedOn?: string;
  expectedSalary?: number;
  notes?: string;
}

export type DocumentCategory =
  | "Offer Letter"
  | "Contract"
  | "ID Proof"
  | "Resume"
  | "Certificate"
  | "Payslip"
  | "Tax"
  | "Other";

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  title: string;
  category: DocumentCategory;
  fileUrl?: string;
  notes?: string;
  uploadedOn?: string;
}

export interface CompanySettings {
  name: string;
  legalName?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  logoUrl?: string;
  currency: string;
  timezone: string;
  workStart: string;
  workEnd: string;
  weeklyOffs: string;
}

export type ReviewStatus = "Draft" | "Submitted" | "Acknowledged";

export interface PerformanceReview {
  id: string;
  employeeId: string;
  period: string; // 2026-Q1 / 2026-H1 / 2026
  reviewer?: string;
  rating?: number;
  strengths?: string;
  improvements?: string;
  goals?: string;
  status: ReviewStatus;
  reviewedOn?: string;
}
