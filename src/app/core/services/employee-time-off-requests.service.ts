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
  approval_status?: string; // Add approval_status field
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

export interface CancelRequestPayload {
  reason: string;
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
    return this.http.get(`${this.apiUrl}/employee-time-off-requests/employee/${employeeId}`, { responseType: 'text' })
      .pipe(
        map(response => {
          // Handle malformed JSON response from backend
          let jsonResponse: any;
          
          if (typeof response === 'string') {
            // Try to extract JSON from malformed response
            const jsonMatch = response.match(/\{.*\}/s);
            if (jsonMatch) {
              try {
                jsonResponse = JSON.parse(jsonMatch[0]);
                console.log('✅ Successfully parsed malformed JSON response for get requests:', jsonResponse);
              } catch (e) {
                console.error('❌ Failed to parse extracted JSON for get requests:', e);
                throw new Error('Invalid JSON response from server');
              }
            } else {
              console.error('❌ No JSON found in response for get requests:', response);
              throw new Error('No valid JSON found in response');
            }
          } else {
            jsonResponse = response;
          }
          
          if (jsonResponse.status && jsonResponse.data) {
            return jsonResponse.data;
          } else {
            throw new Error(jsonResponse.message || 'Invalid response format');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Create a new time-off request
   */
  createEmployeeTimeOffRequest(request: CreateEmployeeTimeOffRequestRequest): Observable<EmployeeTimeOffRequest> {
    return this.http.post(`${this.apiUrl}/employee-time-off-requests`, request, { responseType: 'text' })
      .pipe(
        map(response => {
          // Handle malformed JSON response from backend
          let jsonResponse: any;
          
          if (typeof response === 'string') {
            // Try to extract JSON from malformed response
            const jsonMatch = response.match(/\{.*\}/s);
            if (jsonMatch) {
              try {
                jsonResponse = JSON.parse(jsonMatch[0]);
                console.log('✅ Successfully parsed malformed JSON response:', jsonResponse);
              } catch (e) {
                console.error('❌ Failed to parse extracted JSON:', e);
                throw new Error('Invalid JSON response from server');
              }
            } else {
              console.error('❌ No JSON found in response:', response);
              throw new Error('No valid JSON found in response');
            }
          } else {
            jsonResponse = response;
          }
          
          if (jsonResponse.status && jsonResponse.data) {
            return jsonResponse.data;
          } else {
            throw new Error(jsonResponse.message || 'Invalid response format');
          }
        }),
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
   * Cancel a time-off request
   * POST /api/employee-time-off-requests/{id}/cancel
   */
  cancelEmployeeTimeOffRequest(id: string, payload: CancelRequestPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/employee-time-off-requests/${id}/cancel`, payload)
      .pipe(
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
    
    // Log the raw error for debugging
    console.error('🔍 Raw API Error:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.message,
      error: error.error,
      errorText: error.error?.text || error.error?.toString()
    });
    
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
      } else if (error.status === 0) {
        // Network error or CORS issue
        errorMessage = 'Network error - unable to connect to the server';
      } else if (error.status === 404) {
        // Endpoint not found
        errorMessage = `API endpoint not found: ${error.url}`;
      } else if (error.status === 500) {
        // Server error
        errorMessage = 'Server error - please try again later';
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    return throwError({ message: errorMessage, errors: error.error?.errors });
  }
}
