import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EmployeeAllowance } from '../models/employee-allowance.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeAllowanceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createEmployeeAllowance(employeeId: string, allowance: EmployeeAllowance): Observable<any> {
    return this.http.post(`${this.apiUrl}/employee-allowance/${employeeId}`, allowance);
  }

  updateEmployeeAllowance(employeeId: string, allowanceId: string, allowance: EmployeeAllowance): Observable<any> {
    return this.http.put(`${this.apiUrl}/employee-allowance/${allowanceId}`, allowance);
  }

  getEmployeeAllowances(employeeId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/employee-allowance/${employeeId}`);
  }
} 