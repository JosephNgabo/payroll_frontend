import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TimeOffType } from './time-off-types.service';

export interface EmployeeTimeOffBalance {
  id: string;
  employee_id: string;
  time_off_type_id: string;
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
  carried_over_days: number;
  pending_days: number;
  created_at: string;
  updated_at: string;
  time_off_type: TimeOffType;
}

export interface EmployeeTimeOffBalanceResponse {
  status: boolean;
  message: string;
  data: EmployeeTimeOffBalance[];
}

export interface CreateEmployeeTimeOffBalanceRequest {
  employee_id: string;
  time_off_type_id: string;
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
  carried_over_days: number;
  pending_days: number;
}

export interface UpdateEmployeeTimeOffBalanceRequest {
  employee_id: string;
  time_off_type_id: string;
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
  carried_over_days: number;
  pending_days: number;
}

export interface CreateEmployeeTimeOffBalanceResponse {
  status: boolean;
  message: string;
  data: EmployeeTimeOffBalance;
}

export interface UpdateEmployeeTimeOffBalanceResponse {
  status: boolean;
  message: string;
  data: EmployeeTimeOffBalance;
}

export interface DeleteEmployeeTimeOffBalanceResponse {
  status: boolean;
  message: string;
  data: number;
}

export interface ValidationError {
  [key: string]: string[];
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeTimeOffBalanceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Get employee time-off balances
  getEmployeeTimeOffBalances(employeeId: string): Observable<EmployeeTimeOffBalance[]> {
    return this.http.get<EmployeeTimeOffBalanceResponse>(`${this.apiUrl}/employee-time-off-balances/employee/${employeeId}`)
      .pipe(
        map(response => {
          if (response.status) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to fetch employee time-off balances');
          }
        }),
        catchError(this.handleError)
      );
  }

  // Create new employee time-off balance
  createEmployeeTimeOffBalance(request: CreateEmployeeTimeOffBalanceRequest): Observable<CreateEmployeeTimeOffBalanceResponse> {
    return this.http.post<CreateEmployeeTimeOffBalanceResponse>(`${this.apiUrl}/employee-time-off-balances`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Update employee time-off balance
  updateEmployeeTimeOffBalance(id: string, request: UpdateEmployeeTimeOffBalanceRequest): Observable<UpdateEmployeeTimeOffBalanceResponse> {
    return this.http.put<UpdateEmployeeTimeOffBalanceResponse>(`${this.apiUrl}/employee-time-off-balances/${id}`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Delete employee time-off balance
  deleteEmployeeTimeOffBalance(id: string): Observable<DeleteEmployeeTimeOffBalanceResponse> {
    return this.http.delete<DeleteEmployeeTimeOffBalanceResponse>(`${this.apiUrl}/employee-time-off-balances/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Error handling
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 422 && error.error?.errors) {
        // Handle validation errors
        const validationErrors = error.error.errors as ValidationError;
        const errorMessages = Object.keys(validationErrors)
          .map(key => `${key}: ${validationErrors[key].join(', ')}`)
          .join('; ');
        errorMessage = errorMessages;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error && error.error.error && error.error.error.message) {
        errorMessage = error.error.error.message;
      } else {
        errorMessage = `Server returned code ${error.status}, error message is: ${error.message}`;
      }
    }
    
    console.error('EmployeeTimeOffBalanceService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
