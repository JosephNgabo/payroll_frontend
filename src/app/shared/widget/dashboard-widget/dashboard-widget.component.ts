import { Component, Input, OnInit } from '@angular/core';
import { DashboardWidgetsService } from '../../../core/services/dashboard-widgets.service';

@Component({
  selector: 'app-dashboard-widget',
  templateUrl: './dashboard-widget.component.html',
  styleUrls: ['./dashboard-widget.component.scss']
})
export class DashboardWidgetComponent implements OnInit {
  @Input() widgetName: string = '';
  @Input() widgetTitle: string = '';
  @Input() widgetIcon: string = '';
  @Input() widgetType: 'stats' | 'chart' | 'table' | 'list' = 'stats';
  
  widgetData: any = null;
  isLoading = true;
  error: string | null = null;

  constructor(private dashboardWidgetsService: DashboardWidgetsService) { }

  ngOnInit(): void {
    if (this.widgetName) {
      this.loadWidgetData();
    }
  }

  /**
   * Load widget data
   */
  loadWidgetData() {
    this.isLoading = true;
    this.error = null;

    // Get the appropriate widget method based on widget name
    const widgetMethod = this.getWidgetMethod(this.widgetName);
    
    if (!widgetMethod) {
      this.error = `Unknown widget: ${this.widgetName}`;
      this.isLoading = false;
      return;
    }

    widgetMethod.subscribe({
      next: (data) => {
        this.widgetData = data;
        this.isLoading = false;
        console.log(`📊 Widget ${this.widgetName} data loaded:`, data);
      },
      error: (error) => {
        console.error(`❌ Error loading widget ${this.widgetName}:`, error);
        
        // Handle different types of errors
        if (error.status === 403 || error.message?.includes('Access denied')) {
          this.error = `You don't have permission to view ${this.widgetTitle}`;
        } else if (error.status === 404) {
          this.error = `${this.widgetTitle} widget not found`;
        } else if (error.status === 401) {
          this.error = 'Authentication required';
        } else {
          this.error = `Failed to load ${this.widgetTitle} data`;
        }
        
        this.isLoading = false;
      }
    });
  }

  /**
   * Get the appropriate widget method based on widget name
   */
  private getWidgetMethod(widgetName: string): any {
    switch (widgetName) {
      case 'view_team_leave_today':
      case 'team_leave_today':
        return this.dashboardWidgetsService.getTeamLeaveToday();
      case 'view_pending_approvals':
      case 'pending_approvals':
        return this.dashboardWidgetsService.getPendingApprovals();
      case 'view_attendance_alerts':
      case 'attendance_alerts':
        return this.dashboardWidgetsService.getAttendanceAlerts();
      case 'view_payrolls_waiting_approval':
      case 'payrolls_waiting_approval':
        return this.dashboardWidgetsService.getPayrollsWaitingApproval();
      case 'view_team_performance':
      case 'team_performance':
        return this.dashboardWidgetsService.getTeamPerformance();
      case 'view_pending_leave_requests':
      case 'pending_leave_requests':
        return this.dashboardWidgetsService.getPendingLeaveRequests();
      case 'view_active_vs_inactive_employees':
      case 'active_vs_inactive_employees':
        return this.dashboardWidgetsService.getActiveVsInactiveEmployees();
      case 'view_payroll_status':
      case 'payroll_status':
        return this.dashboardWidgetsService.getPayrollStatus();
      case 'view_compliance_alerts':
      case 'compliance_alerts':
        return this.dashboardWidgetsService.getComplianceAlerts();
      case 'view_hr_requests':
      case 'hr_requests':
        return this.dashboardWidgetsService.getHrRequests();
      case 'view_quick_stats':
      case 'quick_stats':
        return this.dashboardWidgetsService.getQuickStats();
      case 'view_system_health':
      case 'system_health':
        return this.dashboardWidgetsService.getSystemHealth();
      case 'view_user_logins_summary':
      case 'user_logins_summary':
        return this.dashboardWidgetsService.getUserLoginsSummary();
      case 'view_license_module_status':
      case 'license_module_status':
        return this.dashboardWidgetsService.getLicenseModuleStatus();
      case 'view_audit_logs':
      case 'audit_logs':
        return this.dashboardWidgetsService.getAuditLogs();
      case 'view_backup_restore_alerts':
      case 'backup_restore_alerts':
        return this.dashboardWidgetsService.getBackupRestoreAlerts();
      case 'view_notification_setup':
      case 'notification_setup':
        return this.dashboardWidgetsService.getNotificationSetup();
      default:
        return null;
    }
  }

  /**
   * Refresh widget data
   */
  refreshWidget() {
    this.loadWidgetData();
  }

  /**
   * Get widget-specific display data
   */
  getWidgetDisplayData(): any {
    if (!this.widgetData) return null;

    switch (this.widgetName) {
      case 'team_leave_today':
        return {
          total: this.widgetData.total_absent,
          items: this.widgetData.employees || []
        };
      case 'pending_approvals':
        return {
          total: (this.widgetData.leave_approvals || 0) + 
                 (this.widgetData.payroll_approvals || 0) + 
                 (this.widgetData.timesheet_approvals || 0) + 
                 (this.widgetData.overtime_approvals || 0),
          items: [
            { label: 'Leave Approvals', value: this.widgetData.leave_approvals || 0, color: 'warning' },
            { label: 'Payroll Approvals', value: this.widgetData.payroll_approvals || 0, color: 'info' },
            { label: 'Timesheet Approvals', value: this.widgetData.timesheet_approvals || 0, color: 'success' },
            { label: 'Overtime Approvals', value: this.widgetData.overtime_approvals || 0, color: 'danger' }
          ]
        };
      case 'pending_leave_requests':
        return {
          total: this.widgetData.total_pending,
          items: this.widgetData.requests || []
        };
      case 'active_vs_inactive_employees':
        return {
          total: this.widgetData.total,
          items: [
            { label: 'Active', value: this.widgetData.active, color: 'success' },
            { label: 'Inactive', value: this.widgetData.inactive, color: 'danger' }
          ]
        };
      case 'payroll_status':
        return {
          total: this.widgetData.total,
          items: [
            { label: 'Processing', value: this.widgetData.processing, color: 'warning' },
            { label: 'Validated', value: this.widgetData.validated, color: 'info' },
            { label: 'Locked', value: this.widgetData.locked, color: 'success' }
          ]
        };
      case 'quick_stats':
        return {
          total: this.widgetData.total_employees,
          items: [
            { label: 'New Hires', value: this.widgetData.new_hires_this_month, color: 'success' },
            { label: 'Exits', value: this.widgetData.exits_this_month, color: 'danger' },
            { label: 'Expiring Contracts', value: this.widgetData.expiring_contracts, color: 'warning' }
          ]
        };
      default:
        return this.widgetData;
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
}
