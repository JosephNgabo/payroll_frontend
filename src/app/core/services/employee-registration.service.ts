import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EmployeeRegistrationRequest {
  email: string;
}

export interface EmployeeRegistrationResponse {
  message: string;
  status: boolean;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeRegistrationService {
  private readonly API_URL = `${environment.apiUrl}/user/register-employee`;

  constructor(private http: HttpClient) {}

  /**
   * Register employee with email
   * @param email Employee's email address
   * @returns Observable with registration response
   */
  registerEmployee(email: string): Observable<EmployeeRegistrationResponse> {
    const payload: EmployeeRegistrationRequest = { email };
    
    console.log('EmployeeRegistrationService - Registering employee with email:', email);
    
    return this.http.post<EmployeeRegistrationResponse>(this.API_URL, payload);
  }

  /**
   * Check if email is valid format
   * @param email Email to validate
   * @returns boolean indicating if email is valid
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
