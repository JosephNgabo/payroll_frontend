export interface EmployeeDeduction {
  id?: string;
  description?: string;
  amount: number;
  type: string;
  deduction_id: string;
  employee_id?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
} 