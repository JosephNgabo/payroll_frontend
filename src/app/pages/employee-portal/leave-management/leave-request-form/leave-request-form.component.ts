import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeTimeOffRequestsService, EmployeeTimeOffRequest, CreateEmployeeTimeOffRequestRequest, CancelRequestPayload } from '../../../../core/services/employee-time-off-requests.service';
import { TimeOffTypesService, TimeOffType } from '../../../../core/services/time-off-types.service';
import { EmployeeProfileService } from '../../../../core/services/employee-profile.service';
import { EmployeeTimeOffBalanceService, EmployeeTimeOffBalance } from '../../../../core/services/employee-time-off-balance.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { environment } from '../../../../../environments/environment';

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

  // Permission tracking
  hasTimeOffManagementPermission: boolean = false;
  permissions: number[] = [];

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

    // Load user permissions from session storage
    this.loadUserPermissions();
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
   * Load user permissions from session storage
   */
  private loadUserPermissions(): void {
    const user = sessionStorage.getItem('current_user');
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        this.permissions = userData.permissions || [];
        
        // Convert permissions to numbers if they're strings
        this.permissions = this.permissions.map(p => typeof p === 'string' ? parseInt(p, 10) : p);
        
        // Check if user has employee time off requests permission (p_id: 7002)
        this.hasTimeOffManagementPermission = this.permissions.includes(7002);
        
        console.log('User permissions loaded:', this.permissions);
        console.log('Has time off management permission:', this.hasTimeOffManagementPermission);
      } catch (e) {
        console.error('Error parsing user permissions:', e);
        this.permissions = [];
        this.hasTimeOffManagementPermission = false;
      }
    } else {
      console.warn('No user data found in session storage');
      this.hasTimeOffManagementPermission = false;
    }
  }

  /**
   * Check if user can create leave requests
   */
  canCreateLeaveRequest(): boolean {
    return this.hasTimeOffManagementPermission;
  }

  /**
   * Check if user can cancel leave requests
   * For now, assuming same permission as creating requests
   */
  canCancelLeaveRequest(): boolean {
    return this.hasTimeOffManagementPermission;
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
    if (!this.canCreateLeaveRequest()) {
      this.toastr.warning('You need "Employee Time Off Requests" permission (ID: 7002) to create leave requests. Please contact HR to request this permission.', 'Permission Required');
      return;
    }
    
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
        
        // Reload permissions after employee profile is loaded
        // This ensures we have the latest permission data
        this.loadUserPermissions();
        
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
    
    // Debug API call
    console.log('🔍 API Debug - Loading leave balances:');
    console.log('  - Employee ID:', this.currentEmployeeId);
    console.log('  - API URL:', `${environment.apiUrl}/employee-time-off-balances/employee/${this.currentEmployeeId}`);
    console.log('  - User permissions:', this.permissions);
    console.log('  - Has permission 7002:', this.hasTimeOffManagementPermission);
    
    this.employeeTimeOffBalanceService.getEmployeeTimeOffBalances(this.currentEmployeeId).subscribe({
      next: (balances) => {
        this.leaveBalances = balances;
        console.log('✅ Leave balances loaded successfully:', balances);
        this.isLoadingBalances = false;
      },
      error: (error) => {
        console.error('❌ Error loading leave balances:', error);
        console.log('🔍 Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          error: error.error
        });
        this.isLoadingBalances = false;
        
        // Check for permission error specifically
        if (error.message && error.message.includes('Time Off Management permissions required')) {
          console.log('🚫 Permission error detected for leave balances - user needs permission 7002');
          console.log('🔍 Current permission state:', {
            permissions: this.permissions,
            hasPermission7002: this.hasTimeOffManagementPermission,
            permission7002Included: this.permissions.includes(7002)
          });
          // Don't show error toast as this is expected when user lacks permission
          // The UI will show appropriate messaging based on permission status
        } else {
          // Show error for other types of errors (network, server, etc.)
          this.toastr.error('Failed to load leave balances. Please try again later.', 'Error');
        }
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
        
        // Check for permission error specifically
        if (error.message && error.message.includes('Time Off Management permissions required')) {
          console.log('Permission error detected for time-off types - user needs permission 7002');
          // Don't show error toast as this is expected when user lacks permission
        } else {
          this.toastr.error('Failed to load time-off types', 'Error');
        }
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
    
    // Debug API call
    console.log('🔍 API Debug - Loading pending requests:');
    console.log('  - Employee ID:', this.currentEmployeeId);
    console.log('  - API URL:', `${environment.apiUrl}/employee-time-off-requests/employee/${this.currentEmployeeId}`);
    console.log('  - User permissions:', this.permissions);
    console.log('  - Has permission 7002:', this.hasTimeOffManagementPermission);
    
    this.employeeTimeOffRequestsService.getEmployeeTimeOffRequests(this.currentEmployeeId)
      .subscribe({
        next: (requests) => {
          this.pendingRequests = requests;
          console.log('✅ Pending requests loaded successfully:', requests);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error loading pending requests:', error);
          console.log('🔍 Error details:', {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            error: error.error
          });
          
          // Check for permission error specifically
          if (error.message && error.message.includes('Time Off Management permissions required')) {
            this.error = 'You need "Employee Time Off Requests" permission (ID: 7002) to view leave requests. Please contact HR to request this permission.';
            console.log('🚫 Permission error detected for pending requests - user needs permission 7002');
            console.log('🔍 Current permission state:', {
              permissions: this.permissions,
              hasPermission7002: this.hasTimeOffManagementPermission,
              permission7002Included: this.permissions.includes(7002)
            });
          } else {
            this.error = error.message || 'Failed to load pending requests';
          }
          this.isLoading = false;
          // Don't show toast error as the error will be displayed in the UI
        }
      });
  }

  /**
   * Get status class for styling based on numeric status
   */
  getStatusClass(status: string | number | null | undefined): string {
    // Handle null, undefined values
    if (status === null || status === undefined) {
      console.log('🔍 Status is null/undefined, defaulting to pending');
      return 'pending';
    }
    
    // Convert to number if it's a string
    const statusNum = typeof status === 'string' ? parseInt(status, 10) : status;
    
    console.log(`🔍 getStatusClass called with status: ${status} (type: ${typeof status}), converted to: ${statusNum}`);
    
    switch (statusNum) {
      case 1: // PENDING
        console.log('🔍 Status 1: PENDING');
        return 'pending';
      case 2: // APPROVED
        console.log('🔍 Status 2: APPROVED');
        return 'approved';
      case 3: // REJECTED
        console.log('🔍 Status 3: REJECTED');
        return 'rejected';
      case 4: // CANCELLED
        console.log('🔍 Status 4: CANCELLED');
        return 'cancelled';
      default:
        console.log(`🔍 Status ${statusNum}: UNKNOWN, defaulting to pending`);
        return 'pending';
    }
  }

  /**
   * Get the correct status for a request (prioritize approval_status over status)
   */
  getRequestStatus(request: any): string | number | null | undefined {
    // Special handling for cancellation - if either status is 4, show as cancelled
    if (request.status === '4' || request.status === 4 || 
        request.approval_status === '4' || request.approval_status === 4) {
      console.log(`🔍 Request ${request.id} is cancelled (status: ${request.status}, approval_status: ${request.approval_status})`);
      return 4; // Return as number for consistency
    }
    
    // Check if request has approval_status first (this is the correct field for approval state)
    if (request.approval_status !== undefined && request.approval_status !== null) {
      console.log(`🔍 Using approval_status: ${request.approval_status} for request ${request.id}`);
      return request.approval_status;
    }
    
    // Fallback to status field
    if (request.status !== undefined && request.status !== null) {
      console.log(`🔍 Using status: ${request.status} for request ${request.id}`);
      return request.status;
    }
    
    console.log(`🔍 No status found for request ${request.id}, defaulting to null`);
    return null;
  }

  /**
   * Get status label based on numeric status
   */
  getStatusLabel(status: string | number | null | undefined): string {
    // Handle null, undefined values
    if (status === null || status === undefined) {
      console.log('🔍 Status is null/undefined, defaulting to Pending');
      return 'Pending';
    }
    
    // Convert to number if it's a string
    const statusNum = typeof status === 'string' ? parseInt(status, 10) : status;
    
    console.log(`🔍 getStatusLabel called with status: ${status} (type: ${typeof status}), converted to: ${statusNum}`);
    
    switch (statusNum) {
      case 1: // PENDING
        console.log('🔍 Status 1: Pending');
        return 'Pending';
      case 2: // APPROVED
        console.log('🔍 Status 2: Approved');
        return 'Approved';
      case 3: // REJECTED
        console.log('🔍 Status 3: Rejected');
        return 'Rejected';
      case 4: // CANCELLED
        console.log('🔍 Status 4: Cancelled');
        return 'Cancelled';
      default:
        console.log(`🔍 Status ${statusNum}: UNKNOWN, defaulting to Pending`);
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
    if (!this.canCancelLeaveRequest()) {
      this.toastr.error('You need "Employee Time Off Requests" permission (ID: 7002) to cancel leave requests. Please contact HR to request this permission.', 'Permission Denied');
      return;
    }
    
    Swal.fire({
      title: 'Cancel Leave Request?',
      text: `Are you sure you want to cancel your ${request.time_off_type?.name || 'leave'} request?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it',
      input: 'text',
      inputPlaceholder: 'Enter cancellation reason (required)',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return 'You need to provide a cancellation reason!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const payload: CancelRequestPayload = {
          reason: result.value
        };
        
        this.employeeTimeOffRequestsService.cancelEmployeeTimeOffRequest(request.id, payload)
          .subscribe({
            next: (response) => {
              // Debug the cancellation response
              console.log('✅ Cancellation successful - Response:', response);
              console.log('🔍 Response data:', response);
              
              // Check if response has status information
              if (response && response.data) {
                // For cancellation, we should update both status and approval_status
                if (response.data.status !== undefined) {
                  console.log('🔍 Using status from API response:', response.data.status);
                  request.status = response.data.status;
                }
                if (response.data.approval_status !== undefined) {
                  console.log('🔍 Using approval_status from API response:', response.data.approval_status);
                  request.approval_status = response.data.approval_status;
                }
              } else {
                // Fallback: set both status fields to cancelled
                console.log('🔍 No response data, setting status to 4 (CANCELLED)');
                request.status = '4'; // Cancelled status
                request.approval_status = '4'; // Cancelled status
              }
              
              console.log('🔍 Final request status after cancellation:', {
                status: request.status,
                approval_status: request.approval_status,
                displayStatus: this.getRequestStatus(request)
              });
              
              this.toastr.success('Your leave request has been cancelled successfully!', 'Success');
              this.loadPendingRequests(); // Refresh the list
            },
            error: (error) => {
              let errorMessage = 'Failed to cancel request. Please try again.';
              if (error.error && error.error.errors) {
                // Show validation errors
                const errors = Object.values(error.error.errors).flat();
                errorMessage = errors.join(', ');
              } else if (error.error && error.error.message) {
                errorMessage = error.error.message;
              }
              
              this.toastr.error(errorMessage, 'Error');
            }
          });
      }
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.leaveRequestForm.valid) {
      // Check permission before submitting
      if (!this.canCreateLeaveRequest()) {
        this.toastr.error('You need "Employee Time Off Requests" permission (ID: 7002) to create leave requests. Please contact HR to request this permission.', 'Permission Denied');
        return;
      }
      
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
            
            // Check for permission error specifically
            if (error.message && error.message.includes('Time Off Management permissions required')) {
              this.toastr.error('You need "Employee Time Off Requests" permission (ID: 7002) to create leave requests. Please contact HR to request this permission.', 'Permission Required');
              this.closeRequestModal();
              return;
            }
            
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

  /**
   * Debug method to analyze pending requests status
   */
  debugPendingRequestsStatus(): void {
    console.log('🧪 Debugging pending requests status...');
    console.log('🔍 Current pending requests:', this.pendingRequests);
    
    this.pendingRequests.forEach((request, index) => {
      console.log(`🔍 Request ${index + 1}:`, {
        id: request.id,
        status: request.status,
        approval_status: request.approval_status,
        correctStatus: this.getRequestStatus(request),
        statusType: typeof request.status,
        statusLabel: this.getStatusLabel(this.getRequestStatus(request)),
        statusClass: this.getStatusClass(this.getRequestStatus(request)),
        timeOffType: request.time_off_type?.name,
        startDate: request.start_date,
        endDate: request.end_date
      });
    });
  }

  /**
   * Debug method to test pending requests API directly
   */
  debugPendingRequestsAPI(): void {
    console.log('🧪 Testing pending requests API directly...');
    
    if (!this.currentEmployeeId) {
      console.log('❌ No employee ID available');
      return;
    }
    
    const url = `${environment.apiUrl}/employee-time-off-requests/employee/${this.currentEmployeeId}`;
    console.log('🔍 API URL:', url);
    
    fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', response.headers);
      return response.text();
    })
    .then(data => {
      console.log('🔍 Raw response data:', data);
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ Parsed JSON response:', jsonData);
        console.log('✅ Requests count:', jsonData.data?.length || 0);
        
        if (jsonData.data) {
          jsonData.data.forEach((request: any, index: number) => {
            console.log(`🔍 API Request ${index + 1}:`, {
              id: request.id,
              status: request.status,
              statusType: typeof request.status,
              timeOffType: request.time_off_type?.name,
              startDate: request.start_date,
              endDate: request.end_date
            });
          });
        }
      } catch (e) {
        console.error('❌ Error parsing JSON:', e);
        console.log('🔍 Raw data that failed to parse:', data);
      }
    })
    .catch(error => {
      console.error('❌ Fetch error:', error);
    });
  }

  /**
   * Refresh all data (for testing after admin approval)
   */
  refreshAllData(): void {
    console.log('🔄 Refreshing all data...');
    this.loadEmployeeProfile();
    this.loadTimeOffTypes();
    this.loadPendingRequests();
    this.loadLeaveBalances();
  }

  /**
   * Test cancellation API response structure
   */
  testCancellationAPIResponse(): void {
    console.log('🧪 Testing cancellation API response structure...');
    
    // Find a pending request to test with
    const pendingRequest = this.pendingRequests.find(r => this.getRequestStatus(r) === 1);
    
    if (!pendingRequest) {
      console.log('❌ No pending requests available for testing cancellation');
      Swal.fire({
        icon: 'warning',
        title: 'No Test Data',
        text: 'No pending requests available for testing cancellation response.',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    console.log('🧪 Testing cancellation with request:', {
      id: pendingRequest.id,
      currentStatus: this.getRequestStatus(pendingRequest),
      statusLabel: this.getStatusLabel(this.getRequestStatus(pendingRequest))
    });
    
    const payload = {
      reason: 'Test cancellation - checking API response structure'
    };
    
    console.log('🧪 Sending test cancellation payload:', payload);
    
    this.employeeTimeOffRequestsService.cancelEmployeeTimeOffRequest(pendingRequest.id, payload)
      .subscribe({
        next: (response) => {
          console.log('✅ Test cancellation successful!');
          console.log('🔍 Full response object:', response);
          console.log('🔍 Response type:', typeof response);
          console.log('🔍 Response keys:', Object.keys(response || {}));
          
          // Check for status in different possible locations
          if (response) {
            console.log('🔍 response.status:', response.status);
            console.log('🔍 response.data?.status:', response.data?.status);
            console.log('🔍 response.data?.approval_status:', response.data?.approval_status);
          }
          
          // Show detailed response info
          Swal.fire({
            icon: 'success',
            title: 'Test Cancellation Successful',
            html: `
              <div class="text-start">
                <p><strong>Response Type:</strong> ${typeof response}</p>
                <p><strong>Response Keys:</strong> ${Object.keys(response || {}).join(', ')}</p>
                <p><strong>Status Field:</strong> ${response?.data?.status || 'Not found'}</p>
                <p><strong>Approval Status Field:</strong> ${response?.data?.approval_status || 'Not found'}</p>
              </div>
            `,
            confirmButtonText: 'OK'
          });
        },
        error: (error) => {
          console.log('❌ Test cancellation failed:', error);
          console.log('❌ Error response:', error.error);
          
          Swal.fire({
            icon: 'error',
            title: 'Test Cancellation Failed',
            text: error.error?.message || error.message || 'Unknown error',
            confirmButtonText: 'OK'
          });
        }
      });
  }
}

