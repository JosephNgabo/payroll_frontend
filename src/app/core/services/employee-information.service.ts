import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeInformation } from '../models/employee-information.model';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EmployeeInformationService {
  private readonly API_URL = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  createEmployeeInformation(data: EmployeeInformation): Observable<any> {
    return this.http.post(`${this.API_URL}/employee-information`, data)
      .pipe(catchError(this.handleError));
  }

  updateEmployeeInformation(id: string, data: any): Observable<any> {
    return this.http.put(`${this.API_URL}/employee-information/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  getCountries(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/countries`)
      .pipe(catchError(this.handleError));
  }

  getEmployees(page: number = 1): Observable<{ status: boolean; message: string; data: EmployeeInformation[]; current_page: number; last_page: number; total: number; per_page: number; }> {
    return this.http.get<{ status: boolean; message: string; data: EmployeeInformation[]; current_page: number; last_page: number; total: number; per_page: number; }>(`${this.API_URL}/employee-information?page=${page}`)
      .pipe(catchError(this.handleError));
  }

  getEmployeeById(id: string): Observable<EmployeeInformation> {
    return this.http.get<EmployeeInformation>(`${this.API_URL}/employee-information/${id}`)
      .pipe(catchError(this.handleError));
  }

  deleteEmployee(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/employee-information/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Handle HTTP errors and extract backend validation messages
   */
  private handleError(error: any) {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    if (error && error.error) {
      if (error.error.errors) {
        // Laravel validation errors
        errorMessage = error.error.errors;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      }
    } else if (error && error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    console.error('EmployeeInformationService Error:', error);
    return throwError(() => errorMessage);
  }
}
