import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbDateStruct, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { PayrollService, PayrollData } from '../../core/services/payroll.service';
import { EmployeeInformationService } from '../../core/services/employee-information.service';
import { EmployeeInformation } from '../../core/models/employee-information.model';
import { LaravelAuthService } from '../../core/services/laravel-auth.service';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';

interface DateRangeModel {
  from: NgbDate | null;
  to: NgbDate | null;
}

interface PayrollEmployee extends PayrollData {
  selected?: boolean;
  avatar?: string;
  name?: string;
  email?: string;
  employeeId?: string;
  type?: string;
  checkingDate?: string;
  status?: 'APPROVE' | 'PENDING' | 'REJECT';
  employeeInfo?: EmployeeInformation;
}

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent implements OnInit {
  // Filters
  searchTerm: string = '';
  selectedStatus: string = '';
  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Approve', value: 'APPROVE' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Reject', value: 'REJECT' }
  ];

  // Month/Year selection
  monthOptions = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 }
  ];
  yearOptions: { label: string, value: number }[] = [];
  selectedMonth: number | null = null;
  selectedYear: number | null = null;

  // Table selection
  selectAll: boolean = false;

  // Employees data
  employees: any[] = [];
  filteredEmployees: any[] = [];
  loading = false;
  loadingMessage = '';

  // Details modal
  detailsModalData: any[] = [];
  detailsModalType: 'rssb' | 'allowance' | 'other_deduction' | '' = '';
  detailsModalTitle: string = '';
  @ViewChild('detailsModal') detailsModal: any;

  // Permission system - using existing p_id approach
  permissions: (number | string)[] = [];

  constructor(
    private modalService: NgbModal,
    private payrollService: PayrollService,
    private authService: LaravelAuthService
  ) {
    // Get permissions from session storage (same as sidebar)
    const user = sessionStorage.getItem('current_user');
    console.log('Payroll Component - Raw session storage user:', user);
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        this.permissions = userData.permissions || [];
        console.log('Payroll Component - Loaded permissions:', this.permissions);
        console.log('Payroll Component - User data:', userData);
        console.log('Payroll Component - Permissions type:', typeof this.permissions);
        console.log('Payroll Component - Permissions length:', this.permissions.length);
        
        // Check if permissions are numbers or strings
        if (this.permissions.length > 0) {
          console.log('Payroll Component - First permission type:', typeof this.permissions[0]);
          console.log('Payroll Component - First permission value:', this.permissions[0]);
        }
        
        // Check all session storage keys
        console.log('Payroll Component - All session storage keys:', Object.keys(sessionStorage));
        
      } catch (e) {
        console.error('Error parsing user permissions:', e);
        this.permissions = [];
      }
    } else {
      console.log('Payroll Component - No user found in session storage');
      // Check if there are other keys in session storage
      console.log('Payroll Component - All session storage keys:', Object.keys(sessionStorage));
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          console.log('Payroll Component - Session storage key:', key, 'value:', sessionStorage.getItem(key));
        }
      }
    }
  }

  ngOnInit(): void {
    // Populate year options (current year ±5 years)
    const currentYear = new Date().getFullYear();
    this.yearOptions = [];
    for (let y = currentYear - 5; y <= currentYear + 5; y++) {
      this.yearOptions.push({ label: y.toString(), value: y });
    }
    this.selectedYear = currentYear;
    this.selectedMonth = new Date().getMonth() + 1;

    // Debug permission checks
    console.log('Payroll Component - Permission checks:');
    console.log('canViewPayrolls():', this.canViewPayrolls());
    console.log('canGeneratePayroll():', this.canGeneratePayroll());
    console.log('canUpdatePayroll():', this.canUpdatePayroll());
    console.log('canDeletePayroll():', this.canDeletePayroll());
    console.log('hasAnyPayrollPermission():', this.hasAnyPayrollPermission());

    // Check permissions again after a delay to see if they get loaded later
    setTimeout(() => {
      console.log('Payroll Component - Delayed permission check:');
      console.log('Permissions after delay:', this.permissions);
      console.log('canViewPayrolls():', this.canViewPayrolls());
      console.log('canGeneratePayroll():', this.canGeneratePayroll());
      console.log('canUpdatePayroll():', this.canUpdatePayroll());
      console.log('canDeletePayroll():', this.canDeletePayroll());
      console.log('hasAnyPayrollPermission():', this.hasAnyPayrollPermission());
    }, 2000);
  }

  // Permission check methods using p_id system for Payroll
  canViewPayrolls(): boolean {
    // Check for both string and number values
    const hasPermission = this.permissions.some(p_id => p_id === 6001 || p_id === '6001');
    console.log('canViewPayrolls check - permissions:', this.permissions, 'includes 6001:', hasPermission);
    return hasPermission; // p_id for view_payrolls
  }

  canGeneratePayroll(): boolean {
    // Check for both string and number values
    const hasPermission = this.permissions.some(p_id => p_id === 6002 || p_id === '6002');
    console.log('canGeneratePayroll check - permissions:', this.permissions, 'includes 6002:', hasPermission);
    return hasPermission; // p_id for generate_payroll
  }

  canUpdatePayroll(): boolean {
    // Check for both string and number values
    const hasPermission = this.permissions.some(p_id => p_id === 6003 || p_id === '6003');
    console.log('canUpdatePayroll check - permissions:', this.permissions, 'includes 6003:', hasPermission);
    return hasPermission; // p_id for update_payroll
  }

  canDeletePayroll(): boolean {
    // Check for both string and number values
    const hasPermission = this.permissions.some(p_id => p_id === 6004 || p_id === '6004');
    console.log('canDeletePayroll check - permissions:', this.permissions, 'includes 6004:', hasPermission);
    return hasPermission; // p_id for delete_payroll
  }

  // Check if user has any payroll management permissions
  hasAnyPayrollPermission(): boolean {
    // Check for both string and number values
    const payrollPermissionIds = [6001, 6002, 6003, 6004, '6001', '6002', '6003', '6004'];
    const hasAnyPermission = this.permissions.some(p_id => payrollPermissionIds.includes(p_id));
    console.log('hasAnyPayrollPermission check - permissions:', this.permissions, 'has any payroll permission:', hasAnyPermission);
    return hasAnyPermission;
  }

  // Method to manually refresh permissions from session storage
  refreshPermissions(): void {
    const user = sessionStorage.getItem('current_user');
    console.log('Payroll Component - Refreshing permissions, raw user:', user);
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        this.permissions = userData.permissions || [];
        console.log('Payroll Component - Refreshed permissions:', this.permissions);
      } catch (e) {
        console.error('Error parsing user permissions during refresh:', e);
        this.permissions = [];
      }
    } else {
      console.log('Payroll Component - No user found during refresh');
      this.permissions = [];
    }
  }

  generatePayroll() {
    if (!this.selectedMonth || !this.selectedYear) return;
    this.loading = true;
    this.loadingMessage = 'Generating payroll data...';
    const payload = {
      payroll_month: this.selectedMonth.toString(),
      payroll_year: this.selectedYear.toString()
    };
    this.payrollService.generatePayroll(payload).subscribe({
      next: (response: any) => {
        // Map employee info and payroll fields for the table
        this.employees = (response.data || []).map((item: any) => ({
          employee: item.employee,
          status: item.payroll_status,
          selected: false,
          payroll_date: item.payroll_date,
          payslip_number: item.payslip_number,
          basic_salary: +item.basic_salary,
          total_allowances: +item.total_allowances,
          total_gross_salary: +item.total_gross_salary,
          total_rssb_employee_deductions: +item.total_rssb_employee_deductions,
          total_rssb_employer_deductions: +item.total_rssb_employer_deductions,
          total_other_deductions: +item.total_other_deductions,
          total_paye_deductions: +item.total_paye_deductions,
          total_net_salary: +item.total_net_salary,
          total_mass_salary: +item.total_mass_salary
        }));
        this.filteredEmployees = [...this.employees];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        let errorMsg = 'Failed to generate payroll.';
        if (typeof err === 'string') {
          errorMsg = err;
        } else if (err && typeof err === 'object') {
          if (err.message) {
            errorMsg = err.message;
          } else if (err.errors) {
            errorMsg = Object.values(err.errors).flat().join(' ');
          }
        }
        Swal.fire({ icon: 'error', text: errorMsg });
      }
    });
  }

  onGeneratePayrollClick() {
    this.generatePayroll();
  }

  applyFilters() {
    this.filteredEmployees = this.employees.filter(emp => {
      const matchesSearch =
        !this.searchTerm ||
        (emp.employee?.id && emp.employee.id.includes(this.searchTerm)) ||
        (emp.employee?.first_name && emp.employee.first_name.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (emp.employee?.last_name && emp.employee.last_name.toLowerCase().includes(this.searchTerm.toLowerCase()));
      return matchesSearch;
    });
    this.updateSelectAllState();
  }

  onSearch() {
    this.applyFilters();
  }

  updateSelectAllState() {
    if (this.filteredEmployees.length === 0) {
      this.selectAll = false;
      return;
    }
    this.selectAll = this.filteredEmployees.every(emp => emp.selected);
  }

  toggleSelectAll() {
    this.filteredEmployees.forEach(emp => {
      emp.selected = this.selectAll;
    });
  }

  setStatus(employee: any, status: 'APPROVE' | 'PENDING' | 'REJECT') {
    employee.status = status;
    this.applyFilters();
  }

  openDetailsModal(employee: any, type: 'rssb' | 'allowance' | 'other_deduction') {
    if (type === 'rssb') {
      this.detailsModalData = employee.rssb_details || [];
      this.detailsModalType = 'rssb';
      this.detailsModalTitle = 'RSSB Details';
    } else if (type === 'allowance') {
      this.detailsModalData = employee.allowance_details || [];
      this.detailsModalType = 'allowance';
      this.detailsModalTitle = 'Allowance Details';
    } else if (type === 'other_deduction') {
      this.detailsModalData = employee.other_deduction_details || [];
      this.detailsModalType = 'other_deduction';
      this.detailsModalTitle = 'Other Deduction Details';
    }
    this.modalService.open(this.detailsModal, { size: 'lg' });
  }
} 