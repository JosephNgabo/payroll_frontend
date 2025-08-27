import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardWidgetsService } from '../../../core/services/dashboard-widgets.service';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {
  user: any = null;
  isLoading = true;
  error: string | null = null;
  hasPermissions = false; // Track if user has dashboard permissions

  // HR Dashboard Data
  hrDashboardData: any = null;
  
  // Individual widget data
  teamLeaveToday: any = null;
  pendingApprovals: any = null;
  attendanceAlerts: any = null;
  payrollsWaitingApproval: any = null;
  teamPerformance: any = null;
  pendingLeaveRequests: any = null;
  activeVsInactiveEmployees: any = null;
  payrollStatus: any = null;
  complianceAlerts: any = null;
  hrRequests: any = null;
  quickStats: any = null;
  systemHealth: any = null;
  userLoginsSummary: any = null;
  licenseModuleStatus: any = null;
  auditLogs: any = null;
  backupRestoreAlerts: any = null;
  notificationSetup: any = null;
  
  // Chart data for HR dashboard
  monthlyEarningChart: any = {
    series: [],
    chart: {},
    legend: {},
    colors: [],
    labels: [],
    stroke: {},
    plotOptions: {}
  };
  emailSentBarChart: any = {
    series: [],
    chart: {},
    legend: {},
    colors: [],
    fill: {},
    dataLabels: {},
    xaxis: {},
    plotOptions: {}
  };
  statData: any[] = [];
  transactions: any[] = [];
  isActive = 'week';

  constructor(
    private dashboardService: DashboardService,
    private dashboardWidgetsService: DashboardWidgetsService
  ) { }

  ngOnInit(): void {
    this.loadUserData();
    this.initializeHRDashboard();
  }

  /**
   * Load user data
   */
  loadUserData() {
    // Get user from sessionStorage (Laravel auth uses sessionStorage)
    const userStr = sessionStorage.getItem('current_user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
    
    // Check dashboard permissions
    this.hasPermissions = this.checkDashboardPermissions();
    
    // Temporary override for testing - remove this in production
    if (this.user?.user_profile === 'admin' || this.user?.user_profile === 'hr') {
      this.hasPermissions = true;
    }
    
    console.log('🔐 User permissions check:', {
      hasPermissions: this.hasPermissions,
      userProfile: this.user?.user_profile,
      permissions: this.user?.permissions,
      userData: this.user
    });
  }

  /**
   * Initialize HR dashboard
   */
  initializeHRDashboard() {
    if (this.user?.user_profile === 'employee') {
      // Employee dashboard is handled by the employee-dashboard component
      this.isLoading = false;
      return;
    }

    // Load HR dashboard data
    this.loadHRDashboardData();
  }

  /**
   * Load HR dashboard data
   */
  loadHRDashboardData() {
    this.isLoading = true;
    this.error = null;

    // First, get the user's accessible widgets
    this.dashboardWidgetsService.getUserAccessibleWidgets()
      .subscribe({
        next: (accessibleWidgets) => {
          console.log('📊 User accessible widgets:', accessibleWidgets);
          
          // Determine which widgets to load based on user profile and permissions
          let widgetRequests: Observable<any>[] = [];
          
          if (this.user?.user_profile === 'admin') {
            // Admin users get all widgets they have access to
            widgetRequests = this.getAdminWidgetRequests(accessibleWidgets);
          } else {
            // HR users get HR-specific widgets they have access to
            widgetRequests = this.getHRWidgetRequests(accessibleWidgets);
          }

          if (widgetRequests.length === 0) {
            this.isLoading = false;
            this.error = 'No accessible widgets found for your role.';
            return;
          }

          // Load all accessible widgets
          forkJoin(widgetRequests)
            .subscribe({
              next: (responses) => {
                this.processWidgetResponses(responses);
                this.initializeCharts();
                this.initializeStats();
                this.initializeTransactions();
                this.isLoading = false;
                console.log('📊 Dashboard widgets loaded successfully');
              },
              error: (error) => {
                console.error('❌ Error loading dashboard widgets:', error);
                this.error = 'Failed to load dashboard data. Please try again.';
                this.isLoading = false;
                this.initializeDefaultData();
                
                Swal.fire({
                  icon: 'error',
                  title: 'Dashboard Error',
                  text: this.error,
                  confirmButtonText: 'OK'
                });
              }
            });
        },
        error: (error) => {
          console.error('❌ Error getting accessible widgets:', error);
          this.error = 'Failed to check widget permissions. Please try again.';
          this.isLoading = false;
          this.initializeDefaultData();
          
          Swal.fire({
            icon: 'error',
            title: 'Permission Error',
            text: this.error,
            confirmButtonText: 'OK'
          });
        }
      });
  }

  /**
   * Initialize default data for demo purposes
   */
  initializeDefaultData() {
    this.initializeCharts();
    this.initializeStats();
    this.isLoading = false;
  }

  /**
   * Initialize charts
   */
  initializeCharts() {
    this.initializeMonthlyEarningChart();
    this.initializeEmailSentBarChart();
  }

  /**
   * Initialize monthly earning chart
   */
  initializeMonthlyEarningChart() {
    // Initialize with empty data
    let chartData: number[] = [];
    let labels: string[] = [];

    // Use real data if available
    if (this.payrollStatus) {
      chartData = [this.payrollStatus.processing || 0, this.payrollStatus.validated || 0, this.payrollStatus.locked || 0];
      labels = ['Processing', 'Validated', 'Locked'];
    }

    this.monthlyEarningChart = {
      series: [{
        name: 'Payroll',
        data: chartData
      }],
      chart: {
        height: 110,
        type: 'area',
        toolbar: {
          show: false
        }
      },
      colors: ['#556ee6'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [20, 100, 100, 100]
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      labels: labels,
      legend: {
        show: false
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%'
          }
        }
      }
    };
  }

  /**
   * Initialize email sent bar chart
   */
  initializeEmailSentBarChart() {
    // Initialize with empty data
    let chartData: number[] = [];
    let categories: string[] = [];

    // Use real data if available
    if (this.pendingLeaveRequests?.requests && this.pendingLeaveRequests.requests.length > 0) {
      const requests = this.pendingLeaveRequests.requests;
      // Group requests by day of week for the last 7 days
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayCounts = new Array(7).fill(0);
      
      requests.forEach((request: any) => {
        const date = new Date(request.submitted_at);
        const dayIndex = date.getDay();
        dayCounts[dayIndex]++;
      });
      
      chartData = dayCounts;
      categories = daysOfWeek;
    }

    this.emailSentBarChart = {
      series: [{
        name: 'Leave Requests',
        data: chartData
      }],
      chart: {
        height: 350,
        type: 'bar',
        toolbar: {
          show: false
        }
      },
      colors: ['#556ee6'],
      fill: {
        opacity: 1
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: categories
      },
      yaxis: {
        title: {
          text: 'Requests'
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded'
        }
      }
    };
  }

  /**
   * Initialize stats data
   */
  initializeStats() {
    // Initialize with empty data first
    this.statData = [
      {
        title: 'Total Employees',
        value: '0',
        icon: 'bx bx-user'
      },
      {
        title: 'New Hires (This Month)',
        value: '0',
        icon: 'bx bx-building'
      },
      {
        title: 'Pending Approvals',
        value: '0',
        icon: 'bx bx-time'
      },
      {
        title: 'Payroll Status',
        value: '0 Processing',
        icon: 'bx bx-money'
      }
    ];

    // Update with real data if available (with permission masking)
    if (this.activeVsInactiveEmployees) {
      this.statData[0] = {
        title: 'Total Employees',
        value: this.maskSensitiveData(this.activeVsInactiveEmployees.total, 'count'),
        icon: 'bx bx-user'
      };
    }

    if (this.quickStats) {
      this.statData[1] = {
        title: 'New Hires (This Month)',
        value: this.maskSensitiveData(this.quickStats.new_hires_this_month, 'count'),
        icon: 'bx bx-building'
      };
    }

    if (this.pendingApprovals) {
      const totalPending = (this.pendingApprovals.leave_approvals || 0) + 
                         (this.pendingApprovals.payroll_approvals || 0) + 
                         (this.pendingApprovals.timesheet_approvals || 0) + 
                         (this.pendingApprovals.overtime_approvals || 0);
      this.statData[2] = {
        title: 'Pending Approvals',
        value: this.maskSensitiveData(totalPending, 'count'),
        icon: 'bx bx-time'
      };
    }

    if (this.payrollStatus) {
      this.statData[3] = {
        title: 'Payroll Status',
        value: this.hasPermissions ? 
          `${this.payrollStatus.processing || 0} Processing` : 
          '*** Processing',
        icon: 'bx bx-money'
      };
    }
  }

  /**
   * Initialize transactions with empty data
   */
  initializeTransactions() {
    // Initialize with empty data
    this.transactions = [];

    // Update with real data if available (with permission masking)
    if (this.hrDashboardData?.payrolls_waiting_approval?.payrolls && this.hrDashboardData.payrolls_waiting_approval.payrolls.length > 0) {
      this.transactions = this.hrDashboardData.payrolls_waiting_approval.payrolls.map((payroll: any, index: number) => ({
        id: index + 1,
        employee: this.maskSensitiveData(`Payroll ${payroll.month}/${payroll.year}`, 'name'),
        name: this.maskSensitiveData(`Payroll ${payroll.month}/${payroll.year}`, 'name'),
        amount: this.formatCurrencyWithPermission(payroll.total_amount),
        total: this.formatCurrencyWithPermission(payroll.total_amount),
        date: this.maskSensitiveData(`${payroll.year}-${payroll.month.toString().padStart(2, '0')}-01`, 'date'),
        status: 'Pending Approval',
        payment: ['fa-credit-card', 'Bank Transfer']
      }));
    }
  }

  /**
   * Process widget responses and assign to class properties
   */
  private processWidgetResponses(responses: any[]) {
    // Debug: Log the responses
    console.log('📊 Widget responses received:', responses);

    // Get the list of requested widgets based on user profile
    const hrWidgets = [
      'team_leave_today',
      'pending_approvals', 
      'payrolls_waiting_approval',
      'team_performance',
      'pending_leave_requests',
      'active_vs_inactive_employees',
      'payroll_status',
      'hr_requests',
      'user_logins_summary'
    ];

    const adminWidgets = [
      'team_leave_today',
      'pending_approvals',
      'payrolls_waiting_approval', 
      'team_performance',
      'pending_leave_requests',
      'active_vs_inactive_employees',
      'payroll_status',
      'hr_requests',
      'user_logins_summary',
      'system_health',
      'user_logins_summary',
      'license_module_status',
      'audit_logs',
      'backup_restore_alerts',
      'notification_setup'
    ];

    const widgetsToProcess = this.user?.user_profile === 'admin' ? adminWidgets : hrWidgets;

    // Assign responses to properties based on order
    widgetsToProcess.forEach((widgetName, index) => {
      if (responses[index]) {
        const propertyName = this.getPropertyNameFromWidget(widgetName);
        this[propertyName] = responses[index];
        console.log(`📊 Assigned ${widgetName} to ${propertyName}:`, responses[index]);
      }
    });

    // Debug: Log all widget data
    console.log('📊 All widget data extracted:', {
      teamLeaveToday: this.teamLeaveToday,
      pendingApprovals: this.pendingApprovals,
      pendingLeaveRequests: this.pendingLeaveRequests,
      activeVsInactiveEmployees: this.activeVsInactiveEmployees,
      payrollStatus: this.payrollStatus,
      hrRequests: this.hrRequests,
      userLoginsSummary: this.userLoginsSummary
    });
  }

  /**
   * Get property name from widget name
   */
  private getPropertyNameFromWidget(widgetName: string): string {
    const widgetToPropertyMap = {
      'team_leave_today': 'teamLeaveToday',
      'pending_approvals': 'pendingApprovals',
      'attendance_alerts': 'attendanceAlerts',
      'payrolls_waiting_approval': 'payrollsWaitingApproval',
      'team_performance': 'teamPerformance',
      'pending_leave_requests': 'pendingLeaveRequests',
      'active_vs_inactive_employees': 'activeVsInactiveEmployees',
      'payroll_status': 'payrollStatus',
      'compliance_alerts': 'complianceAlerts',
      'hr_requests': 'hrRequests',
      'quick_stats': 'quickStats',
      'system_health': 'systemHealth',
      'user_logins_summary': 'userLoginsSummary',
      'license_module_status': 'licenseModuleStatus',
      'audit_logs': 'auditLogs',
      'backup_restore_alerts': 'backupRestoreAlerts',
      'notification_setup': 'notificationSetup'
    };
    
    return widgetToPropertyMap[widgetName] || widgetName;
  }

  /**
   * Weekly report
   */
  weeklyreport() {
    this.isActive = 'week';
    // Update chart data for weekly view
  }

  /**
   * Monthly report
   */
  monthlyreport() {
    this.isActive = 'month';
    // Update chart data for monthly view
  }

  /**
   * Yearly report
   */
  yearlyreport() {
    this.isActive = 'year';
    // Update chart data for yearly view
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
      case 0: return 'Draft';
      case 1: return 'Pending';
      case 2: return 'Approved';
      case 3: return 'Rejected';
      case 4: return 'Cancelled';
      case 5: return 'In Review';
      case 6: return 'Partially Approved';
      default: return 'Unknown';
    }
  }

  /**
   * Get approval status badge class
   */
  getApprovalStatusBadgeClass(status: number): string {
    switch (status) {
      case 0: return 'bg-secondary'; // Draft
      case 1: return 'bg-warning';   // Pending
      case 2: return 'bg-success';   // Approved
      case 3: return 'bg-danger';    // Rejected
      case 4: return 'bg-dark';      // Cancelled
      case 5: return 'bg-info';      // In Review
      case 6: return 'bg-primary';   // Partially Approved
      default: return 'bg-secondary'; // Unknown
    }
  }

  /**
   * Get widget requests for accessible widgets
   */
  private getWidgetRequests(requestedWidgets: string[], accessibleWidgets: string[]): Observable<any>[] {
    const requests: Observable<any>[] = [];
    
    requestedWidgets.forEach(widgetName => {
      if (accessibleWidgets.includes(widgetName)) {
        requests.push(this.getWidgetRequest(widgetName));
      }
    });

    return requests;
  }

  /**
   * Get individual widget request
   */
  private getWidgetRequest(widgetName: string): Observable<any> {
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
        console.warn(`⚠️ Unknown widget: ${widgetName}`);
        return new Observable();
    }
  }

  /**
   * Get HR widget requests based on accessible widgets
   */
  private getHRWidgetRequests(accessibleWidgets: string[]): Observable<any>[] {
    const hrWidgets = [
      'team_leave_today',
      'pending_approvals', 
      'payrolls_waiting_approval',
      'team_performance',
      'pending_leave_requests',
      'active_vs_inactive_employees',
      'payroll_status',
      'hr_requests',
      'user_logins_summary'
    ];

    return this.getWidgetRequests(hrWidgets, accessibleWidgets);
  }

  /**
   * Get admin widget requests based on accessible widgets
   */
  private getAdminWidgetRequests(accessibleWidgets: string[]): Observable<any>[] {
    const adminWidgets = [
      'view_team_leave_today',
      'view_pending_approvals',
      'view_payrolls_waiting_approval', 
      'view_team_performance',
      'view_pending_leave_requests',
      'view_active_vs_inactive_employees',
      'view_payroll_status',
      'view_hr_requests',
      'view_quick_stats',
      'view_system_health',
      'view_user_logins_summary',
      'view_license_module_status',
      'view_audit_logs',
      'view_backup_restore_alerts',
      'view_notification_setup'
    ];

    return this.getWidgetRequests(adminWidgets, accessibleWidgets);
  }

  /**
   * Refresh dashboard
   */
  refreshDashboard() {
    if (this.user?.user_profile === 'employee') {
      // Employee dashboard refresh is handled by the employee-dashboard component
      return;
    }
    this.loadHRDashboardData();
  }

  /**
   * Test dashboard API
   */
  testDashboardAPI() {
    console.log('🔍 Testing dashboard API connection...');
    this.dashboardWidgetsService.testDashboardConnection()
      .subscribe({
        next: (result) => {
          if (result.success) {
            console.log('✅ Dashboard API test successful:', result);
            Swal.fire({
              icon: 'success',
              title: 'API Connection Successful',
              html: `
                <div class="text-start">
                  <p><strong>Status:</strong> Connected</p>
                  <p><strong>API URL:</strong> ${result.url}</p>
                  <p><strong>Response:</strong></p>
                  <pre style="font-size: 12px; max-height: 200px; overflow-y: auto;">${JSON.stringify(result.response, null, 2)}</pre>
                </div>
              `,
              confirmButtonText: 'OK'
            });
          } else {
            console.error('❌ Dashboard API test failed:', result);
            Swal.fire({
              icon: 'error',
              title: 'API Connection Failed',
              html: `
                <div class="text-start">
                  <p><strong>Error:</strong> ${result.message}</p>
                  <p><strong>URL:</strong> ${result.url}</p>
                  <p><strong>Status:</strong> ${result.error?.status || 'N/A'}</p>
                  <p><strong>Details:</strong></p>
                  <pre style="font-size: 12px; max-height: 200px; overflow-y: auto;">${JSON.stringify(result.error, null, 2)}</pre>
                </div>
              `,
              confirmButtonText: 'OK'
            });
          }
        },
        error: (error) => {
          console.error('❌ Dashboard API test error:', error);
          Swal.fire({
            icon: 'error',
            title: 'API Test Error',
            text: 'An unexpected error occurred while testing the API connection.',
            confirmButtonText: 'OK'
          });
        }
      });
  }

  /**
   * Show accessible widgets information
   */
  showAccessibleWidgets() {
    this.dashboardWidgetsService.getUserAccessibleWidgets()
      .subscribe({
        next: (accessibleWidgets) => {
          Swal.fire({
            icon: 'info',
            title: 'Your Accessible Widgets',
            html: `
              <div class="text-start">
                <p><strong>Total Accessible Widgets:</strong> ${accessibleWidgets.length}</p>
                <p><strong>Widgets:</strong></p>
                <ul class="text-start">
                  ${accessibleWidgets.map(widget => `<li>${widget}</li>`).join('')}
                </ul>
                <hr>
                <p><strong>User Profile:</strong> ${this.user?.user_profile || 'Unknown'}</p>
                <p><strong>User ID:</strong> ${this.user?.id || 'Unknown'}</p>
              </div>
            `,
            confirmButtonText: 'OK'
          });
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Permission Check Failed',
            text: 'Unable to check your widget permissions.',
            confirmButtonText: 'OK'
          });
        }
      });
  }

  /**
   * Check if user has dashboard permissions
   */
  checkDashboardPermissions(): boolean {
    // Check if user has any dashboard-related permissions
    const userPermissions = this.user?.permissions || [];
    
    // If user has any permissions at all, consider them authorized
    if (userPermissions.length > 0) {
      return true;
    }
    
    // Also check for specific dashboard permissions
    const dashboardPermissions = [
      'view_dashboard',
      'view_hr_dashboard',
      'view_payroll_data',
      'view_employee_data',
      'view_leave_data',
      'dashboard',
      'hr_dashboard',
      'payroll_data',
      'employee_data',
      'leave_data'
    ];
    
    const hasSpecificPermission = dashboardPermissions.some(permission => userPermissions.includes(permission));
    
    // For admin and HR users, give them access by default
    if (this.user?.user_profile === 'admin' || this.user?.user_profile === 'hr') {
      return true;
    }
    
    return hasSpecificPermission;
  }

  /**
   * Mask sensitive data with *** when user doesn't have permissions
   */
  maskSensitiveData(value: any, dataType: string = 'amount'): string {
    if (this.hasPermissions) {
      return value?.toString() || '0';
    }
    
    // Return masked value based on data type
    switch (dataType) {
      case 'amount':
      case 'currency':
        return '***';
      case 'count':
        return '***';
      case 'percentage':
        return '***%';
      case 'name':
        return '***';
      case 'date':
        return '***';
      default:
        return '***';
    }
  }

  /**
   * Format currency with permission check
   */
  formatCurrencyWithPermission(amount: string | number): string {
    if (this.hasPermissions) {
      return this.formatCurrency(amount);
    }
    return '***';
  }

  /**
   * Get masked approval status
   */
  getMaskedApprovalStatus(status: number): string {
    if (this.hasPermissions) {
      return this.getApprovalStatusLabel(status);
    }
    return '***';
  }

  /**
   * Debug permissions
   */
  debugPermissions() {
    const userStr = sessionStorage.getItem('current_user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    Swal.fire({
      icon: 'info',
      title: 'Permission Debug Information',
      html: `
        <div class="text-start">
          <h6>User Information:</h6>
          <p><strong>User Profile:</strong> ${user?.user_profile || 'Not set'}</p>
          <p><strong>User ID:</strong> ${user?.id || 'Not set'}</p>
          <p><strong>Email:</strong> ${user?.email || 'Not set'}</p>
          
          <h6 class="mt-3">Permission Status:</h6>
          <p><strong>Has Permissions:</strong> <span class="badge ${this.hasPermissions ? 'bg-success' : 'bg-danger'}">${this.hasPermissions ? 'YES' : 'NO'}</span></p>
          <p><strong>User Permissions:</strong></p>
          <pre style="font-size: 12px; max-height: 150px; overflow-y: auto; background: #f8f9fa; padding: 10px; border-radius: 5px;">${JSON.stringify(user?.permissions || [], null, 2)}</pre>
          
          <h6 class="mt-3">Full User Data:</h6>
          <pre style="font-size: 10px; max-height: 200px; overflow-y: auto; background: #f8f9fa; padding: 10px; border-radius: 5px;">${JSON.stringify(user, null, 2)}</pre>
        </div>
      `,
      width: '800px',
      confirmButtonText: 'OK'
    });
  }
}
