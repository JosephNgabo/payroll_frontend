import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeTimeOffRequestsService, EmployeeTimeOffRequest, CreateEmployeeTimeOffRequestRequest } from '../../../../core/services/employee-time-off-requests.service';
import { TimeOffTypesService, TimeOffType } from '../../../../core/services/time-off-types.service';
import { EmployeeProfileService } from '../../../../core/services/employee-profile.service';
import { EmployeeTimeOffBalanceService, EmployeeTimeOffBalance } from '../../../../core/services/employee-time-off-balance.service';
import { ToastrService } from 'ngx-toastr';

interface PendingRequest {
  id: string;
  leaveType: string;
  leaveTypeCode: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  reason: string;
  status: string;
  submittedOn: Date;
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
  showRequestModal: boolean = false;

  // Real time-off types from API
  leaveTypes: TimeOffType[] = [];
  isLoadingTimeOffTypes: boolean = false;

  // Real pending requests from API
  pendingRequests: EmployeeTimeOffRequest[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  
  // Employee data
  currentEmployeeId: string | null = null;
  isLoadingEmployee: boolean = false;
  
  // Leave balances
  leaveBalances: EmployeeTimeOffBalance[] = [];
  isLoadingBalances: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private employeeTimeOffRequestsService: EmployeeTimeOffRequestsService,
    private timeOffTypesService: TimeOffTypesService,
    private employeeProfileService: EmployeeProfileService,
    private employeeTimeOffBalanceService: EmployeeTimeOffBalanceService,
    private toastr: ToastrService
  ) {
    this.leaveRequestForm = this.formBuilder.group({
      timeOffType: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      halfDay: [false],
      timeOffPeriod: [null],
      reason: ['']
    });

    // Add conditional validation for timeOffPeriod and endDate
    this.leaveRequestForm.get('halfDay')?.valueChanges.subscribe(halfDay => {
      const timeOffPeriodControl = this.leaveRequestForm.get('timeOffPeriod');
      const endDateControl = this.leaveRequestForm.get('endDate');
      
      if (halfDay) {
        // Half-day selected: timeOffPeriod required, endDate not required
        timeOffPeriodControl?.setValidators([Validators.required]);
        endDateControl?.clearValidators();
        endDateControl?.setValue('');
      } else {
        // Full day selected: endDate required, timeOffPeriod not required
        timeOffPeriodControl?.clearValidators();
        timeOffPeriodControl?.setValue('');
        endDateControl?.setValidators([Validators.required]);
      }
      
      timeOffPeriodControl?.updateValueAndValidity();
      endDateControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Employee Portal' },
      { label: 'Leave Management', active: true }
    ];
    
    this.loadEmployeeProfile();
    this.loadTimeOffTypes();
  }

  /**
   * Get form control for easy access in template
   */
  get f() {
    return this.leaveRequestForm.controls;
  }



  /**
   * Calculate duration based on dates and half-day selection
   */
  calculateDuration(): number {
    const startDate = this.leaveRequestForm.get('startDate')?.value;
    const endDate = this.leaveRequestForm.get('endDate')?.value;
    const halfDay = this.leaveRequestForm.get('halfDay')?.value;
    
    if (startDate) {
      if (halfDay) {
        // Half-day: always 0.5 days
        return 0.5;
      } else {
        // Full day(s): calculate based on date range
        if (endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          return diffDays;
        } else {
          // Single day
          return 1;
        }
      }
    }
    
    return 0;
  }

  /**
   * Handle start date change
   */
  onStartDateChange(): void {
    const startDate = this.leaveRequestForm.get('startDate')?.value;
    const halfDay = this.leaveRequestForm.get('halfDay')?.value;
    
    if (startDate && !halfDay) {
      // For full-day requests, auto-set end date to start date if not already set
      const endDate = this.leaveRequestForm.get('endDate')?.value;
      if (!endDate) {
        this.leaveRequestForm.patchValue({ endDate: startDate });
      }
    }
  }

  /**
   * Open request modal
   */
  openRequestModal(): void {
    this.showRequestModal = true;
    this.leaveRequestForm.reset({
      halfDay: false,
      timeOffPeriod: null,
      endDate: ''
    });
  }

  /**
   * Close request modal
   */
  closeRequestModal(): void {
    this.showRequestModal = false;
    this.leaveRequestForm.reset();
  }

  /**
   * Load employee profile to get employee ID
   */
  loadEmployeeProfile(): void {
    this.isLoadingEmployee = true;
    
    this.employeeProfileService.getProfile().subscribe({
      next: (response) => {
        this.currentEmployeeId = response.data.employee.id;
        console.log('Employee ID loaded:', this.currentEmployeeId);
        this.isLoadingEmployee = false;
        
        // Load pending requests and balances after getting employee ID
        this.loadPendingRequests();
        this.loadLeaveBalances();
      },
      error: (error) => {
        console.error('Error loading employee profile:', error);
        this.isLoadingEmployee = false;
        this.toastr.error('Failed to load employee profile. Please try again.', 'Error');
      }
    });
  }

  /**
   * Load leave balances for the employee
   */
  loadLeaveBalances(): void {
    if (!this.currentEmployeeId) {
      console.error('Employee ID not available yet');
      return;
    }
    
    this.isLoadingBalances = true;
    
    this.employeeTimeOffBalanceService.getEmployeeTimeOffBalances(this.currentEmployeeId).subscribe({
      next: (balances) => {
        this.leaveBalances = balances;
        console.log('Leave balances loaded:', balances);
        this.isLoadingBalances = false;
      },
      error: (error) => {
        console.error('Error loading leave balances:', error);
        this.isLoadingBalances = false;
        // Don't show error toast as balances might not be set up yet
      }
    });
  }

  /**
   * Load time-off types from API
   */
  loadTimeOffTypes(): void {
    this.isLoadingTimeOffTypes = true;
    
    this.timeOffTypesService.getTimeOffTypes().subscribe({
      next: (types) => {
        this.leaveTypes = types;
        this.isLoadingTimeOffTypes = false;
      },
      error: (error) => {
        console.error('Error loading time-off types:', error);
        this.isLoadingTimeOffTypes = false;
        this.toastr.error('Failed to load time-off types', 'Error');
      }
    });
  }

  /**
   * Load pending requests from API
   */
  loadPendingRequests(): void {
    if (!this.currentEmployeeId) {
      console.error('Employee ID not available yet');
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    
    console.log('Loading pending requests for employee:', this.currentEmployeeId);
    
    this.employeeTimeOffRequestsService.getEmployeeTimeOffRequests(this.currentEmployeeId)
      .subscribe({
        next: (requests) => {
          this.pendingRequests = requests;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = error.message || 'Failed to load pending requests';
          this.isLoading = false;
          this.toastr.error(this.error, 'Error');
        }
      });
  }

  /**
   * Get status class for styling based on numeric status
   */
  getStatusClass(status: string | number | null | undefined): string {
    // Handle null, undefined values
    if (status === null || status === undefined) {
      return 'pending';
    }
    
    // Convert to number if it's a string
    const statusNum = typeof status === 'string' ? parseInt(status, 10) : status;
    
    switch (statusNum) {
      case 1: // PENDING
        return 'pending';
      case 2: // APPROVED
        return 'approved';
      case 3: // REJECTED
        return 'rejected';
      case 4: // CANCELLED
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  /**
   * Get status label based on numeric status
   */
  getStatusLabel(status: string | number | null | undefined): string {
    // Handle null, undefined values
    if (status === null || status === undefined) {
      return 'Pending';
    }
    
    // Convert to number if it's a string
    const statusNum = typeof status === 'string' ? parseInt(status, 10) : status;
    
    switch (statusNum) {
      case 1: // PENDING
        return 'Pending';
      case 2: // APPROVED
        return 'Approved';
      case 3: // REJECTED
        return 'Rejected';
      case 4: // CANCELLED
        return 'Cancelled';
      default:
        return 'Pending';
    }
  }

  /**
   * Get status description based on numeric status
   */
  getStatusDescription(status: string | number | null | undefined): string {
    // Handle null, undefined values
    if (status === null || status === undefined) {
      return 'Leave request is pending approval';
    }
    
    // Convert to number if it's a string
    const statusNum = typeof status === 'string' ? parseInt(status, 10) : status;
    
    switch (statusNum) {
      case 1: // PENDING
        return 'Leave request is pending approval';
      case 2: // APPROVED
        return 'Leave request has been approved';
      case 3: // REJECTED
        return 'Leave request has been rejected';
      case 4: // CANCELLED
        return 'Leave request has been cancelled';
      default:
        return 'Leave request is pending approval';
    }
  }

  /**
   * View request details
   */
  viewRequest(request: EmployeeTimeOffRequest): void {
    console.log('Viewing request:', request);
    // TODO: Implement view functionality
  }

  /**
   * Cancel request
   */
  cancelRequest(request: EmployeeTimeOffRequest): void {
    console.log('Canceling request:', request);
    // TODO: Implement cancel functionality
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.leaveRequestForm.valid) {
      this.isSubmitting = true;
      
      const formData = this.leaveRequestForm.value;
      
      // Additional validation
      if (!this.currentEmployeeId) {
        this.toastr.error('Employee ID not found. Please refresh the page and try again.', 'Authentication Error');
        this.isSubmitting = false;
        return;
      }
      
      if (!formData.timeOffType) {
        this.toastr.error('Please select a time-off type.', 'Validation Error');
        this.isSubmitting = false;
        return;
      }
      
      const duration = this.calculateDuration();
      if (duration <= 0) {
        this.toastr.error('Please select valid dates for your leave request.', 'Validation Error');
        this.isSubmitting = false;
        return;
      }
      
      const requestData: CreateEmployeeTimeOffRequestRequest = {
        employee_id: this.currentEmployeeId,
        time_off_type_id: formData.timeOffType,
        start_date: formData.startDate,
        end_date: formData.halfDay ? formData.startDate : formData.endDate,
        requested_days: duration,
        time_off_period: formData.halfDay ? parseInt(formData.timeOffPeriod) : undefined,
        reason: formData.reason || "Annual family vacation"
      };

      console.log('Form Data:', formData);
      console.log('Employee ID:', this.currentEmployeeId);
      console.log('Calculated Duration:', duration);
      console.log('Leave Request Data being sent to API:', requestData);

      this.employeeTimeOffRequestsService.createEmployeeTimeOffRequest(requestData)
        .subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.closeRequestModal();
            this.toastr.success('Leave request submitted successfully!', 'Success');
            this.loadPendingRequests(); // Refresh the list
          },
          error: (error) => {
            this.isSubmitting = false;
            
            if (error.errors) {
              // Handle validation errors
              this.handleValidationErrors(error.errors);
            } else {
              // Handle other errors
              this.toastr.error(error.message || 'Failed to submit leave request', 'Error');
            }
          }
        });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.leaveRequestForm.controls).forEach(key => {
        this.leaveRequestForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Handle validation errors from API
   */
  private handleValidationErrors(errors: any): void {
    console.log('API Validation Errors:', errors);
    
    // Mark form as touched to show validation errors
    Object.keys(this.leaveRequestForm.controls).forEach(key => {
      this.leaveRequestForm.get(key)?.markAsTouched();
    });

    // Show validation error messages with better formatting
    Object.keys(errors).forEach(field => {
      const errorMessages = errors[field];
      if (errorMessages && errorMessages.length > 0) {
        const errorMessage = errorMessages[0];
        
        // Custom error messages for specific fields
        switch (field) {
          case 'employee_id':
            if (errorMessage.includes('not found')) {
              this.toastr.error('Employee not found. Please contact HR to verify your employee record.', 'Employee Error');
            } else {
              this.toastr.error(errorMessage, 'Employee Error');
            }
            break;
          case 'time_off_type_id':
            if (errorMessage.includes('No balance found')) {
              const selectedType = this.leaveRequestForm.get('timeOffType')?.value;
              const timeOffType = this.leaveTypes.find(type => type.id === selectedType);
              const typeName = timeOffType ? timeOffType.name : 'selected time-off type';
              
              this.toastr.error(
                `No leave balance available for "${typeName}". You may not have been allocated leave for this type, or your balance may have been used up. Please contact HR to check your leave allocation.`, 
                'No Leave Balance'
              );
            } else {
              this.toastr.error(errorMessage, 'Time-Off Type Error');
            }
            break;
          default:
            this.toastr.error(errorMessage, 'Validation Error');
        }
      }
    });
  }

  /**
   * Get available time-off types for the dropdown
   * Filters out types with 0 balance when they require allocation
   */
  getAvailableTimeOffTypes(): any[] {
    if (!this.leaveTypes || !this.leaveBalances) {
      return [];
    }
    
    return this.leaveTypes.filter(type => {
      // If requires_allocation is false, always include
      if (!type.requires_allocation) {
        return true;
      }
      
      // If requires_allocation is true, check if there's available balance
      const balance = this.leaveBalances.find(b => b.time_off_type_id === type.id);
      return balance ? balance.remaining_days > 0 : false;
    });
  }

  /**
   * Check if a time-off type is available for selection
   */
  isTimeOffTypeAvailable(timeOffTypeId: string): boolean {
    const timeOffType = this.leaveTypes.find(type => type.id === timeOffTypeId);
    if (!timeOffType) return false;
    
    // If requires_allocation is false, always allow selection
    if (!timeOffType.requires_allocation) {
      return true;
    }
    
    // If requires_allocation is true, check if there's available balance
    const balance = this.leaveBalances.find(b => b.time_off_type_id === timeOffTypeId);
    return balance ? balance.remaining_days > 0 : false;
  }

  /**
   * Check if a time-off type has available balance
   */
  hasAvailableBalance(timeOffTypeId: string): boolean {
    const balance = this.leaveBalances.find(b => b.time_off_type_id === timeOffTypeId);
    return balance ? balance.remaining_days > 0 : false;
  }

  /**
   * Get available balance for a time-off type
   */
  getAvailableBalance(timeOffTypeId: string): number {
    const balance = this.leaveBalances.find(b => b.time_off_type_id === timeOffTypeId);
    return balance ? balance.remaining_days : 0;
  }

  /**
   * Check if a time-off type should be disabled in the dropdown
   */
  isTimeOffTypeDisabled = (item: TimeOffType): boolean => {
    // If requires_allocation is false, never disable
    if (!item.requires_allocation) {
      return false;
    }
    
    // If requires_allocation is true, disable if no balance or 0 balance
    const balance = this.leaveBalances.find(b => b.time_off_type_id === item.id);
    return !balance || balance.remaining_days <= 0;
  }

  /**
   * Cancel and go back
   */
  onCancel(): void {
    this.router.navigate(['/employee-portal/dashboard']);
  }
}

