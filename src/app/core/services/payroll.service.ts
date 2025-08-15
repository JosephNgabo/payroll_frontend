import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

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
    return this.http.post<PayrollResponse>(`${this.apiUrl}/payroll/generate`, payload || {})
      .pipe(catchError(this.handleError));
  }

  getPayrolls(page: number = 1): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/payroll?page=${page}`)
      .pipe(catchError(this.handleError));
  }

  getPayrollDetails(payrollId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/payroll/payslips/${payrollId}`)
      .pipe(catchError(this.handleError));
  }

  deletePayslip(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/payroll/payslip/${id}`)
      .pipe(catchError(this.handleError));
  }

  regeneratePayroll(payrollId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/payroll/${payrollId}/refresh`, {})
      .pipe(catchError(this.handleError));
  }

  deletePayroll(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/payroll/${id}`)
      .pipe(catchError(this.handleError));
  }

  getEmployeePayHistory(employeeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/payroll/employee/${employeeId}/history`)
      .pipe(catchError(this.handleError));
  }

  initiateWorkflow(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/workflow-processes/payroll/initiate`, payload)
      .pipe(catchError(this.handleError));
  }

  /**
   * Handle HTTP errors and extract backend validation messages
   */
  private handleError(error: any) {
        let errorMessage = 'An unexpected error occurred. Please try again.';
    if (error && error.error) {
      if (error.error.message || error.error.errors) {
        // Laravel validation errors
        errorMessage = error.error.message;
      }
    } else if (error && error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    console.error('PayrollService Error:', error);
    return throwError(() => errorMessage);
  }
  
} 