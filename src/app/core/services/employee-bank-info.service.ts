import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EmployeeBankInfo } from '../models/employee-bank-info.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeBankInfoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createEmployeeBankInfo(employeeId: string, bankInfo: EmployeeBankInfo): Observable<any> {
    return this.http.post(`${this.apiUrl}/employee-bank-info/${employeeId}`, bankInfo);
  }

  getEmployeeBankInfo(employeeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/employee-bank-info/${employeeId}`);
  }

  updateEmployeeBankInfo(bankInfoId: string, bankInfo: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/employee-bank-info/${bankInfoId}`, bankInfo);
  }
} 