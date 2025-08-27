import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LaravelAuthService } from './laravel-auth.service';
import { environment } from '../../../environments/environment';

// Widget-specific interfaces
export interface TeamLeaveToday {
  total_absent: number;
  employees: Array<{
    employee_name: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    days: number;
  }>;
}

export interface PendingApprovals {
  leave_approvals: number;
  payroll_approvals: number;
  timesheet_approvals: number;
  overtime_approvals: number;
}

export interface AttendanceAlerts {
  late_arrivals: number;
  absenteeism: number;
  early_departures: number;
  total_alerts: number;
}

export interface PayrollsWaitingApproval {
  pending_count: number;
  payrolls: Array<{
    id: string;
    month: number;
    year: number;
    total_employees: number;
    total_amount: number;
  }>;
}

export interface TeamPerformance {
  goals_completed: number;
  reviews_pending: number;
  performance_score: number;
  team_size: number;
}

export interface PendingLeaveRequests {
  total_pending: number;
  requests: Array<{
    id: string;
    employee_name: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    days: number;
    submitted_at: string;
    approval_status: number;
  }>;
}

export interface ActiveVsInactiveEmployees {
  active: number;
  inactive: number;
  total: number;
  active_percentage: number;
}

export interface PayrollStatus {
  processing: number;
  validated: number;
  locked: number;
  total: number;
}

export interface ComplianceAlerts {
  rssb_deadlines: number;
  rra_deadlines: number;
  expiring_contracts: number;
  total_alerts: number;
}

export interface HrRequests {
  letters: number;
  certificates: number;
  advances: number;
  total_requests: number;
}

export interface QuickStats {
  new_hires_this_month: number;
  exits_this_month: number;
  expiring_contracts: number;
  total_employees: number;
}

export interface SystemHealth {
  server_usage: number;
  uptime: number;
  errors_today: number;
  status: string;
}

export interface UserLoginsSummary {
  active_users_today: number;
  failed_logins: number;
  total_logins: number;
  unique_users: number;
}

export interface LicenseModuleStatus {
  license_status: string;
  expiry_date: string;
  modules: {
    payroll: string;
    leave_management: string;
    attendance: string;
    hr_management: string;
  };
}

export interface AuditLogs {
  recent_actions: Array<{
    action: string;
    user: string;
    timestamp: string;
  }>;
}

export interface BackupRestoreAlerts {
  last_backup: string;
  backup_status: string;
  storage_usage: number;
  alerts: any[];
}

export interface NotificationSetup {
  email_notifications: string;
  sms_notifications: string;
  push_notifications: string;
  issues: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardWidgetsService {
  private API_URL = `${environment.apiUrl}/dashboard`;

  constructor(
    private http: HttpClient,
    private authService: LaravelAuthService
  ) { 
    console.log('📊 Dashboard Widgets Service initialized with API URL:', this.API_URL);
  }

  /**
   * Get available widgets for current user
   */
  getAvailableWidgets(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    const url = `${this.API_URL}/available-widgets`;
    
    console.log('🔍 Fetching available widgets from:', url);
    console.log('🔍 Headers:', headers);
    
    return this.http.get<any>(url, { headers })
      .pipe(
        map(response => {
          console.log('📊 Available widgets response:', response);
          
          if (!response) {
            console.warn('⚠️ No response received from available-widgets endpoint');
            return {};
          }
          
          if (!response.data) {
            console.warn('⚠️ No data property in response:', response);
            return response; // Return the full response if no data property
          }
          
          return response.data;
        }),
        catchError(error => {
          console.error('❌ Error fetching available widgets:', error);
          console.error('❌ Error details:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            message: error.message
          });
          
          // Return empty object to allow fallback to default widgets
          return [{}];
        })
      );
  }

  /**
   * Get widgets that the user has access to
   */
  getUserAccessibleWidgets(): Observable<string[]> {
    return this.getAvailableWidgets().pipe(
      map(widgets => {
        console.log('📊 Raw widgets response:', widgets);
        
        const accessibleWidgets: string[] = [];
        
        if (!widgets || typeof widgets !== 'object') {
          console.warn('⚠️ No widgets data received or invalid format:', widgets);
          // Return default widgets for testing
          return this.getDefaultWidgets();
        }
        
        Object.keys(widgets).forEach(widgetName => {
          if (widgets[widgetName] === true) {
            accessibleWidgets.push(widgetName);
          }
        });
        
        console.log('📊 User accessible widgets:', accessibleWidgets);
        
        // If no widgets are accessible, return default widgets for testing
        if (accessibleWidgets.length === 0) {
          console.warn('⚠️ No accessible widgets found, using default widgets for testing');
          return this.getDefaultWidgets();
        }
        
        return accessibleWidgets;
      }),
      catchError(error => {
        console.error('❌ Error getting accessible widgets:', error);
        console.warn('⚠️ Using default widgets due to error');
        return [this.getDefaultWidgets()];
      })
    );
  }

  /**
   * Get default widgets for testing when no permissions are available
   */
  private getDefaultWidgets(): string[] {
    return [
      'team_leave_today',
      'pending_approvals',
      'payrolls_waiting_approval',
      'team_performance',
      'pending_leave_requests',
      'active_vs_inactive_employees',
      'payroll_status',
      'hr_requests',
      'quick_stats'
    ];
  }

  // Individual Widget Methods with Permission IDs
  /**
   * Team Leave Today - Permission ID: 10001
   * Slug: view_team_leave_today
   * Shows employees who are absent today due to approved leave
   */
  getTeamLeaveToday(): Observable<TeamLeaveToday> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/widget/team_leave_today`, { headers })
      .pipe(
        map(response => {
          console.log('📊 Team Leave Today response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Pending Approvals - Permission ID: 10002
   * Slug: view_pending_approvals
   * Shows count of pending approvals for leave, payroll, timesheets, and overtime
   */
  getPendingApprovals(): Observable<PendingApprovals> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/widget/pending_approvals`, { headers })
      .pipe(
        map(response => {
          console.log('📊 Pending Approvals response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Attendance Alerts - Permission ID: 10003
   * Slug: view_attendance_alerts
   * Shows attendance-related alerts like late arrivals and absenteeism
   */
  getAttendanceAlerts(): Observable<AttendanceAlerts> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/widget/attendance_alerts`, { headers })
      .pipe(
        map(response => {
          console.log('📊 Attendance Alerts response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Payrolls Waiting for Manager Approval - Permission ID: 10004
   * Slug: view_payrolls_waiting_approval
   * Shows payrolls that are waiting for manager approval
   */
  getPayrollsWaitingApproval(): Observable<PayrollsWaitingApproval> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/widget/payrolls_waiting_approval`, { headers })
      .pipe(
        map(response => {
          console.log('📊 Payrolls Waiting Approval response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Team Performance Overview - Permission ID: 10005
   * Slug: view_team_performance
   * Shows team performance metrics including goals and reviews
   */
  getTeamPerformance(): Observable<TeamPerformance> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/widget/team_performance`, { headers })
      .pipe(
        map(response => {
          console.log('📊 Team Performance response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Pending Leave Requests - Permission ID: 10006
   * Slug: view_pending_leave_requests
   * Shows pending leave requests that need approval
   */
  getPendingLeaveRequests(): Observable<PendingLeaveRequests> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/widget/pending_leave_requests`, { headers })
      .pipe(
        map(response => {
          console.log('📊 Pending Leave Requests response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Active vs Inactive Employees - Permission ID: 10007
   * Slug: view_active_vs_inactive_employees
   * Shows statistics about active and inactive employees
   */
  getActiveVsInactiveEmployees(): Observable<ActiveVsInactiveEmployees> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/widget/active_vs_inactive_employees`, { headers })
      .pipe(
        map(response => {
          console.log('📊 Active vs Inactive Employees response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Payroll Status - Permission ID: 10008
   * Slug: view_payroll_status
   * Shows payroll processing status
   */
  getPayrollStatus(): Observable<PayrollStatus> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/widget/payroll_status`, { headers })
      .pipe(
        map(response => {
          console.log('📊 Payroll Status response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Compliance Alerts - Permission ID: 10009
   * Slug: view_compliance_alerts
   * Shows compliance-related alerts like RSSB and RRA deadlines
   */
  getComplianceAlerts(): Observable<ComplianceAlerts> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/widget/compliance_alerts`, { headers })
      .pipe(
        map(response => {
          console.log('📊 Compliance Alerts response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * HR Requests - Permission ID: 10010
   * Slug: view_hr_requests
   * Shows HR-related requests like letters, certificates, and advances
   */
  getHrRequests(): Observable<HrRequests> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/widget/hr_requests`, { headers })
      .pipe(
        map(response => {
          console.log('📊 HR Requests response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Quick Stats - Permission ID: 10011
   * Slug: view_quick_stats
   * Shows quick statistics like new hires, exits, and expiring contracts
   */
  getQuickStats(): Observable<QuickStats> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/widget/quick_stats`, { headers })
      .pipe(
        map(response => {
          console.log('📊 Quick Stats response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * System Health - Permission ID: 10012
   * Slug: view_system_health
   * Shows system health metrics like server usage and uptime (Admin only)
   */
  getSystemHealth(): Observable<SystemHealth> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/widget/system_health`, { headers })
      .pipe(
        map(response => {
          console.log('📊 System Health response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * User Logins Summary - Permission ID: 10013
   * Slug: view_user_logins_summary
   * Shows user login statistics (Admin only)
   */
  getUserLoginsSummary(): Observable<UserLoginsSummary> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/widget/user_logins_summary`, { headers })
      .pipe(
        map(response => {
          console.log('📊 User Logins Summary response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * License & Module Status - Permission ID: 10014
   * Slug: view_license_module_status
   * Shows license and module status information (Admin only)
   */
  getLicenseModuleStatus(): Observable<LicenseModuleStatus> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/widget/license_module_status`, { headers })
      .pipe(
        map(response => {
          console.log('📊 License Module Status response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Audit Logs - Permission ID: 10015
   * Slug: view_audit_logs
   * Shows recent audit log entries (Admin only)
   */
  getAuditLogs(): Observable<AuditLogs> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/widget/audit_logs`, { headers })
      .pipe(
        map(response => {
          console.log('📊 Audit Logs response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Backup/Restore Alerts - Permission ID: 10016
   * Slug: view_backup_restore_alerts
   * Shows backup and restore system alerts (Admin only)
   */
  getBackupRestoreAlerts(): Observable<BackupRestoreAlerts> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/widget/backup_restore_alerts`, { headers })
      .pipe(
        map(response => {
          console.log('📊 Backup Restore Alerts response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Notification Setup & Issues - Permission ID: 10017
   * Slug: view_notification_setup
   * Shows notification system status and issues (Admin only)
   */
  getNotificationSetup(): Observable<NotificationSetup> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/widget/notification_setup`, { headers })
      .pipe(
        map(response => {
          console.log('📊 Notification Setup response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Test dashboard API connection and permissions
   */
  testDashboardConnection(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    const url = `${this.API_URL}/available-widgets`;
    
    console.log('🔍 Testing dashboard connection to:', url);
    console.log('🔍 Headers:', headers);
    
    return this.http.get<any>(url, { headers })
      .pipe(
        map(response => {
          console.log('✅ Dashboard connection successful:', response);
          return {
            success: true,
            url: url,
            response: response,
            message: 'Dashboard API connection successful'
          };
        }),
        catchError(error => {
          console.error('❌ Dashboard connection failed:', error);
          return [{
            success: false,
            url: url,
            error: error,
            message: `Dashboard API connection failed: ${error.status} ${error.statusText}`
          }];
        })
      );
  }

  /**
   * Handle errors
   */
  private handleError(error: any): Observable<never> {
    console.error('Dashboard Widgets service error:', error);
    throw error;
  }
}
