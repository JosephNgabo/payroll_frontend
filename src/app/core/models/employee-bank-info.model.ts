export interface EmployeeBankInfo {
  id?: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  iban?: string;
  swift_code?: string;
  employee_id?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
} 