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

  // Payroll status mapping based on PHP enum
  payrollStatusMap: { [key: number]: string } = {
    1: 'Draft',
    2: 'Pending',
    3: 'Approved',
    4: 'Rejected',
    5: 'Paid',
    8: 'Processing',
    9: 'Cancelled',
    10: 'Failed',
    11: 'Closed',
    12: 'Archived'
  };

  // Payroll status badge classes
  payrollStatusBadgeMap: { [key: number]: string } = {
    1: 'bg-secondary', // Draft
    2: 'bg-warning',   // Pending
    3: 'bg-success',   // Approved
    4: 'bg-danger',    // Rejected
    5: 'bg-primary',   // Paid
    8: 'bg-info',      // Processing
    9: 'bg-dark',      // Cancelled
    10: 'bg-danger',   // Failed
    11: 'bg-secondary', // Closed
    12: 'bg-light text-dark' // Archived
  };

  constructor(
    private route: ActivatedRoute,
    private payrollService: PayrollService,
    private router: Router,
    private modalService: BsModalService
  ) {}

  // Get payroll status label
  getPayrollStatusLabel(status: number): string {
    return this.payrollStatusMap[status] || 'Unknown';
  }

  // Get payroll status badge class
  getPayrollStatusBadgeClass(status: number): string {
    return this.payrollStatusBadgeMap[status] || 'bg-secondary';
  }

  // Get suspended employees count
  getSuspendedCount(): number {
    return this.payrollEmployees.filter(emp => emp.employee?.is_active === false).length;
  }

  // Total calculation methods
  getTotalBasicSalary(): number {
    return this.filteredPayrollEmployees.reduce((sum, emp) => {
      const basicSalary = emp.basic_salary || 0;
      return sum + (typeof basicSalary === 'string' ? parseFloat(basicSalary.replace(/,/g, '')) : basicSalary);
    }, 0);
  }



  getTotalRSSBEE(): number {
    return this.filteredPayrollEmployees.reduce((sum, emp) => sum + (emp.total_rssb_employee_deductions || 0), 0);
  }

  getTotalRSSBER(): number {
    return this.filteredPayrollEmployees.reduce((sum, emp) => sum + (emp.total_rssb_employer_deductions || 0), 0);
  }

  getTotalOtherDeductions(): number {
    return this.filteredPayrollEmployees.reduce((sum, emp) => sum + (emp.total_other_deductions || 0), 0);
  }

  getTotalPAYE(): number {
    return this.filteredPayrollEmployees.reduce((sum, emp) => sum + (emp.total_paye_deductions || 0), 0);
  }

  getTotalNetSalary(): number {
    return this.filteredPayrollEmployees.reduce((sum, emp) => {
      const netSalary = emp.net_salary || emp.total_net_salary || 0;
      return sum + (typeof netSalary === 'string' ? parseFloat(netSalary.replace(/,/g, '')) : netSalary);
    }, 0);
  }

  getTotalMassSalary(): number {
    return this.filteredPayrollEmployees.reduce((sum, emp) => sum + (emp.total_mass_salary || 0), 0);
  }

  // New calculation methods for updated data structure
  getTotalAllowances(): number {
    return this.filteredPayrollEmployees.reduce((sum, emp) => {
      const allowances = emp.total_allowances || 0;
      return sum + (typeof allowances === 'string' ? parseFloat(allowances.replace(/,/g, '')) : allowances);
    }, 0);
  }



  getTotalGrossSalary(): number {
    return this.filteredPayrollEmployees.reduce((sum, emp) => {
      const grossSalary = emp.total_gross_salary || 0;
      return sum + (typeof grossSalary === 'string' ? parseFloat(grossSalary.replace(/,/g, '')) : grossSalary);
    }, 0);
  }

  getTotalDeductions(): number {
    return this.filteredPayrollEmployees.reduce((sum, emp) => {
      const rssbEE = emp.total_rssb_employee_deductions || 0;
      const otherDeductions = emp.total_other_deductions || 0;
      const paye = emp.total_paye_deductions || 0;
      
      const totalRssbEE = typeof rssbEE === 'string' ? parseFloat(rssbEE.replace(/,/g, '')) : rssbEE;
      const totalOtherDeductions = typeof otherDeductions === 'string' ? parseFloat(otherDeductions.replace(/,/g, '')) : otherDeductions;
      const totalPaye = typeof paye === 'string' ? parseFloat(paye.replace(/,/g, '')) : paye;
      
      return sum + totalRssbEE + totalOtherDeductions + totalPaye;
    }, 0);
  }

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

  requestApproval() {
    if (!this.payrollId) {
      Swal.fire({
        title: 'Error',
        text: 'Payroll ID not found',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    Swal.fire({
      title: 'Request Approval',
      text: 'Are you sure you want to request approval for this payroll?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Request Approval',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        
        // Prepare the request payload
        const payload = {
          workflow_code: "PAYROLL_APPROVAL", // Payroll Approval workflow
          entity_type: "payroll",
          entity_id: this.payrollId
        };

        // Make API call to initiate workflow
        this.payrollService.initiateWorkflow(payload).subscribe({
          next: (response) => {
            this.loading = false;
            console.log('Workflow initiated successfully:', response);
            Swal.fire({
              title: 'Success!',
              text: 'Workflow approval request has been initiated successfully',
              icon: 'success',
              confirmButtonColor: '#198754',
              confirmButtonText: 'OK'
            }).then(() => {
              this.fetchDetails();
            });
          },
          error: (error) => {
            this.loading = false;
            console.error('Error initiating workflow:', error);
            Swal.fire({
              title: 'Error',
              text: error,
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        });
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
    const payslipId = employee?.id;
    if (!payslipId) return;
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
        this.payrollService.deletePayslip(payslipId).subscribe({
          next: (res) => {
            this.loading = false;
            Swal.fire('Deleted!', 'Payslip has been deleted.', 'success');
            this.fetchDetails();
          },
          error: (err) => {
            this.loading = false;
            Swal.fire('Error', 'Failed to delete payslip.', 'error');
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

  onPayrollDateChange(date: NgbDateStruct) {
    this.selectedPayrollDate = date;
    // Optionally, filter or fetch payroll data for the selected date here
  }

  getRssbEmployeeTotal(): number {
    return (this.selectedEmployee?.rssb_details || []).reduce((sum, r) => sum + (r.employee_contribution_amount || 0), 0);
  }
  getRssbEmployerTotal(): number {
    return (this.selectedEmployee?.rssb_details || []).reduce((sum, r) => {
      const value = typeof r.employer_contribution_amount === 'string' ? parseFloat(r.employer_contribution_amount) : r.employer_contribution_amount;
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  }
  getAllowanceTotal(): number {
    return (this.selectedEmployee?.allowance_details || []).reduce((sum, a) => {
      // Convert to number if it's a string
      const value = typeof a.calculated_amount === 'string' ? parseFloat(a.calculated_amount) : a.calculated_amount;
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  }
  getOtherDeductionTotal(): number {
    return (this.selectedEmployee?.other_deduction_details || []).reduce((sum, d) => {
      const value = typeof d.calculated_amount === 'string' ? parseFloat(d.calculated_amount) : d.calculated_amount;
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  }
  getTotalPaySlip(): number {
    return this.getRssbEmployeeTotal() + this.getRssbEmployerTotal() + this.getAllowanceTotal() + this.getOtherDeductionTotal();
  }

  exportPayroll() {
    if (!this.filteredPayrollEmployees || this.filteredPayrollEmployees.length === 0) {
      Swal.fire({
        title: 'No Data',
        text: 'No payroll data available to export',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Create CSV content
    const headers = [
      'Employee Name',
      'Phone',
      'Basic Salary',
      'Total Allowances',
      'Gross Salary',
      'RSSB EE',
      'RSSB ER',
      'Other Deductions',
      'PAYE',
      'Net Salary',
      'Mass Salary'
    ];

    const csvContent = [
      headers.join(','),
      ...this.filteredPayrollEmployees.map(emp => [
        `"${emp.employee?.first_name} ${emp.employee?.last_name}"`,
        emp.employee?.personal_mobile || '',
        emp.basic_salary || 0,
        emp.total_allowances || 0,
        emp.total_gross_salary || 0,
        emp.total_rssb_employee_deductions || 0,
        emp.total_rssb_employer_deductions || 0,
        emp.total_other_deductions || 0,
        emp.total_paye_deductions || 0,
        emp.total_net_salary || 0,
        emp.total_mass_salary || 0
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payroll_${this.payrollDate || 'export'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      title: 'Export Successful',
      text: 'Payroll data has been exported successfully',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }
} 