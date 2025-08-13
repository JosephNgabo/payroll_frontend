// Employee Portal Models

export interface EmployeePortalUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  employeeId: string;
  joinDate: string;
  manager: string;
  address: string;
  profilePicture?: string;
  emergencyContact: EmergencyContact;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  comments?: string;
}

export interface LeaveBalance {
  type: LeaveType;
  total: number;
  used: number;
  remaining: number;
  carryOver?: number;
}

export interface Payslip {
  id: string;
  employeeId: string;
  period: PayrollPeriod;
  grossSalary: number;
  netSalary: number;
  basicSalary: number;
  allowances: PayslipAllowance[];
  deductions: PayslipDeduction[];
  tax: number;
  status: PayslipStatus;
  generatedDate: string;
  paidDate?: string;
}

export interface PayslipAllowance {
  name: string;
  amount: number;
  taxable: boolean;
}

export interface PayslipDeduction {
  name: string;
  amount: number;
  type: 'tax' | 'insurance' | 'loan' | 'other';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  breakStart?: string;
  breakEnd?: string;
  hoursWorked: number;
  overtimeHours: number;
  status: AttendanceStatus;
  location?: string;
  notes?: string;
}

export interface AttendanceSummary {
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  overtimeHours: number;
  attendanceRate: number;
}

export interface DashboardSummary {
  leaveBalance: number;
  attendanceRate: number;
  monthlySalary: number;
  pendingLeaveRequests: number;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: ActivityType;
  timestamp: string;
  status?: string;
  actionRequired?: boolean;
}

export interface PayrollPeriod {
  month: number;
  year: number;
  startDate: string;
  endDate: string;
}

// Enums
export type LeaveType = 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'other';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type PayslipStatus = 'draft' | 'generated' | 'sent' | 'paid';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day' | 'on-leave' | 'holiday';

export type ActivityType = 'leave' | 'payroll' | 'attendance' | 'profile' | 'system' | 'announcement';

// API Response interfaces
export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// Form interfaces
export interface LeaveRequestForm {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  halfDay?: boolean;
  halfDayPeriod?: 'morning' | 'afternoon';
}

export interface ProfileUpdateForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: EmergencyContact;
}

export interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

