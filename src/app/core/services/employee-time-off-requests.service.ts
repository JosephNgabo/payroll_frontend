import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface EmployeeTimeOffRequest {
  id: string;
  employee_id: string;
  time_off_type_id: string;
  start_date: string;
  end_date: string;
  requested_days: number;
  time_off_period?: number;
  reason: string;
  status: string;
  created_at: string;
  updated_at: string;
  time_off_type?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface CreateEmployeeTimeOffRequestRequest {
  employee_id: string;
  time_off_type_id: string;
  start_date: string;
  end_date: string;
  requested_days: number;
  time_off_period?: number;
  reason: string;
}

export interface EmployeeTimeOffRequestsResponse {
  status: boolean;
  message: string;
  data: EmployeeTimeOffRequest[];
}

export interface CreateEmployeeTimeOffRequestResponse {
  status: boolean;
  message: string;
  data: EmployeeTimeOffRequest;
}

export interface ValidationError {
  [key: string]: string[];
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeTimeOffRequestsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get all time-off requests for an employee
   */
  getEmployeeTimeOffRequests(employeeId: string): Observable<EmployeeTimeOffRequest[]> {
    return this.http.get<EmployeeTimeOffRequestsResponse>(`${this.apiUrl}/employee-time-off-requests/employee/${employeeId}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Create a new time-off request
   */
  createEmployeeTimeOffRequest(request: CreateEmployeeTimeOffRequestRequest): Observable<EmployeeTimeOffRequest> {
    return this.http.post<CreateEmployeeTimeOffRequestResponse>(`${this.apiUrl}/employee-time-off-requests`, request)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Get a specific time-off request by ID
   */
  getEmployeeTimeOffRequest(id: string): Observable<EmployeeTimeOffRequest> {
    return this.http.get<CreateEmployeeTimeOffRequestResponse>(`${this.apiUrl}/employee-time-off-requests/${id}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Update a time-off request
   */
  updateEmployeeTimeOffRequest(id: string, request: Partial<CreateEmployeeTimeOffRequestRequest>): Observable<EmployeeTimeOffRequest> {
    return this.http.put<CreateEmployeeTimeOffRequestResponse>(`${this.apiUrl}/employee-time-off-requests/${id}`, request)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Delete a time-off request
   */
  deleteEmployeeTimeOffRequest(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/employee-time-off-requests/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Handle errors from API calls
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 422 && error.error && error.error.errors) {
        // Validation errors
        return throwError(error.error);
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    return throwError({ message: errorMessage, errors: error.error?.errors });
  }
}
