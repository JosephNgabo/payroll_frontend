import { Component, OnInit } from '@angular/core';
import { PayrollService } from 'src/app/core/services/payroll.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { timer } from 'rxjs';

@Component({
  selector: 'app-list-payrolls',
  templateUrl: './list-payrolls.component.html',
  styleUrls: ['./list-payrolls.component.scss']
})
export class ListPayrollsComponent implements OnInit {
  breadCrumbItems: Array<any> = [
    { label: 'Payroll', url: '/payroll/list' },
    { label: 'List Payrolls', active: true }
  ];
  payrolls: any[] = [];
  loading = false;
  error: string = '';
  currentPage = 1;
  totalPages = 1;
  perPage = 10;
  total = 0;
  links: any[] = [];

  selectedDate: string | Date | null = null;
  flatpickrOptions: any = {
    enableTime: true,
    dateFormat: 'Y-m-d H:i',
    altInput: true,
    altFormat: 'F j, Y H:i',
    allowInput: true
  };
  selectedPayrollDate: NgbDateStruct | null = null;

  constructor(
    private payrollService: PayrollService
  ) {}

  ngOnInit(): void {
    this.fetchPayrolls(1);
    // Set default selectedPayrollDate to today
    const today = new Date();
    this.selectedPayrollDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
  }

  fetchPayrolls(page: number) {
    this.loading = true;
    this.error = '';
    this.payrollService.getPayrolls(page).subscribe({
      next: (res) => {
        this.payrolls = res.data || [];
        this.currentPage = res.current_page;
        this.totalPages = res.last_page;
        this.perPage = res.per_page;
        this.total = res.total;
        this.links = res.links || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load payrolls.';
        this.loading = false;
      }
    });
  }

  getMonthName(month: number): string {
    const monthNames = [
      '', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month] || '';
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1: return 'Draft';
      case 2: return 'Pending';
      case 3: return 'Approved';
      case 4: return 'Rejected';
      case 5: return 'Paid';
      case 8: return 'Processing';
      case 9: return 'Cancelled';
      case 10: return 'Failed';
      case 11: return 'Closed';
      case 12: return 'Archived';
      default: return 'Unknown';
    }
  }

  getStatusBadgeClass(status: number): string {
    switch (status) {
      case 1: return 'badge bg-secondary'; // Draft
      case 2: return 'badge bg-warning';   // Pending
      case 3: return 'badge bg-success';   // Approved
      case 4: return 'badge bg-danger';    // Rejected
      case 5: return 'badge bg-primary';   // Paid
      case 8: return 'badge bg-info';      // Processing
      case 9: return 'badge bg-dark';      // Cancelled
      case 10: return 'badge bg-danger';   // Failed
      case 11: return 'badge bg-secondary'; // Closed
      case 12: return 'badge bg-light text-dark'; // Archived
      default: return 'badge bg-secondary';
    }
  }

  onPageChange(page: number) {
    if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.fetchPayrolls(page);
    }
  }

  getPageNumberFromUrl(url: string | null): number {
    if (!url) return this.currentPage;
    const match = url.match(/page=(\d+)/);
    return match ? parseInt(match[1], 10) : this.currentPage;
  }

  regeneratePayroll(payroll: any) {
    Swal.fire({
      title: 'Regenerate Payroll',
      text: `Are you sure you want to regenerate the payroll for ${this.getMonthName(payroll.payroll_month)} ${payroll.payroll_year}? This will refresh all payslip data.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, regenerate',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.payrollService.regeneratePayroll(payroll.id).subscribe({
          next: () => {
            this.loading = false;
            this.fetchPayrolls(this.currentPage);
            Swal.fire({
              title: 'Success!',
              text: 'Payroll regenerated successfully.',
              icon: 'success',
              confirmButtonColor: '#34c38f',
            });
          },
          error: (err) => {
            this.loading = false;
            console.error('Error regenerating payroll:', err);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to regenerate payroll. Please try again.',
              icon: 'error',
              confirmButtonColor: '#f46a6a',
            });
          }
        });
      }
    });
  }

  deletePayroll(payroll: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#34c38f',
      cancelButtonColor: '#f46a6a',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.payrollService.deletePayroll(payroll.id).subscribe({
          next: () => {
            this.loading = false;
            this.fetchPayrolls(this.currentPage);
            Swal.fire(
              'Deleted!',
              'Payroll has been deleted.',
              'success'
            );
          },
          error: (err) => {
            this.loading = false;
            console.error('Error deleting payroll:', err);
            Swal.fire(
              'Error!',
              'Failed to delete payroll.',
              'error'
            );
          }
        });
      }
    });
  }

  onGeneratePayrollClick() {
    this.generatePayroll();
  }

  generatePayroll() {
    console.log(this.selectedPayrollDate);
    if (!this.selectedPayrollDate) {
      Swal.fire('Error!', 'Please select a payroll date.', 'error');
      return;
    }

    const date = new Date(
      this.selectedPayrollDate.year,
      this.selectedPayrollDate.month - 1,
      this.selectedPayrollDate.day
    );

    this.loading = true;
    this.payrollService.generatePayroll({
      payroll_date: date.toISOString().split('T')[0]
    }).subscribe({
      next: () => {
        this.loading = false;
        this.fetchPayrolls(1);
        Swal.fire({
          title: 'Success!',
          text: 'Payroll generated successfully.',
          icon: 'success',
          confirmButtonColor: '#34c38f',
        });
      },
      error: (err) => {
        this.loading = false;
        console.error('Error generating payroll:', err);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to generate payroll. Please try again.',
          icon: 'error',
          confirmButtonColor: '#f46a6a',
        });
      }
    });
  }

  onPayrollDateChange(date: NgbDateStruct) {
    this.selectedPayrollDate = date;
  }
} 