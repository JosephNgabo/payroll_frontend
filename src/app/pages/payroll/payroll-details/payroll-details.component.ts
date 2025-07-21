import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PayrollService } from 'src/app/core/services/payroll.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payroll-details',
  templateUrl: './payroll-details.component.html',
  styleUrls: ['./payroll-details.component.scss']
})
export class PayrollDetailsComponent implements OnInit {
  payrollId: string = '';
  details: any = null;
  payrollEmployees: any[] = [];
  loading = false;
  error: string = '';

  rssbDetails: any[] = [];
  allowanceDetails: any[] = [];
  otherDeductionDetails: any[] = [];

  monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(private route: ActivatedRoute, private payrollService: PayrollService, private router: Router) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.payrollId = params.get('id') || '';
      if (this.payrollId) {
        this.fetchDetails();
      }
    });
  }

  fetchDetails() {
    this.loading = true;
    this.error = '';
    this.payrollService.getPayrollDetails(this.payrollId).subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
          this.payrollEmployees = res.data;
          this.details = res.data[0]; // Optionally keep for summary/breakdown
          this.rssbDetails = this.details.rssb_details ? JSON.parse(this.details.rssb_details) : [];
          this.allowanceDetails = this.details.allowance_details ? JSON.parse(this.details.allowance_details) : [];
          this.otherDeductionDetails = this.details.other_deduction_details ? JSON.parse(this.details.other_deduction_details) : [];
        } else {
          this.payrollEmployees = [];
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load payroll details.';
        this.loading = false;
      }
    });
  }

  deletePayslip() {
    if (!this.details?.id) return;
    Swal.fire({
      title: 'Delete Payslip',
      text: 'Are you sure you want to delete this payslip? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.loading = true;
        this.payrollService.deletePayslip(this.details.id).subscribe({
          next: (res) => {
            this.loading = false;
            Swal.fire('Deleted!', 'Payslip has been deleted.', 'success');
            this.router.navigate(['/payroll/list']);
          },
          error: (err) => {
            this.loading = false;
            Swal.fire('Error', 'Failed to delete payslip.', 'error');
          }
        });
      }
    });
  }

  regeneratePayroll() {
    if (!this.details?.payroll_id) return;
    Swal.fire({
      title: 'Regenerate Payroll',
      text: 'Are you sure you want to regenerate this payroll? This will refresh all payslip data.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, regenerate',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.loading = true;
        this.payrollService.regeneratePayroll(this.details.payroll_id).subscribe({
          next: (res) => {
            this.loading = false;
            Swal.fire('Success', 'Payroll has been regenerated.', 'success');
            this.fetchDetails();
          },
          error: (err) => {
            this.loading = false;
            Swal.fire('Error', 'Failed to regenerate payroll.', 'error');
          }
        });
      }
    });
  }

  getMonthName(month: number): string {
    return this.monthNames[month] || '';
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1: return 'Active';
      case 0: return 'Inactive';
      default: return 'Unknown';
    }
  }
} 