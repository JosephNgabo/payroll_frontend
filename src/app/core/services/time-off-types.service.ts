import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface TimeOffTypeKind {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface TimeOffType {
  id: string;
  code: string;
  name: string;
  kind_id: string;
  description: string;
  is_paid: boolean;
  take_time_off_in: number;
  require_supporting_document: boolean;
  requires_allocation: boolean;
  approval_type: number;
  created_at: string;
  updated_at: string;
  kind?: TimeOffTypeKind;
}

export interface TimeOffTypeResponse {
  status: boolean;
  message: string;
  data: TimeOffType[];
}

export interface CreateTimeOffTypeRequest {
  name: string;
  code: string;
  description: string;
  kind_id: string;
  is_paid: boolean;
  take_time_off_in: number;
  require_supporting_document: boolean;
  requires_allocation: boolean;
  approval_type: number;
}

export interface UpdateTimeOffTypeRequest extends CreateTimeOffTypeRequest {
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class TimeOffTypesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Get all time off types
  getTimeOffTypes(): Observable<TimeOffType[]> {
    return this.http.get(`${this.apiUrl}/time-off-types`, { responseType: 'text' })
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
                console.log('✅ Successfully parsed malformed JSON response for time-off types:', jsonResponse);
              } catch (e) {
                console.error('❌ Failed to parse extracted JSON for time-off types:', e);
                throw new Error('Invalid JSON response from server');
              }
            } else {
              console.error('❌ No JSON found in response for time-off types:', response);
              throw new Error('No valid JSON found in response');
            }
          } else {
            jsonResponse = response;
          }
          
          if (jsonResponse.status && jsonResponse.data) {
            return jsonResponse.data;
          } else {
            throw new Error(jsonResponse.message || 'Failed to fetch time off types');
          }
        }),
        catchError(this.handleError)
      );
  }

  // Get single time off type by ID
  getTimeOffType(id: string): Observable<TimeOffType> {
    return this.http.get<{ status: boolean; message: string; data: TimeOffType }>(`${this.apiUrl}/time-off-types/${id}`)
      .pipe(
        map(response => {
          if (response.status) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to fetch time off type');
          }
        }),
        catchError(this.handleError)
      );
  }

  // Create new time off type
  createTimeOffType(data: CreateTimeOffTypeRequest): Observable<TimeOffType> {
    return this.http.post<{ status: boolean; message: string; data: TimeOffType }>(`${this.apiUrl}/time-off-types`, data)
      .pipe(
        map(response => {
          if (response.status) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to create time off type');
          }
        }),
        catchError(this.handleError)
      );
  }

  // Update time off type
  updateTimeOffType(id: string, data: CreateTimeOffTypeRequest): Observable<TimeOffType> {
    return this.http.put<{ status: boolean; message: string; data: TimeOffType }>(`${this.apiUrl}/time-off-types/${id}`, data)
      .pipe(
        map(response => {
          if (response.status) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to update time off type');
          }
        }),
        catchError(this.handleError)
      );
  }

  // Delete time off type
  deleteTimeOffType(id: string): Observable<{ status: boolean; message: string }> {
    return this.http.delete<{ status: boolean; message: string }>(`${this.apiUrl}/time-off-types/${id}`)
      .pipe(
        map(response => {
          if (response.status) {
            return response;
          } else {
            throw new Error(response.message || 'Failed to delete time off type');
          }
        }),
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
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error && error.error.error && error.error.error.message) {
        errorMessage = error.error.error.message;
      } else {
        errorMessage = `Server returned code ${error.status}, error message is: ${error.message}`;
      }
    }
    
    console.error('TimeOffTypesService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
