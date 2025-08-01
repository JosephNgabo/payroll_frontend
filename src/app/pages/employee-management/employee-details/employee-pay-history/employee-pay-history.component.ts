import { Component, Optional, SkipSelf, OnInit } from '@angular/core';
import { EmployeeDetailsComponent } from '../employee-details.component';
import { PayrollService } from 'src/app/core/services/payroll.service';

@Component({
  selector: 'app-employee-pay-history',
  templateUrl: './employee-pay-history.component.html',
  styleUrls: ['./employee-pay-history.component.scss']
})
export class EmployeePayHistoryComponent implements OnInit {
  employeePayHistory: any[] = [];
  loading = false;
  selectedPayslip: any = null;
  showPayslipDetails = false;

  constructor(
    @Optional() @SkipSelf() public parent: EmployeeDetailsComponent,
    private payrollService: PayrollService
  ) {}

  ngOnInit() {
    this.fetchEmployeePayHistory();
  }

  get employee() {
    return this.parent?.employee;
  }

  fetchEmployeePayHistory() {
    if (!this.employee?.id) {
      console.log('No employee ID available');
      return;
    }
    
    console.log('Fetching pay history for employee ID:', this.employee.id);
    this.loading = true;
    this.payrollService.getEmployeePayHistory(this.employee.id).subscribe({
      next: (response: any) => {
        console.log('Pay history response:', response);
        this.employeePayHistory = response.data || [];
        console.log('Processed pay history:', this.employeePayHistory);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching pay history:', error);
        // If the employee-specific endpoint doesn't exist, try to get all payrolls
        // and filter by employee (this is a fallback approach)
        this.loading = true;
        this.payrollService.getPayrolls(1).subscribe({
          next: (response: any) => {
            console.log('Fallback: All payrolls response:', response);
            
            // Filter payrolls to find ones that contain this employee
            if (response.data && response.data.length > 0) {
              // For each payroll, we need to get its details to find employee payslips
              this.fetchEmployeePayslipsFromPayrolls(response.data);
            } else {
              this.employeePayHistory = [];
              this.loading = false;
            }
          },
          error: (fallbackError) => {
            console.error('Fallback also failed:', fallbackError);
            this.employeePayHistory = [];
            this.loading = false;
          }
        });
      }
    });
  }

  openPayslipDetails(payslip: any) {
    this.selectedPayslip = {
      ...payslip,
      rssb_details: payslip.rssb_details ? JSON.parse(payslip.rssb_details) : [],
      allowance_details: payslip.allowance_details ? JSON.parse(payslip.allowance_details) : [],
      other_deduction_details: payslip.other_deduction_details ? JSON.parse(payslip.other_deduction_details) : [],
    };
    this.showPayslipDetails = true;
  }

  closePayslipDetails() {
    this.showPayslipDetails = false;
    this.selectedPayslip = null;
  }

  getRssbEmployeeTotal(): number {
    return (this.selectedPayslip?.rssb_details || []).reduce((sum, r) => sum + (r.employee_contribution_amount || 0), 0);
  }

  getRssbEmployerTotal(): number {
    return (this.selectedPayslip?.rssb_details || []).reduce((sum, r) => {
      const value = typeof r.employer_contribution_amount === 'string' ? parseFloat(r.employer_contribution_amount) : r.employer_contribution_amount;
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  }

  getAllowanceTotal(): number {
    return (this.selectedPayslip?.allowance_details || []).reduce((sum, a) => {
      const value = typeof a.calculated_amount === 'string' ? parseFloat(a.calculated_amount) : a.calculated_amount;
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  }

  getOtherDeductionTotal(): number {
    return (this.selectedPayslip?.other_deduction_details || []).reduce((sum, d) => {
      const value = typeof d.calculated_amount === 'string' ? parseFloat(d.calculated_amount) : d.calculated_amount;
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'active':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'rejected':
      case 'inactive':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  private fetchEmployeePayslipsFromPayrolls(payrolls: any[]) {
    const employeeId = this.employee?.id;
    if (!employeeId) {
      this.employeePayHistory = [];
      this.loading = false;
      return;
    }

    // Get details for each payroll to find employee payslips
    const payrollPromises = payrolls.map(payroll => 
      this.payrollService.getPayrollDetails(payroll.id).toPromise()
    );

    Promise.all(payrollPromises).then(responses => {
      const allPayslips: any[] = [];
      
      responses.forEach(response => {
        if (response && response.data) {
          // Filter payslips for this specific employee
          const employeePayslips = response.data.filter((payslip: any) => 
            payslip.employee_id === employeeId
          );
          allPayslips.push(...employeePayslips);
        }
      });

      // Sort by payroll date (newest first)
      this.employeePayHistory = allPayslips.sort((a, b) => 
        new Date(b.payroll_date).getTime() - new Date(a.payroll_date).getTime()
      );
      
      console.log('Found employee payslips:', this.employeePayHistory);
      this.loading = false;
    }).catch(error => {
      console.error('Error fetching payroll details:', error);
      this.employeePayHistory = [];
      this.loading = false;
    });
  }
} 