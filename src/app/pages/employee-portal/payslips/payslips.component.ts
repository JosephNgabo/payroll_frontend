import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { EmployeePayslipsService, EmployeePayslip } from 'src/app/core/services/employee-payslips.service';
import { BsModalService, BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { CommonModule } from '@angular/common';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';

@Component({
  selector: 'app-payslips',
  templateUrl: './payslips.component.html',
  styleUrls: ['./payslips.component.scss'],
  standalone: true,
  imports: [CommonModule, ModalModule, PagetitleComponent]
})
export class PayslipsComponent implements OnInit {

  breadCrumbItems: Array<{}>;
  payslips: EmployeePayslip[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  selectedPayslip: EmployeePayslip | null = null;
  modalRef?: BsModalRef;
  @ViewChild('payslipModal') payslipModal!: TemplateRef<any>;

  constructor(
    private payslipsService: EmployeePayslipsService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Employee Portal' },
      { label: 'Payslips', active: true }
    ];
    
    this.loadPayslips();
  }

  /**
   * Load payslips from API
   */
  loadPayslips(): void {
    this.isLoading = true;
    this.error = null;
    
    this.payslipsService.getPayslips().subscribe({
      next: (response) => {
        this.payslips = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading payslips:', error);
        this.error = 'Failed to load payslips. Please try again.';
        this.isLoading = false;
      }
    });
  }

  downloadPayslip(payslip: EmployeePayslip): void {
    this.payslipsService.downloadPayslip(payslip.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `payslip-${payslip.payslip_number}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading payslip:', error);
        // You can add a toast notification here
      }
    });
  }

  viewPayslip(payslip: EmployeePayslip): void {
    this.selectedPayslip = payslip;
    this.modalRef = this.modalService.show(this.payslipModal, {
      class: 'modal-lg',
      backdrop: 'static',
      keyboard: false
    });
  }

  /**
   * Parse RSSB details from JSON string
   */
  getRssbDetails(payslip: EmployeePayslip): any[] {
    try {
      return JSON.parse(payslip.rssb_details);
    } catch (error) {
      console.error('Error parsing RSSB details:', error);
      return [];
    }
  }

  /**
   * Parse allowance details from JSON string
   */
  getAllowanceDetails(payslip: EmployeePayslip): any[] {
    try {
      return JSON.parse(payslip.allowance_details);
    } catch (error) {
      console.error('Error parsing allowance details:', error);
      return [];
    }
  }

  /**
   * Parse other deduction details from JSON string
   */
  getOtherDeductionDetails(payslip: EmployeePayslip): any[] {
    try {
      return JSON.parse(payslip.other_deduction_details);
    } catch (error) {
      console.error('Error parsing other deduction details:', error);
      return [];
    }
  }

  /**
   * Calculate total RSSB employee contributions
   */
  getRssbEmployeeTotal(): number {
    if (!this.selectedPayslip) return 0;
    const rssbDetails = this.getRssbDetails(this.selectedPayslip);
    return rssbDetails.reduce((total, rssb) => total + rssb.employee_contribution_amount, 0);
  }

  /**
   * Calculate total RSSB employer contributions
   */
  getRssbEmployerTotal(): number {
    if (!this.selectedPayslip) return 0;
    const rssbDetails = this.getRssbDetails(this.selectedPayslip);
    return rssbDetails.reduce((total, rssb) => total + rssb.employer_contribution_amount, 0);
  }

  /**
   * Calculate total allowances
   */
  getAllowanceTotal(): number {
    if (!this.selectedPayslip) return 0;
    const allowanceDetails = this.getAllowanceDetails(this.selectedPayslip);
    return allowanceDetails.reduce((total, allowance) => total + parseFloat(allowance.calculated_amount), 0);
  }

  /**
   * Calculate total other deductions
   */
  getOtherDeductionTotal(): number {
    if (!this.selectedPayslip) return 0;
    const deductionDetails = this.getOtherDeductionDetails(this.selectedPayslip);
    return deductionDetails.reduce((total, deduction) => total + parseFloat(deduction.calculated_amount), 0);
  }

  /**
   * Close the modal
   */
  closeModal(): void {
    this.modalRef?.hide();
    this.selectedPayslip = null;
  }

  getStatusBadgeClass(status: number): string {
    switch (status) {
      case 1: // Available/Approved
        return 'bg-success';
      case 0: // Pending
        return 'bg-warning';
      case 2: // Rejected
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  /**
   * Get month name from month number
   */
  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
  }

  /**
   * Get total deductions
   */
  getTotalDeductions(payslip: EmployeePayslip): number {
    return parseFloat(payslip.total_rssb_employee_deductions) + 
           parseFloat(payslip.total_other_deductions) + 
           parseFloat(payslip.total_paye_deductions);
  }
}

