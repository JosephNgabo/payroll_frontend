import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../core/services/dashboard.service';
import { LaravelAuthService } from '../../../core/services/laravel-auth.service';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit {
  dashboardData: any = null;
  isLoading = true;
  error: string | null = null;
  currentUser: any = null;

  // Dashboard cards data
  summaryCards: any[] = [];
  leaveStats: any = {};
  payslipInfo: any = {};

  // Chart data
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
  leaveBalanceChart: any = {
    series: [],
    chart: {},
    colors: [],
    plotOptions: {},
    dataLabels: {},
    stroke: {},
    xaxis: {},
    yaxis: {},
    fill: {},
    tooltip: {}
  };

  constructor(
    private dashboardService: DashboardService,
    private authService: LaravelAuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.checkUserProfile();
  }

  /**
   * Check if user is an employee
   */
  checkUserProfile() {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/account/login']);
      return;
    }

    if (this.currentUser.user_profile !== 'employee') {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'This dashboard is only available for employees.',
        confirmButtonText: 'OK'
      }).then(() => {
        this.router.navigate(['/']);
      });
      return;
    }

    this.loadDashboardData();
  }

  /**
   * Load employee dashboard data
   */
  loadDashboardData() {
    this.isLoading = true;
    this.error = null;

    this.dashboardService.getEmployeeDashboard()
      .subscribe({
        next: (response: any) => {
          // Extract data from response
          this.dashboardData = response.data || response;
          this.isLoading = false;
          this.initializeDashboardCards();
          this.initializeCharts();
          console.log('📊 Employee dashboard data loaded:', this.dashboardData);
        },
        error: (error) => {
          console.error('❌ Error loading employee dashboard:', error);
          this.error = 'Failed to load dashboard data. Please try again.';
          this.isLoading = false;
          
          Swal.fire({
            icon: 'error',
            title: 'Dashboard Error',
            text: this.error,
            confirmButtonText: 'OK'
          });
        }
      });
  }

  /**
   * Initialize dashboard summary cards
   */
  initializeDashboardCards() {
    if (!this.dashboardData) return;

    // Payslip information
    this.payslipInfo = {
      count: this.dashboardData.payslip_count || 0,
      latest: this.dashboardData.latest_payslip || null
    };

    // Leave statistics
    this.leaveStats = {
      totalRequests: this.dashboardData.time_off?.requests?.stats?.total_requests || 0,
      pending: this.dashboardData.time_off?.requests?.stats?.pending || 0,
      approved: this.dashboardData.time_off?.requests?.stats?.approved || 0,
      rejected: this.dashboardData.time_off?.requests?.stats?.rejected || 0,
      totalAllocated: this.dashboardData.time_off?.totals?.total_allocated_days || 0,
      totalUsed: this.dashboardData.time_off?.totals?.total_used_days || 0,
      totalRemaining: this.dashboardData.time_off?.totals?.total_remaining_days || 0
    };

    // Create summary cards
    this.summaryCards = [
      {
        title: 'Total Payslips',
        value: this.payslipInfo.count,
        icon: 'bi-receipt',
        bgClass: 'bg-primary-subtle',
        color: 'text-primary'
      },
      {
        title: 'Latest Net Salary',
        value: this.formatCurrency(this.payslipInfo.latest?.total_net_salary || 0),
        icon: 'bi-cash-stack',
        bgClass: 'bg-success-subtle',
        color: 'text-success'
      },
      {
        title: 'Leave Requests',
        value: this.leaveStats.totalRequests,
        icon: 'bi-calendar-check',
        bgClass: 'bg-info-subtle',
        color: 'text-info'
      },
      {
        title: 'Remaining Leave Days',
        value: this.leaveStats.totalRemaining,
        icon: 'bi-calendar-x',
        bgClass: 'bg-warning-subtle',
        color: 'text-warning'
      }
    ];
  }

  /**
   * Initialize charts
   */
  initializeCharts() {
    if (!this.dashboardData) return;

    // Monthly Earning Chart
    this.monthlyEarningChart = {
      series: [
        {
          name: 'Net Salary',
          data: [this.dashboardData.latest_payslip?.total_net_salary || 0]
        }
      ],
      chart: {
        type: 'area',
        height: 350,
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      colors: ['#667eea'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 90, 100]
        }
      },
      xaxis: {
        categories: this.dashboardData.latest_payslip ? ['Current Month'] : []
      },
      yaxis: {
        labels: {
          formatter: function (val: any) {
            return new Intl.NumberFormat('en-RW', {
              style: 'currency',
              currency: 'RWF',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(val);
          }
        }
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return new Intl.NumberFormat('en-RW', {
              style: 'currency',
              currency: 'RWF',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(val);
          }
        }
      }
    };

    // Email Sent Bar Chart (for time-off requests)
    this.emailSentBarChart = {
      series: [
        {
          name: 'Time Off Requests',
          data: [
            this.dashboardData.time_off?.requests?.stats?.pending || 0,
            this.dashboardData.time_off?.requests?.stats?.approved || 0,
            this.dashboardData.time_off?.requests?.stats?.rejected || 0
          ]
        }
      ],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded'
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      colors: ['#ffc107', '#28a745', '#dc3545'],
      xaxis: {
        categories: this.dashboardData.time_off?.requests?.stats ? ['Pending', 'Approved', 'Rejected'] : []
      },
      yaxis: {
        title: {
          text: 'Number of Requests'
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return val + ' requests';
          }
        }
      }
    };
  }

  /**
   * Test dashboard API
   */
  testDashboardAPI() {
    console.log('🔍 Testing employee dashboard API...');
    this.dashboardService.testDashboardConnection()
      .subscribe({
        next: (response) => {
          console.log('✅ Employee dashboard API test successful:', response);
          Swal.fire({
            icon: 'success',
            title: 'API Connection Successful',
            html: `
              <div class="text-start">
                <p><strong>Status:</strong> Connected</p>
                <p><strong>API URL:</strong> ${environment.apiUrl}/dashboard</p>
                <p><strong>Response:</strong></p>
                <pre style="font-size: 12px; max-height: 200px; overflow-y: auto;">${JSON.stringify(response, null, 2)}</pre>
              </div>
            `,
            confirmButtonText: 'OK'
          });
        },
        error: (error) => {
          console.error('❌ Employee dashboard API test failed:', error);
          Swal.fire({
            icon: 'error',
            title: 'API Connection Failed',
            html: `
              <div class="text-start">
                <p><strong>Error:</strong> ${error.message || 'Unknown error'}</p>
                <p><strong>Status:</strong> ${error.status || 'N/A'}</p>
                <p><strong>API URL:</strong> ${environment.apiUrl}/dashboard</p>
              </div>
            `,
            confirmButtonText: 'OK'
          });
        }
      });
  }

  /**
   * Format currency
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  /**
   * Format date
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-RW', {
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
      case 4: return 'Cancelled';
      default: return 'Unknown';
    }
  }

  /**
   * Get approval status badge class
   */
  getApprovalStatusBadgeClass(status: number): string {
    switch (status) {
      case 1: return 'badge-warning';
      case 2: return 'badge-success';
      case 3: return 'badge-danger';
      case 4: return 'badge-secondary';
      default: return 'badge-light';
    }
  }

  /**
   * Download payslip
   */
  downloadPayslip() {
    if (this.payslipInfo.latest) {
      // TODO: Implement payslip download functionality
      Swal.fire({
        icon: 'info',
        title: 'Download Payslip',
        text: 'Payslip download functionality will be implemented soon.',
        confirmButtonText: 'OK'
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'No Payslip Available',
        text: 'No payslip is available for download.',
        confirmButtonText: 'OK'
      });
    }
  }

  /**
   * Request leave
   */
  requestLeave() {
    // TODO: Navigate to leave request page
    Swal.fire({
      icon: 'info',
      title: 'Request Leave',
      text: 'Leave request functionality will be implemented soon.',
      confirmButtonText: 'OK'
    });
  }

  /**
   * Handle activity action
   */
  onActivityAction(activity: any) {
    // TODO: Implement activity action functionality
    console.log('Activity action:', activity);
  }
}
