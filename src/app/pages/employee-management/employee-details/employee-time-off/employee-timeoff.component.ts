import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeTimeOffBalanceService, EmployeeTimeOffBalance, CreateEmployeeTimeOffBalanceRequest, UpdateEmployeeTimeOffBalanceRequest } from '../../../../core/services/employee-time-off-balance.service';
import { TimeOffTypesService, TimeOffType } from '../../../../core/services/time-off-types.service';

@Component({
  selector: 'app-employee-timeoff',
  templateUrl: './employee-timeoff.component.html',
  styleUrls: ['./employee-timeoff.component.scss']
})
export class EmployeeTimeoffComponent implements OnInit {
  employeeId: string = '';
  timeOffBalances: EmployeeTimeOffBalance[] = [];
  timeOffTypes: TimeOffType[] = [];
  isLoading = false;
  error: string | null = null;
  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;
  isSubmitting = false;
  selectedBalance: EmployeeTimeOffBalance | null = null;

  // Form
  timeOffBalanceForm: FormGroup;

  // Summary calculations
  totalDaysToBook = 0;
  totalPendingRequests = 0;
  totalDaysInContract = 0;
  totalDaysTaken = 0;
  totalCarryoverDays = 0;

  constructor(
    private route: ActivatedRoute,
    private employeeTimeOffBalanceService: EmployeeTimeOffBalanceService,
    private timeOffTypesService: TimeOffTypesService,
    private fb: FormBuilder
  ) {
    this.timeOffBalanceForm = this.fb.group({
      time_off_type_id: ['', Validators.required],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(2020), Validators.max(2030)]],
      total_days: [0, [Validators.required, Validators.min(0)]],
      used_days: [0, [Validators.required, Validators.min(0)]],
      remaining_days: [0, [Validators.required, Validators.min(0)]],
      carried_over_days: [0, [Validators.required, Validators.min(0)]],
      pending_days: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // Get employeeId from route parameters
    this.route.parent?.paramMap.subscribe(params => {
      this.employeeId = params.get('id') || '';
      if (this.employeeId) {
        this.loadEmployeeTimeOffBalances();
        this.loadTimeOffTypes();
      } else {
        console.error('No employee ID found in route parameters');
        this.error = 'Employee ID not found';
      }
    });
  }

  loadEmployeeTimeOffBalances() {
    if (!this.employeeId) {
      this.error = 'Employee ID is required';
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.employeeTimeOffBalanceService.getEmployeeTimeOffBalances(this.employeeId).subscribe({
      next: (data) => {
        this.timeOffBalances = data;
        this.calculateSummary();
        this.isLoading = false;
        console.log('Employee time-off balances loaded:', data);
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
        console.error('Error loading employee time-off balances:', error);
      }
    });
  }

  loadTimeOffTypes() {
    this.timeOffTypesService.getTimeOffTypes().subscribe({
      next: (data) => {
        this.timeOffTypes = data;
        console.log('Time off types loaded:', data);
      },
      error: (error) => {
        console.error('Error loading time off types:', error);
      }
    });
  }

  calculateSummary() {
    this.totalDaysToBook = this.timeOffBalances.reduce((sum, balance) => sum + balance.remaining_days, 0);
    this.totalPendingRequests = this.timeOffBalances.reduce((sum, balance) => sum + balance.pending_days, 0);
    this.totalDaysInContract = this.timeOffBalances.reduce((sum, balance) => sum + balance.total_days, 0);
    this.totalDaysTaken = this.timeOffBalances.reduce((sum, balance) => sum + balance.used_days, 0);
    this.totalCarryoverDays = this.timeOffBalances.reduce((sum, balance) => sum + balance.carried_over_days, 0);
  }

  getTimeOffTypeName(balance: EmployeeTimeOffBalance): string {
    return balance.time_off_type ? balance.time_off_type.name : 'Unknown';
  }

  getTimeOffTypeCode(balance: EmployeeTimeOffBalance): string {
    return balance.time_off_type ? balance.time_off_type.code : 'N/A';
  }

  openAddModal() {
    this.showAddModal = true;
    this.timeOffBalanceForm.reset({
      year: new Date().getFullYear(),
      total_days: 0,
      used_days: 0,
      remaining_days: 0,
      carried_over_days: 0,
      pending_days: 0
    });
  }

  openEditModal(balance: EmployeeTimeOffBalance) {
    this.selectedBalance = balance;
    this.showEditModal = true;
    this.timeOffBalanceForm.patchValue({
      time_off_type_id: balance.time_off_type_id,
      year: balance.year,
      total_days: balance.total_days,
      used_days: balance.used_days,
      remaining_days: balance.remaining_days,
      carried_over_days: balance.carried_over_days,
      pending_days: balance.pending_days
    });
  }

  openDeleteModal(balance: EmployeeTimeOffBalance) {
    this.selectedBalance = balance;
    this.showDeleteModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.timeOffBalanceForm.reset();
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedBalance = null;
    this.timeOffBalanceForm.reset();
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedBalance = null;
  }

  onSubmit() {
    if (!this.employeeId) {
      this.error = 'Employee ID is required';
      return;
    }

    if (this.timeOffBalanceForm.valid) {
      this.isSubmitting = true;
      const formData = this.timeOffBalanceForm.value;
      
      if (this.showAddModal) {
        // Create new balance
        const request: CreateEmployeeTimeOffBalanceRequest = {
          employee_id: this.employeeId,
          time_off_type_id: formData.time_off_type_id,
          year: formData.year,
          total_days: formData.total_days,
          used_days: formData.used_days,
          remaining_days: formData.remaining_days,
          carried_over_days: formData.carried_over_days,
          pending_days: formData.pending_days
        };

        this.employeeTimeOffBalanceService.createEmployeeTimeOffBalance(request).subscribe({
          next: (response) => {
            console.log('Time-off balance created successfully:', response);
            this.closeAddModal();
            this.loadEmployeeTimeOffBalances(); // Refresh the list
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error creating time-off balance:', error);
            this.error = error.message;
            this.isSubmitting = false;
          }
        });
      } else if (this.showEditModal && this.selectedBalance) {
        // Update existing balance
        const request: UpdateEmployeeTimeOffBalanceRequest = {
          employee_id: this.employeeId,
          time_off_type_id: formData.time_off_type_id,
          year: formData.year,
          total_days: formData.total_days,
          used_days: formData.used_days,
          remaining_days: formData.remaining_days,
          carried_over_days: formData.carried_over_days,
          pending_days: formData.pending_days
        };

        this.employeeTimeOffBalanceService.updateEmployeeTimeOffBalance(this.selectedBalance.id, request).subscribe({
          next: (response) => {
            console.log('Time-off balance updated successfully:', response);
            this.closeEditModal();
            this.loadEmployeeTimeOffBalances(); // Refresh the list
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error updating time-off balance:', error);
            this.error = error.message;
            this.isSubmitting = false;
          }
        });
      }
    } else {
      this.timeOffBalanceForm.markAllAsTouched();
    }
  }

  onDelete() {
    if (this.selectedBalance) {
      this.isSubmitting = true;
      
      this.employeeTimeOffBalanceService.deleteEmployeeTimeOffBalance(this.selectedBalance.id).subscribe({
        next: (response) => {
          console.log('Time-off balance deleted successfully:', response);
          this.closeDeleteModal();
          this.loadEmployeeTimeOffBalances(); // Refresh the list
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error deleting time-off balance:', error);
          this.error = error.message;
          this.isSubmitting = false;
        }
      });
    }
  }

  getTimeOffTypeNameById(typeId: string): string {
    const type = this.timeOffTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  }
} 