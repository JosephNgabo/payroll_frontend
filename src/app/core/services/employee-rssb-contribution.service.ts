import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EmployeeRssbContribution } from '../models/employee-rssb-contribution.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeRssbContributionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createRssbContribution(employeeId: string, contribution: EmployeeRssbContribution): Observable<any> {
    return this.http.post(`${this.apiUrl}/employee-rssb-contribution/${employeeId}`, contribution);
  }

  getEmployeeRssbContributions(employeeId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/employee-rssb-contribution/${employeeId}`);
  }

  updateEmployeeRssbContribution(contributionId: string, contribution: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/employee-rssb-contribution/${contributionId}`, contribution);
  }
} 