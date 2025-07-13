import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeInformation } from '../models/employee-information.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeInformationService {
  private readonly API_URL = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  createEmployeeInformation(data: EmployeeInformation): Observable<any> {
    return this.http.post(`${this.API_URL}/employee-information`, data);
  }

  updateEmployeeInformation(id: string, data: any): Observable<any> {
    return this.http.put(`${this.API_URL}/employee-information/${id}`, data);
  }

  getCountries(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/countries`);
  }

  getEmployees(page: number = 1): Observable<{ status: boolean; message: string; data: EmployeeInformation[]; current_page: number; last_page: number; total: number; per_page: number; }> {
    return this.http.get<{ status: boolean; message: string; data: EmployeeInformation[]; current_page: number; last_page: number; total: number; per_page: number; }>(`${this.API_URL}/employee-information?page=${page}`);
  }

  getEmployeeById(id: string): Observable<EmployeeInformation> {
    return this.http.get<EmployeeInformation>(`${this.API_URL}/employee-information/${id}`);
  }
}
