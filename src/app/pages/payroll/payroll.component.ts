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

  constructor(
    private modalService: NgbModal,
    private payrollService: PayrollService,
    private authService: LaravelAuthService
  ) {}

  ngOnInit(): void {
    // Populate year options (current year ±5 years)
    const currentYear = new Date().getFullYear();
    this.yearOptions = [];
    for (let y = currentYear - 5; y <= currentYear + 5; y++) {
      this.yearOptions.push({ label: y.toString(), value: y });
    }
    this.selectedYear = currentYear;
    this.selectedMonth = new Date().getMonth() + 1;
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