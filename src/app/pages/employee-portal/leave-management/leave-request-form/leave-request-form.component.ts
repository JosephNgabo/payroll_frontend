import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface Employee {
  id: string;
  name: string;
}

interface LeaveType {
  id: string;
  name: string;
  maxDays: number;
}

@Component({
  selector: 'app-leave-request-form',
  templateUrl: './leave-request-form.component.html',
  styleUrls: ['./leave-request-form.component.scss']
})
export class LeaveRequestFormComponent implements OnInit {

  leaveRequestForm: FormGroup;
  breadCrumbItems: Array<{}>;
  isSubmitting: boolean = false;

  // Sample data - replace with actual data from services
  employees: Employee[] = [
    { id: '1', name: 'Kwizera Frank' },
    { id: '2', name: 'John Doe' },
    { id: '3', name: 'Jane Smith' }
  ];

  leaveTypes: LeaveType[] = [
    { id: 'annual', name: 'Annual Leave', maxDays: 25 },
    { id: 'sick', name: 'Sick Leave', maxDays: 10 },
    { id: 'personal', name: 'Personal Leave', maxDays: 5 },
    { id: 'maternity', name: 'Maternity Leave', maxDays: 90 },
    { id: 'paternity', name: 'Paternity Leave', maxDays: 7 }
  ];

  dayOptions: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.leaveRequestForm = this.formBuilder.group({
      employeeName: ['', Validators.required],
      reason: ['', Validators.required],
      startDate: ['', Validators.required],
      numberOfDays: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Employee Portal' },
      { label: 'Leave Management', link: '/employee-portal/leave-management' },
      { label: 'New Leave Request', active: true }
    ];

    // Pre-populate with current user if available
    this.leaveRequestForm.patchValue({
      employeeName: this.employees[0]?.name || ''
    });
  }

  /**
   * Get form control for easy access in template
   */
  get f() {
    return this.leaveRequestForm.controls;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.leaveRequestForm.valid) {
      this.isSubmitting = true;
      
      const formData = this.leaveRequestForm.value;
      console.log('Leave Request Data:', formData);

      // TODO: Implement actual API call
      setTimeout(() => {
        this.isSubmitting = false;
        // Navigate back to leave management after successful submission
        this.router.navigate(['/employee-portal/leave-management']);
        // TODO: Show success message
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.leaveRequestForm.controls).forEach(key => {
        this.leaveRequestForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Cancel and go back to leave management
   */
  onCancel(): void {
    this.router.navigate(['/employee-portal/leave-management']);
  }

  /**
   * Calculate end date based on start date and number of days
   */
  calculateEndDate(): string {
    const startDate = this.leaveRequestForm.get('startDate')?.value;
    const numberOfDays = this.leaveRequestForm.get('numberOfDays')?.value;
    
    if (startDate && numberOfDays) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + numberOfDays - 1);
      return end.toISOString().split('T')[0];
    }
    
    return '';
  }

  /**
   * Handle start date change to auto-calculate end date
   */
  onStartDateChange(): void {
    // This will trigger the end date calculation
    const endDate = this.calculateEndDate();
    console.log('Calculated end date:', endDate);
  }

  /**
   * Handle number of days change to auto-calculate end date
   */
  onNumberOfDaysChange(): void {
    // This will trigger the end date calculation
    const endDate = this.calculateEndDate();
    console.log('Calculated end date:', endDate);
  }
}

