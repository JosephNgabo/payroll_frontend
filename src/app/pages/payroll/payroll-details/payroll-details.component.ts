import { Component, OnInit, ViewChild, Input, SimpleChanges, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PayrollService } from 'src/app/core/services/payroll.service';
import Swal from 'sweetalert2';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-payroll-details',
  templateUrl: './payroll-details.component.html',
  styleUrls: ['./payroll-details.component.scss']
})
export class PayrollDetailsComponent implements OnInit, OnChanges {
  payrollId: string = '';
  details: any = null;
  payrollEmployees: any[] = [];
  loading = false;
  error: string = '';
  payrollDate: string | null = null;

  rssbDetails: any[] = [];
  allowanceDetails: any[] = [];
  otherDeductionDetails: any[] = [];

  searchTerm: string = '';
  filteredPayrollEmployees: any[] = [];

  selectedEmployee: any = null;
  modalRef?: BsModalRef;
  selectedPayrollDate: NgbDateStruct | null = null;

  monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(
    private route: ActivatedRoute,
    private payrollService: PayrollService,
    private router: Router,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.payrollId = params.get('id') || '';
      if (this.payrollId) {
        this.fetchDetails();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['payrollEmployees']) {
      this.updateFilteredEmployees();
    }
  }

  // Call this after payrollEmployees is loaded/updated
  updateFilteredEmployees() {
    if (!this.searchTerm) {
      this.filteredPayrollEmployees = this.payrollEmployees;
    } else {
      this.onSearch();
    }
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
        this.updateFilteredEmployees();
        if (this.filteredPayrollEmployees && this.filteredPayrollEmployees.length > 0) {
          this.payrollDate = this.filteredPayrollEmployees[0].payroll_date;
        } else {
          this.payrollDate = null;
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

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.filteredPayrollEmployees = this.payrollEmployees;
      if (this.filteredPayrollEmployees && this.filteredPayrollEmployees.length > 0) {
        this.payrollDate = this.filteredPayrollEmployees[0].payroll_date;
      } else {
        this.payrollDate = null;
      }
      return;
    }
    this.filteredPayrollEmployees = this.payrollEmployees.filter(emp => {
      const name = (emp.employee?.first_name + ' ' + emp.employee?.last_name).toLowerCase();
      const mobile = (emp.employee?.personal_mobile || '').toLowerCase();
      return name.includes(term) || mobile.includes(term);
    });
    if (this.filteredPayrollEmployees && this.filteredPayrollEmployees.length > 0) {
      this.payrollDate = this.filteredPayrollEmployees[0].payroll_date;
    } else {
      this.payrollDate = null;
    }
  }

  openEmployeeDetailsModal(template: any, employee: any) {
    this.selectedEmployee = {
      ...employee,
      rssb_details: employee.rssb_details ? JSON.parse(employee.rssb_details) : [],
      allowance_details: employee.allowance_details ? JSON.parse(employee.allowance_details) : [],
      other_deduction_details: employee.other_deduction_details ? JSON.parse(employee.other_deduction_details) : [],
    };
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  deletePayslipById(employee: any) {
    // Placeholder for delete API integration
    alert('Delete payslip for employee ID: ' + (employee?.id || employee?.employee?.id));
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

  onPayrollDateChange(date: NgbDateStruct) {
    this.selectedPayrollDate = date;
    // Optionally, filter or fetch payroll data for the selected date here
  }

  getRssbEmployeeTotal(): number {
    return (this.selectedEmployee?.rssb_details || []).reduce((sum, r) => sum + (r.employee_contribution_amount || 0), 0);
  }
  getRssbEmployerTotal(): number {
    return (this.selectedEmployee?.rssb_details || []).reduce((sum, r) => sum + (r.employer_contribution_amount || 0), 0);
  }
  getAllowanceTotal(): number {
    return (this.selectedEmployee?.allowance_details || []).reduce((sum, a) => sum + (a.calculated_amount || 0), 0);
  }
  getOtherDeductionTotal(): number {
    return (this.selectedEmployee?.other_deduction_details || []).reduce((sum, d) => sum + (d.calculated_amount || 0), 0);
  }
} 