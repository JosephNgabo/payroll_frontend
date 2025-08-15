import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface EmployeeTimeOffRequestAdmin {
  id: string;
  employee_id: string;
  time_off_type_id: string;
  start_date: string;
  end_date: string;
  requested_days: number;
  time_off_period: number | null;
  reason: string;
  status: number;
  approval_status: number;
  current_approval_level: number | null;
  submitted_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  balance_checked: boolean;
  balance_sufficient: boolean;
  approver_notes: string | null;
  created_at: string;
  updated_at: string;
  employee: {
    id: string;
    salutation: string;
    first_name: string;
    last_name: string;
    gender: string;
    date_of_birth: string;
    nationality: number;
    country_of_birth: number;
    marital_status: string;
    name_of_spouse: string;
    number_of_children: number;
    document_type: string;
    document_number: string;
    document_issue_date: string | null;
    document_expiry_date: string | null;
    document_place_of_issue: string | null;
    rssb_number: string;
    highest_education: string;
    personal_mobile: string;
    personal_email: string;
    home_phone: string;
    status: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  time_off_type: {
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
  };
  approvals: any[];
  documents: any[];
}

export interface EmployeeTimeOffRequestsResponse {
  status: boolean;
  message: string;
  data: {
    current_page: number;
    data: EmployeeTimeOffRequestAdmin[];
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

export interface ApproveRejectRequest {
  request_id: string;
  action: 'approve' | 'reject';
  notes?: string;
  rejection_reason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeTimeOffRequestsAdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get all employee time-off requests (for admin)
   */
  getAllEmployeeTimeOffRequests(page: number = 1): Observable<EmployeeTimeOffRequestAdmin[]> {
    return this.http.get<EmployeeTimeOffRequestsResponse>(`${this.apiUrl}/employee-time-off-requests?page=${page}`)
      .pipe(
        map(response => response.data.data),
        catchError(this.handleError)
      );
  }

  /**
   * Get pending employee time-off requests only
   */
  getPendingEmployeeTimeOffRequests(page: number = 1): Observable<EmployeeTimeOffRequestAdmin[]> {
    return this.http.get<EmployeeTimeOffRequestsResponse>(`${this.apiUrl}/employee-time-off-requests?page=${page}&status=1`)
      .pipe(
        map(response => response.data.data),
        catchError(this.handleError)
      );
  }

  /**
   * Approve a time-off request
   */
  approveRequest(requestId: string, notes?: string): Observable<any> {
    const payload: ApproveRejectRequest = {
      request_id: requestId,
      action: 'approve',
      notes: notes
    };
    
    return this.http.post(`${this.apiUrl}/employee-time-off-requests/approve`, payload)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Reject a time-off request
   */
  rejectRequest(requestId: string, rejection_reason: string): Observable<any> {
    const payload: ApproveRejectRequest = {
      request_id: requestId,
      action: 'reject',
      rejection_reason: rejection_reason
    };
    
    return this.http.post(`${this.apiUrl}/employee-time-off-requests/reject`, payload)
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
