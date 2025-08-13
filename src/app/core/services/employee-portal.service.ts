import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LaravelAuthService } from './laravel-auth.service';
import {
  EmployeePortalUser,
  LeaveRequest,
  LeaveBalance,
  Payslip,
  AttendanceRecord,
  AttendanceSummary,
  DashboardSummary,
  Activity,
  ApiResponse,
  PaginatedResponse,
  LeaveRequestForm,
  ProfileUpdateForm,
  PasswordChangeForm
} from '../models/employee-portal.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeePortalService {
  private readonly API_URL = `${environment.apiUrl}/employee-portal`;

  constructor(
    private http: HttpClient,
    private authService: LaravelAuthService
  ) { }

  /**
   * Get authenticated headers for API requests
   */
  private getAuthHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  // Dashboard APIs
  getDashboardSummary(): Observable<DashboardSummary> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<DashboardSummary>>(`${this.API_URL}/dashboard`, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError<DashboardSummary>('getDashboardSummary'))
      );
  }

  getRecentActivities(): Observable<Activity[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<Activity[]>>(`${this.API_URL}/activities`, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError<Activity[]>('getRecentActivities', []))
      );
  }

  // Profile APIs
  getEmployeeProfile(): Observable<EmployeePortalUser> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<EmployeePortalUser>>(`${this.API_URL}/profile`, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError<EmployeePortalUser>('getEmployeeProfile'))
      );
  }

  updateEmployeeProfile(profile: ProfileUpdateForm): Observable<EmployeePortalUser> {
    const headers = this.getAuthHeaders();
    return this.http.put<ApiResponse<EmployeePortalUser>>(`${this.API_URL}/profile`, profile, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError<EmployeePortalUser>('updateEmployeeProfile'))
      );
  }

  changePassword(passwordData: PasswordChangeForm): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/change-password`, passwordData, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError<any>('changePassword'))
      );
  }

  // Leave Management APIs
  getLeaveRequests(page: number = 1): Observable<PaginatedResponse<LeaveRequest>> {
    const headers = this.getAuthHeaders();
    return this.http.get<PaginatedResponse<LeaveRequest>>(`${this.API_URL}/leave-requests?page=${page}`, { headers })
      .pipe(
        catchError(this.handleError<PaginatedResponse<LeaveRequest>>('getLeaveRequests'))
      );
  }

  getLeaveBalances(): Observable<LeaveBalance[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<LeaveBalance[]>>(`${this.API_URL}/leave-balances`, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError<LeaveBalance[]>('getLeaveBalances', []))
      );
  }

  submitLeaveRequest(leaveRequest: LeaveRequestForm): Observable<LeaveRequest> {
    const headers = this.getAuthHeaders();
    return this.http.post<ApiResponse<LeaveRequest>>(`${this.API_URL}/leave-requests`, leaveRequest, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError<LeaveRequest>('submitLeaveRequest'))
      );
  }

  getLeaveRequestDetails(id: string): Observable<LeaveRequest> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<LeaveRequest>>(`${this.API_URL}/leave-requests/${id}`, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError<LeaveRequest>('getLeaveRequestDetails'))
      );
  }

  cancelLeaveRequest(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/leave-requests/${id}`, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError<any>('cancelLeaveRequest'))
      );
  }

  // Payslip APIs
  getPayslips(page: number = 1): Observable<PaginatedResponse<Payslip>> {
    const headers = this.getAuthHeaders();
    return this.http.get<PaginatedResponse<Payslip>>(`${this.API_URL}/payslips?page=${page}`, { headers })
      .pipe(
        catchError(this.handleError<PaginatedResponse<Payslip>>('getPayslips'))
      );
  }

  getPayslipDetails(id: string): Observable<Payslip> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<Payslip>>(`${this.API_URL}/payslips/${id}`, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError<Payslip>('getPayslipDetails'))
      );
  }

  downloadPayslip(id: string): Observable<Blob> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.API_URL}/payslips/${id}/download`, { 
      headers, 
      responseType: 'blob' 
    }).pipe(
      catchError(this.handleError<Blob>('downloadPayslip'))
    );
  }

  // Attendance APIs
  getAttendanceRecords(page: number = 1, startDate?: string, endDate?: string): Observable<PaginatedResponse<AttendanceRecord>> {
    const headers = this.getAuthHeaders();
    let url = `${this.API_URL}/attendance?page=${page}`;
    
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;

    return this.http.get<PaginatedResponse<AttendanceRecord>>(url, { headers })
      .pipe(
        catchError(this.handleError<PaginatedResponse<AttendanceRecord>>('getAttendanceRecords'))
      );
  }

  getAttendanceSummary(month?: number, year?: number): Observable<AttendanceSummary> {
    const headers = this.getAuthHeaders();
    let url = `${this.API_URL}/attendance/summary`;
    
    if (month && year) {
      url += `?month=${month}&year=${year}`;
    }

    return this.http.get<ApiResponse<AttendanceSummary>>(url, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError<AttendanceSummary>('getAttendanceSummary'))
      );
  }

  checkIn(location?: string): Observable<AttendanceRecord> {
    const headers = this.getAuthHeaders();
    const data = location ? { location } : {};
    
    return this.http.post<ApiResponse<AttendanceRecord>>(`${this.API_URL}/attendance/check-in`, data, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError<AttendanceRecord>('checkIn'))
      );
  }

  checkOut(): Observable<AttendanceRecord> {
    const headers = this.getAuthHeaders();
    return this.http.post<ApiResponse<AttendanceRecord>>(`${this.API_URL}/attendance/check-out`, {}, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError<AttendanceRecord>('checkOut'))
      );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue by returning an empty result.
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // TODO: Better error handling - perhaps show user-friendly messages
      // For now, just log the error and return empty result
      
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}

