import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface TimeOffKind {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface TimeOffKindsResponse {
  status: boolean;
  message: string;
  data: TimeOffKind[];
}

@Injectable({
  providedIn: 'root'
})
export class TimeOffKindsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Get all time off kinds
  getTimeOffKinds(): Observable<TimeOffKind[]> {
    return this.http.get<TimeOffKindsResponse>(`${this.apiUrl}/time-off-kinds`)
      .pipe(
        map(response => {
          if (response.status) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to fetch time off kinds');
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
    
    console.error('TimeOffKindsService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
