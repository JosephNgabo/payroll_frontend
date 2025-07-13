export interface EmployeeContract {
  department: string; // UUID of the department
  job_title: string;
  employment_type: string;
  hire_date: string; // ISO date string (YYYY-MM-DD)
  salary_basis: string;
  salary_amount: number;
  salary_frequency: string;
  employee_id: string; // UUID of the employee
} 