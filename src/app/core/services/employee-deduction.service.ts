import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EmployeeDeduction } from '../models/employee-deduction.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeDeductionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createEmployeeDeduction(employeeId: string, deduction: EmployeeDeduction): Observable<any> {
    return this.http.post(`${this.apiUrl}/employee-deduction/${employeeId}`, deduction);
  }

  getEmployeeDeductions(employeeId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/employee-deduction/${employeeId}`);
  }

  updateEmployeeDeduction(deductionId: string, deduction: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/employee-deduction/${deductionId}`, deduction);
  }

  deleteEmployeeDeduction(deductionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/employee-deduction/${deductionId}`);
  }
} 