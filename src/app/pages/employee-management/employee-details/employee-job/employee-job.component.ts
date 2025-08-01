import { Component, Optional, SkipSelf } from '@angular/core';
import { EmployeeDetailsComponent } from '../employee-details.component';

@Component({
  selector: 'app-employee-job',
  templateUrl: './employee-job.component.html',
  styleUrls: ['./employee-job.component.scss']
})
export class EmployeeJobComponent {
  constructor(
    @Optional() @SkipSelf() public parent: EmployeeDetailsComponent
  ) {}

  get employee() {
    return this.parent?.employee;
  }
  get getSalaryBasisLabel() {
    return this.parent?.getSalaryBasisLabel.bind(this.parent);
  }
  get getDepartmentName() {
    return this.parent?.getDepartmentName.bind(this.parent);
  }
    get getDeductionName() {
    return this.parent?.getDeductionName.bind(this.parent);
  }
  get getAllowanceName() {
    return this.parent?.getAllowanceName.bind(this.parent);
  }

  get employeeAllowances() {
    return this.parent?.employeeAllowances || [];
  }
  get employeeRssbDeductions() {
    return this.parent?.employeeRssbDeductions || [];
  }
  get employeeOtherDeductions() {
    return this.parent?.employeeOtherDeductions || [];
  }

  getContractStatus(endDate: string): string {
    if (!endDate) {
      return 'Permanent';
    }
    const end = new Date(endDate);
    const now = new Date();
    return end > now ? 'Active' : 'Expired';
  }

  getContractDuration(hireDate: string, endDate: string): string {
    if (!hireDate) {
      return 'Not specified';
    }
    
    const hire = new Date(hireDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const diffTime = Math.abs(end.getTime() - hire.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;
    
    let duration = '';
    if (years > 0) {
      duration += `${years} year${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
      duration += duration ? `, ${months} month${months > 1 ? 's' : ''}` : `${months} month${months > 1 ? 's' : ''}`;
    }
    if (days > 0 && years === 0) {
      duration += duration ? `, ${days} day${days > 1 ? 's' : ''}` : `${days} day${days > 1 ? 's' : ''}`;
    }
    
    return duration || 'Less than a day';
  }

  getYearsOfService(hireDate: string): string {
    if (!hireDate) {
      return 'Not specified';
    }
    
    const hire = new Date(hireDate);
    const now = new Date();
    
    const diffTime = Math.abs(now.getTime() - hire.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    let service = '';
    if (years > 0) {
      service += `${years} year${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
      service += service ? `, ${months} month${months > 1 ? 's' : ''}` : `${months} month${months > 1 ? 's' : ''}`;
    }
    
    return service || 'Less than a month';
  }

  isContractActive(endDate: string): boolean {
    if (!endDate) {
      return false;
    }
    const end = new Date(endDate);
    const now = new Date();
    return end > now;
  }

  isContractExpired(endDate: string): boolean {
    if (!endDate) {
      return false;
    }
    const end = new Date(endDate);
    const now = new Date();
    return end <= now;
  }
} 