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
  selectedPaymentPeriod: string = '';
  paymentPeriods: string[] = [];
  selectedStatus: string = '';
  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Approve', value: 'APPROVE' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Reject', value: 'REJECT' }
  ];

  // Table selection
  selectAll: boolean = false;

  // Employees data
  employees: any[] = [];
  filteredEmployees: any[] = [];
  loading = false;
  loadingMessage = '';

  // Date range (for header) - dynamic
  dateRange: string = '';

  // Date range picker
  dateRangeModel: DateRangeModel = { from: null, to: null };
  selectedPayrollRange: { from: Date; to: Date } | null = null; // Store selected range for payroll
  @ViewChild('dateRangePicker') dateRangePicker: any;

  @ViewChild('generatePayrollModal') generatePayrollModal: any;

  constructor(
    private modalService: NgbModal,
    private payrollService: PayrollService,
    private authService: LaravelAuthService
  ) {}

  ngOnInit(): void {
    this.initializeDynamicDates();
    // Set default selected payment period to current month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);
    const startStr = startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const endStr = endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const currentPeriod = `${startStr} - ${endStr}`;
    this.selectedPaymentPeriod = currentPeriod;
    this.onPaymentPeriodChange();
  }

  initializeDynamicDates() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    this.paymentPeriods = [];
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);
      const startStr = startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const endStr = endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      this.paymentPeriods.push(`${startStr} - ${endStr}`);
    }
    const currentMonthStart = new Date(currentYear, currentDate.getMonth(), 1);
    const currentMonthEnd = new Date(currentYear, currentDate.getMonth() + 1, 0);
    this.dateRange = `${currentMonthStart.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${currentMonthEnd.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    this.dateRangeModel = {
      from: new NgbDate(currentMonthStart.getFullYear(), currentMonthStart.getMonth() + 1, currentMonthStart.getDate()),
      to: new NgbDate(currentMonthEnd.getFullYear(), currentMonthEnd.getMonth() + 1, currentMonthEnd.getDate())
    };
  }

  generatePayroll(dateRange?: { from: Date; to: Date }) {
    this.loading = true;
    this.loadingMessage = 'Generating payroll data...';
    const payload = dateRange ? {
      from_date: dateRange.from.toISOString().split('T')[0],
      to_date: dateRange.to.toISOString().split('T')[0]
    } : {};
    console.log('Sending generatePayroll payload:', payload);
    const timeout = setTimeout(() => {
      console.error('Payroll generation timeout - taking too long');
      this.loading = false;
      this.loadingMessage = '';
      Swal.fire('Error', 'Payroll generation timed out. Please try again.', 'error');
    }, 30000);
    this.payrollService.generatePayroll(payload).subscribe({
      next: (response) => {
        console.log('Received generatePayroll response:', response);
        clearTimeout(timeout);
        if (response.status) {
          this.employees = response.data;
          this.filteredEmployees = this.employees;
          Swal.fire('Success', response.message, 'success');
        } else {
          Swal.fire('Error', response.message || 'Failed to generate payroll', 'error');
        }
        this.loading = false;
        this.loadingMessage = '';
      },
      error: (err) => {
        clearTimeout(timeout);
        console.error('Payroll generation error:', err);
        Swal.fire('Error', err?.error?.message || 'Server error occurred', 'error');
        this.loading = false;
        this.loadingMessage = '';
      }
    });
  }

  onPaymentPeriodChange() {
    if (this.selectedPaymentPeriod) {
      const periodMatch = this.selectedPaymentPeriod.match(/(\d{2} \w{3} \d{4}) - (\d{2} \w{3} \d{4})/);
      if (periodMatch) {
        const fromDate = new Date(periodMatch[1]);
        const toDate = new Date(periodMatch[2]);
        this.dateRange = this.selectedPaymentPeriod;
        this.dateRangeModel = {
          from: new NgbDate(fromDate.getFullYear(), fromDate.getMonth() + 1, fromDate.getDate()),
          to: new NgbDate(toDate.getFullYear(), toDate.getMonth() + 1, toDate.getDate())
        };
        this.selectedPayrollRange = { from: fromDate, to: toDate };
      }
    }
  }

  applyFilters() {
    this.filteredEmployees = this.employees.filter(emp => {
      const matchesSearch =
        !this.searchTerm ||
        (emp.employee_id && emp.employee_id.includes(this.searchTerm));
      // You can add more filter logic if needed
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

  // Date picker methods
  onDateSelect(date: NgbDate) {
    if (!this.dateRangeModel.from || (this.dateRangeModel.from && this.dateRangeModel.to)) {
      this.dateRangeModel = { from: date, to: null };
    } else {
      if (date.after(this.dateRangeModel.from)) {
        this.dateRangeModel.to = date;
      } else {
        this.dateRangeModel = { from: date, to: null };
      }
    }
  }

  applyDateRange() {
    if (this.dateRangeModel.from && this.dateRangeModel.to) {
      const fromDate = new Date(this.dateRangeModel.from.year, this.dateRangeModel.from.month - 1, this.dateRangeModel.from.day);
      const toDate = new Date(this.dateRangeModel.to.year, this.dateRangeModel.to.month - 1, this.dateRangeModel.to.day);
      this.dateRange = `${fromDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${toDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
      this.modalService.dismissAll();
      this.selectedPayrollRange = { from: fromDate, to: toDate };
    }
  }

  isDateInRange(date: NgbDate): boolean {
    if (!this.dateRangeModel.from || !this.dateRangeModel.to) {
      return false;
    }
    return date.after(this.dateRangeModel.from) && date.before(this.dateRangeModel.to) || 
           date.equals(this.dateRangeModel.from) || 
           date.equals(this.dateRangeModel.to);
  }

  isFromDate(date: NgbDate): boolean {
    return this.dateRangeModel.from && date.equals(this.dateRangeModel.from);
  }

  isToDate(date: NgbDate): boolean {
    return this.dateRangeModel.to && date.equals(this.dateRangeModel.to);
  }

  canApplyDateRange(): boolean {
    return !!(this.dateRangeModel.from && this.dateRangeModel.to);
  }

  openGeneratePayrollModal() {
    this.modalService.open(this.generatePayrollModal, { centered: true });
  }

  openDateRangePicker() {
    this.modalService.open(this.dateRangePicker, { centered: true });
  }

  onGeneratePayrollClick() {
    if (!this.selectedPayrollRange) {
      Swal.fire('Error', 'Please select a valid date range before generating payroll.', 'error');
      return;
    }
    this.generatePayroll(this.selectedPayrollRange);
  }
} 