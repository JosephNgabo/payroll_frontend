import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { LaravelAuthService } from './laravel-auth.service';
import { environment } from '../../../environments/environment';

export interface PayslipData {
  id: string;
  payroll_id: string;
  payroll_date: string;
  payslip_number: string;
  basic_salary: string;
  total_allowances: string;
  total_gross_salary: string;
  total_rssb_employee_deductions: string;
  total_rssb_employer_deductions: string;
  total_other_deductions: string;
  total_paye_deductions: string;
  total_net_salary: string;
  total_mass_salary: string;
  rssb_details: string;
  allowance_details: string;
  other_deduction_details: string;
  payroll_month: number;
  payroll_year: number;
  payroll_status: number;
  employee_id: string;
  created_at: string;
  updated_at: string;
}

export interface TimeOffBalance {
  time_off_type_id: string;
  time_off_type_code: string;
  time_off_type_name: string;
  year: number;
  total_days: number;
  carried_over_days: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
}

export interface TimeOffTotals {
  total_allocated_days: number;
  total_used_days: number;
  total_pending_days: number;
  total_remaining_days: number;
}

export interface TimeOffRequest {
  id: string;
  time_off_type_id: string;
  time_off_type_code: string;
  time_off_type_name: string;
  start_date: string;
  end_date: string;
  requested_days: number;
  approval_status: number;
  status: number;
  created_at: string;
}

export interface TimeOffRequests {
  stats: {
    total_requests: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  recent: TimeOffRequest[];
}

export interface TimeOffData {
  year: number;
  balances: TimeOffBalance[];
  totals: TimeOffTotals;
  requests: TimeOffRequests;
}

export interface DashboardData {
  payslip_count: number;
  latest_payslip: PayslipData;
  time_off: TimeOffData;
}

export interface DashboardResponse {
  status: boolean;
  message: string;
  data: DashboardData;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private API_URL = `${environment.apiUrl}/dashboard`;

  constructor(
    private http: HttpClient,
    private authService: LaravelAuthService
  ) { 
    console.log('📊 Dashboard Service initialized with API URL:', this.API_URL);
  }

  /**
   * Get employee dashboard data
   */
  getEmployeeDashboard(): Observable<DashboardData> {
    const headers = this.authService.getAuthHeaders();
    // Use the employee-specific dashboard endpoint
    return this.http.get<DashboardResponse>(`${this.API_URL}/employee`, { headers })
      .pipe(
        map(response => {
          console.log('📊 Employee dashboard response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Get HR dashboard data (for admin/HR users)
   */
  getHRDashboard(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    // Use the main dashboard endpoint with specific widgets for HR
    const widgets = [
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
    const widgetsParam = widgets.join(',');
    
    return this.http.get<any>(`${this.API_URL}?widgets=${widgetsParam}`, { headers })
      .pipe(
        map(response => {
          console.log('📊 HR dashboard response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // Individual Widget Methods
  getTeamLeaveToday(): Observable<any> {
    return this.getWidgetData('team_leave_today');
  }

  getPendingApprovals(): Observable<any> {
    return this.getWidgetData('pending_approvals');
  }

  getAttendanceAlerts(): Observable<any> {
    return this.getWidgetData('attendance_alerts');
  }

  getPayrollsWaitingApproval(): Observable<any> {
    return this.getWidgetData('payrolls_waiting_approval');
  }

  getTeamPerformance(): Observable<any> {
    return this.getWidgetData('team_performance');
  }

  getPendingLeaveRequests(): Observable<any> {
    return this.getWidgetData('pending_leave_requests');
  }

  getActiveVsInactiveEmployees(): Observable<any> {
    return this.getWidgetData('active_vs_inactive_employees');
  }

  getPayrollStatus(): Observable<any> {
    return this.getWidgetData('payroll_status');
  }

  getComplianceAlerts(): Observable<any> {
    return this.getWidgetData('compliance_alerts');
  }

  getHrRequests(): Observable<any> {
    return this.getWidgetData('hr_requests');
  }

  getQuickStats(): Observable<any> {
    return this.getWidgetData('quick_stats');
  }

  getSystemHealth(): Observable<any> {
    return this.getWidgetData('system_health');
  }

  getUserLoginsSummary(): Observable<any> {
    return this.getWidgetData('user_logins_summary');
  }

  getLicenseModuleStatus(): Observable<any> {
    return this.getWidgetData('license_module_status');
  }

  getAuditLogs(): Observable<any> {
    return this.getWidgetData('audit_logs');
  }

  getBackupRestoreAlerts(): Observable<any> {
    return this.getWidgetData('backup_restore_alerts');
  }

  getNotificationSetup(): Observable<any> {
    return this.getWidgetData('notification_setup');
  }

  /**
   * Get multiple widgets data
   */
  getMultipleWidgets(widgetNames: string[]): Observable<any> {
    const requests = widgetNames.map(widgetName => this.getWidgetData(widgetName));
    return forkJoin(requests).pipe(
      map(responses => {
        const result: any = {};
        widgetNames.forEach((widgetName, index) => {
          result[widgetName] = responses[index];
        });
        return result;
      })
    );
  }

  /**
   * Get available widgets for current user
   */
  getAvailableWidgets(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/available-widgets`, { headers })
      .pipe(
        map(response => {
          console.log('📊 Available widgets response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Get widgets that the user has access to
   */
  getUserAccessibleWidgets(): Observable<string[]> {
    return this.getAvailableWidgets().pipe(
      map(widgets => {
        const accessibleWidgets: string[] = [];
        Object.keys(widgets).forEach(widgetName => {
          if (widgets[widgetName] === true) {
            accessibleWidgets.push(widgetName);
          }
        });
        console.log('📊 User accessible widgets:', accessibleWidgets);
        return accessibleWidgets;
      }),
      catchError(error => {
        console.error('❌ Error getting accessible widgets:', error);
        // Return empty array if we can't get widget permissions
        return [];
      })
    );
  }

  /**
   * Get specific widget data with permission check
   */
  getWidgetDataWithPermission(widgetName: string): Observable<any> {
    return this.getAvailableWidgets().pipe(
      switchMap(widgets => {
        if (widgets[widgetName] === true) {
          return this.getWidgetData(widgetName);
        } else {
          throw new Error(`Access denied to widget: ${widgetName}`);
        }
      }),
      catchError(error => {
        console.error(`❌ Permission error for widget ${widgetName}:`, error);
        throw error;
      })
    );
  }

  /**
   * Get multiple widgets data with permission filtering
   */
  getMultipleWidgetsWithPermission(widgetNames: string[]): Observable<any> {
    return this.getAvailableWidgets().pipe(
      switchMap(widgets => {
        const accessibleWidgets = widgetNames.filter(name => widgets[name] === true);
        console.log('📊 Loading accessible widgets:', accessibleWidgets);
        
        if (accessibleWidgets.length === 0) {
          return [];
        }
        
        const requests = accessibleWidgets.map(widgetName => this.getWidgetData(widgetName));
        return forkJoin(requests).pipe(
          map(responses => {
            const result: any = {};
            accessibleWidgets.forEach((widgetName, index) => {
              result[widgetName] = responses[index];
            });
            return result;
          })
        );
      }),
      catchError(error => {
        console.error('❌ Error loading widgets with permission check:', error);
        return [];
      })
    );
  }

  /**
   * Get HR dashboard widgets (optimized for HR users) with permission check
   */
  getHRDashboardWidgets(): Observable<any> {
    const hrWidgets = [
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
    return this.getMultipleWidgetsWithPermission(hrWidgets);
  }

  /**
   * Get admin dashboard widgets (for admin users) with permission check
   */
  getAdminDashboardWidgets(): Observable<any> {
    const adminWidgets = [
      'team_leave_today',
      'pending_approvals',
      'payrolls_waiting_approval',
      'team_performance',
      'pending_leave_requests',
      'active_vs_inactive_employees',
      'payroll_status',
      'hr_requests',
      'quick_stats',
      'system_health',
      'user_logins_summary',
      'license_module_status',
      'audit_logs',
      'backup_restore_alerts',
      'notification_setup'
    ];
    return this.getMultipleWidgetsWithPermission(adminWidgets);
  }

  /**
   * Get specific widget data
   */
  getWidgetData(widgetName: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/widget/${widgetName}`, { headers })
      .pipe(
        map(response => {
          console.log(`📊 Widget ${widgetName} response:`, response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Test dashboard API connection
   */
  testDashboardConnection(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/available-widgets`, { headers })
      .pipe(
        map(response => {
          console.log('📊 Available widgets response:', response);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get all dashboard data (all widgets)
   */
  getAllDashboardData(widgets?: string[]): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    let url = `${this.API_URL}`;
    
    if (widgets && widgets.length > 0) {
      const widgetsParam = widgets.join(',');
      url += `?widgets=${widgetsParam}`;
    }
    
    return this.http.get<any>(url, { headers })
      .pipe(
        map(response => {
          console.log('📊 All dashboard data response:', response);
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Parse JSON string safely
   */
  parseJsonSafely(jsonString: string): any {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return [];
    }
  }

  /**
   * Format currency
   */
  formatCurrency(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  }

  /**
   * Get approval status label
   */
  getApprovalStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'Pending';
      case 2: return 'Approved';
      case 3: return 'Rejected';
      default: return 'Unknown';
    }
  }

  /**
   * Get approval status badge class
   */
  getApprovalStatusBadgeClass(status: number): string {
    switch (status) {
      case 1: return 'bg-warning';
      case 2: return 'bg-success';
      case 3: return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  /**
   * Get payroll status label
   */
  getPayrollStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'Draft';
      case 2: return 'Processing';
      case 3: return 'Completed';
      case 4: return 'Locked';
      default: return 'Unknown';
    }
  }

  /**
   * Get payroll status badge class
   */
  getPayrollStatusBadgeClass(status: number): string {
    switch (status) {
      case 1: return 'bg-secondary';
      case 2: return 'bg-warning';
      case 3: return 'bg-success';
      case 4: return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  /**
   * Format date
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Handle errors
   */
  private handleError(error: any): Observable<never> {
    console.error('Dashboard service error:', error);
    throw error;
  }
}
