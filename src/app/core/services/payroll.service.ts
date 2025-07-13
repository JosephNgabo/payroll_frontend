import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PayrollData {
  employee_id: string;
  basic_salary: string;
  total_allowances: number;
  gross_salary: number;
  total_rssb_employee_contributions: number;
  total_rssb_employer_contributions: number;
  total_mandatory_employee_deductions: number;
  total_other_deductions: number;
  total_paye: number;
  net_salary: number;
  transport_allowance: number;
  rssb_details: any[];
  allowance_details: any[];
  other_deduction_details: any[];
}

export interface PayrollResponse {
  status: boolean;
  message: string;
  data: PayrollData[];
}

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  generatePayroll(payload?: any): Observable<PayrollResponse> {
    return this.http.post<PayrollResponse>(`${this.apiUrl}/payroll/generate`, payload || {});
  }
} 