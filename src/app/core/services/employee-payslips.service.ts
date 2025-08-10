import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EmployeePayslip {
  id: string;
  payroll_id: string;
  payroll_date: string;
  payslip_number: string;
  basic_salary: string;
  total_allowances: string;
  total_gross_salary: string;
  total_rssb_employee_deductions: string;
  total_rssb_employer_deductions: string;
  total_other_deductions: string;
  total_paye_deductions: string;
  total_net_salary: string;
  total_mass_salary: string;
  rssb_details: string;
  allowance_details: string;
  other_deduction_details: string;
  payroll_month: number;
  payroll_year: number;
  payroll_status: number;
  employee_id: string;
  created_at: string;
  updated_at: string;
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    personal_mobile: string;
    personal_email: string;
  };
}

export interface PayslipsResponse {
  status: boolean;
  message: string;
  data: EmployeePayslip[];
}

@Injectable({
  providedIn: 'root'
})
export class EmployeePayslipsService {
  private readonly API_URL = `${environment.apiUrl}/employee/payslips`;

  constructor(private http: HttpClient) {}

  /**
   * Get employee payslips
   */
  getPayslips(): Observable<PayslipsResponse> {
    return this.http.get<PayslipsResponse>(this.API_URL);
  }

  /**
   * Download payslip
   */
  downloadPayslip(payslipId: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${payslipId}/download`, {
      responseType: 'blob'
    });
  }

  /**
   * Get payslip details
   */
  getPayslipDetails(payslipId: string): Observable<EmployeePayslip> {
    return this.http.get<EmployeePayslip>(`${this.API_URL}/${payslipId}`);
  }
}
