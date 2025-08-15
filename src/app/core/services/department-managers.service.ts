import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface DepartmentManager {
  id: string;
  department_id: string;
  manager_id: string;
  assigned_at: string;
  assigned_by: {
    id: string;
    id_util: number;
    firstname: string;
    lastname: string;
    username: string;
    phone: string;
    title: string;
    email: string;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    is_active: boolean;
    login_attempts: number;
    avatar: string | null;
    language: string;
    user_profile: string;
  };
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  department: {
    id: string;
    department_name: string;
    department_description: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  manager: {
    id: string;
    id_util: number;
    firstname: string;
    lastname: string;
    username: string;
    phone: string;
    title: string;
    email: string;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    is_active: boolean;
    login_attempts: number;
    avatar: string | null;
    language: string;
    user_profile: string;
  };
}

export interface AssignDepartmentManagerRequest {
  department_id: string;
  manager_id: string;
}

export interface DepartmentManagersResponse {
  status: boolean;
  message: string;
  data: {
    current_page: number;
    data: DepartmentManager[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface AssignDepartmentManagerResponse {
  status: boolean;
  message: string;
  data: DepartmentManager;
}

export interface ValidationError {
  [key: string]: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentManagersService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get all department managers
   */
  getDepartmentManagers(): Observable<DepartmentManager[]> {
    return this.http.get<DepartmentManagersResponse>(`${this.apiUrl}/department-managers`)
      .pipe(
        map(response => response.data.data),
        catchError(this.handleError)
      );
  }

  /**
   * Get department managers for a specific department
   */
  getDepartmentManagersByDepartment(departmentId: string): Observable<DepartmentManager[]> {
    return this.http.get<DepartmentManagersResponse>(`${this.apiUrl}/department-managers?department_id=${departmentId}`)
      .pipe(
        map(response => response.data.data),
        catchError(this.handleError)
      );
  }

  /**
   * Assign a manager to a department
   */
  assignDepartmentManager(request: AssignDepartmentManagerRequest): Observable<DepartmentManager> {
    return this.http.post<AssignDepartmentManagerResponse>(`${this.apiUrl}/department-managers/assign`, request)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Remove a manager from a department
   */
  removeDepartmentManager(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/department-managers/${id}`)
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
