import { Component, OnInit, ViewChild } from '@angular/core';
import { PayrollService } from 'src/app/core/services/payroll.service';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
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
  selectedRegenerateMonth: number | null = null;
  selectedRegeneratePayroll: any = null;
  selectedPayrollDate: NgbDateStruct | null = null;
  @ViewChild('regenerateModal') regenerateModal: any;

  constructor(private payrollService: PayrollService, private modalService: NgbModal) {}

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
      case 1: return 'Active';
      case 0: return 'Inactive';
      default: return 'Unknown';
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

  openRegenerateModal(payroll: any) {
    this.selectedRegeneratePayroll = payroll;
    this.selectedRegenerateMonth = payroll.payroll_month;
    this.modalService.open(this.regenerateModal, { centered: true });
  }

  confirmRegenerate(modal: any) {
    if (!this.selectedRegeneratePayroll || !this.selectedRegenerateMonth) return;
    Swal.fire({
      title: 'Regenerate Payroll',
      text: `Are you sure you want to regenerate payroll for ${this.getMonthName(this.selectedRegenerateMonth)}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, regenerate',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.loading = true;
        this.payrollService.regeneratePayroll(this.selectedRegeneratePayroll.id).subscribe({
          next: (res) => {
            this.loading = false;
            Swal.fire('Success', 'Payroll has been regenerated.', 'success');
            modal.close();
            this.fetchPayrolls(this.currentPage);
          },
          error: (err) => {
            this.loading = false;
            Swal.fire('Error', 'Failed to regenerate payroll.', 'error');
          }
        });
      }
    });
  }

  deletePayroll(payroll: any) {
    if (!payroll?.id) return;
    Swal.fire({
      title: 'Delete Payroll',
      text: 'Are you sure you want to delete this payroll? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.loading = true;
        this.payrollService.deletePayroll(payroll.id).subscribe({
          next: (res) => {
            this.loading = false;
            Swal.fire('Deleted!', 'Payroll has been deleted.', 'success');            
            this.fetchPayrolls(this.currentPage);
          },
          error: (err) => {
            this.loading = false;
            Swal.fire('Error', 'Failed to delete payroll.', 'error');
          }
        });
      }
    });
  }

  onGeneratePayrollClick() {
    this.generatePayroll();
  }

  generatePayroll() {
    if (!this.selectedPayrollDate) return;
    this.loading = true;
    const payload = {
      payroll_month: this.selectedPayrollDate.month.toString(),
      payroll_year: this.selectedPayrollDate.year.toString(),
      payroll_day: this.selectedPayrollDate.day.toString()
    };
    this.payrollService.generatePayroll(payload).subscribe({
      next: (response: any) => {
        this.loading = false;
        Swal.fire({ icon: 'success', text: 'Payroll generated successfully.' });
        this.fetchPayrolls(1);
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

  onPayrollDateChange(date: NgbDateStruct) {
    this.selectedPayrollDate = date;
    // Optionally, filter or fetch payrolls for the selected date here
  }
} 