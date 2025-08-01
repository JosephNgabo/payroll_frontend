import { Component, Optional, SkipSelf } from '@angular/core';
import { EmployeeDetailsComponent } from '../employee-details.component';

@Component({
  selector: 'app-employee-bank-info',
  templateUrl: './employee-bank-info.component.html',
  styleUrls: ['./employee-bank-info.component.scss']
})
export class EmployeeBankInfoComponent {
  constructor(
    @Optional() @SkipSelf() public parent: EmployeeDetailsComponent
  ) {}

  get employee() {
    return this.parent?.employee;
  }
  get employeeBankInfo() {
    return this.parent?.employeeBankInfo;
  }

  getBankInfoStatus(): string {
    if (!this.employeeBankInfo) {
      return 'Not Available';
    }
    if (this.employeeBankInfo.bank_name && this.employeeBankInfo.account_number) {
      return 'Complete';
    }
    return 'Incomplete';
  }

  getVerificationStatus(): string {
    if (!this.employeeBankInfo) {
      return 'Not Verified';
    }
    if (this.employeeBankInfo.bank_name && this.employeeBankInfo.account_number) {
      return 'Verified';
    }
    return 'Pending Verification';
  }

  getLastUpdatedDate(): string {
    if (!this.employeeBankInfo) {
      return 'Not available';
    }
    // You can add a last_updated field to the bank info if available
    return this.employeeBankInfo.updated_at ? 
      new Date(this.employeeBankInfo.updated_at).toLocaleDateString() : 
      'Not available';
  }

  getPaymentMethod(): string {
    if (!this.employeeBankInfo) {
      return 'Not specified';
    }
    // Determine payment method based on available data
    if (this.employeeBankInfo.iban) {
      return 'Bank Transfer (IBAN)';
    }
    if (this.employeeBankInfo.swift_code) {
      return 'International Transfer';
    }
    if (this.employeeBankInfo.account_number) {
      return 'Local Bank Transfer';
    }
    return 'Not specified';
  }

  getAccountType(): string {
    if (!this.employeeBankInfo) {
      return 'Not specified';
    }
    // You can add an account_type field to the bank info if available
    return this.employeeBankInfo.account_type || 'Savings Account';
  }
} 