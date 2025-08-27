import { Component, OnInit } from '@angular/core';
import { LaravelAuthService } from 'src/app/core/services/laravel-auth.service';


interface SummaryCard {
  title: string;
  value: string;
  icon: string;
  bgClass: string;
}

interface Activity {
  title: string;
  description: string;
  timestamp?: string;
}

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit {
  
  // Breadcrumb items
  breadCrumbItems: Array<{}>;
  
  // User information
  user: any = null;
  userName: string = 'Frank';
  userFullName: string = 'Kwizera Frank';
  userPosition: string = 'Accountant';

  // Summary cards data
  summaryCards: SummaryCard[] = [
    {
      title: 'LEAVE BALANCE',
      value: '18 Days',
      icon: 'bi-box-arrow-in-left',
      bgClass: 'bg-primary-subtle text-primary'
    },
    {
      title: 'ATTENDANCE RATE',
      value: '95%',
      icon: 'bi-person-check',
      bgClass: 'bg-primary-subtle text-primary'
    },
    {
      title: 'THIS MONTH SALARY',
      value: 'RWF 450,000',
      icon: 'bi-credit-card',
      bgClass: 'bg-primary-subtle text-primary'
    },
    {
      title: 'PENDING LEAVE REQUEST',
      value: '2',
      icon: 'bi-calendar',
      bgClass: 'bg-primary-subtle text-primary'
    }
  ];

  // Recent activities data
  recentActivities: Activity[] = [
    {
      title: 'Your leave request was approved',
      description: 'Leave for 11 - 15 July 2025'
    },
    {
      title: 'Your leave request was approved',
      description: 'Leave for 11 - 15 July 2025'
    },
    {
      title: 'Your leave request was approved',
      description: 'Leave for 11 - 15 July 2025'
    }
  ];

  // Search functionality
  searchTerm: string = '';

  // Chart properties to prevent undefined errors
  chartOptions: any = {
    series: [],
    chart: {},
    legend: {},
    colors: [],
    fill: {},
    dataLabels: {},
    xaxis: {},
    plotOptions: {}
  };

  constructor(private laravelAuthService: LaravelAuthService) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Employee Portal' },
      { label: 'Dashboard', active: true }
    ];
    
    // Load user data
    this.user = this.laravelAuthService.getCurrentUser();
    
    // Load user data and dashboard information
    this.loadDashboardData();
  }

  /**
   * Load dashboard data from services
   */
  loadDashboardData(): void {
    // TODO: Implement API calls to fetch real data
    // This would typically call services to get:
    // - User profile information
    // - Leave balance
    // - Attendance rate
    // - Salary information
    // - Recent activities
  }

  /**
   * Handle search functionality
   */
  onSearch(): void {
    if (this.searchTerm.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', this.searchTerm);
    }
  }

  /**
   * Download payslip action
   */
  downloadPayslip(): void {
    // TODO: Implement payslip download
    console.log('Downloading payslip...');
  }

  /**
   * Request leave action
   */
  requestLeave(): void {
    // Navigate to the leave request form
    window.location.href = '/employee-portal/leave-request';
  }
  get currentUserDisplayName(): string {
    const user = this.laravelAuthService.getCurrentUser();
    if (!user) return '';
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    if (user.username) return user.username;
    return user.email || '';
  }

  /**
   * Handle activity item actions
   */
  onActivityAction(activity: Activity): void {
    // TODO: Handle activity item actions (view details, etc.)
    console.log('Activity action:', activity);
  }
}
