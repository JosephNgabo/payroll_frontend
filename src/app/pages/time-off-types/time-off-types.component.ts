import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { TimeOffTypesService, TimeOffType, CreateTimeOffTypeRequest } from '../../core/services/time-off-types.service';
import { TimeOffKindsService, TimeOffKind } from '../../core/services/time-off-kinds.service';

@Component({
  selector: 'app-time-off-types',
  templateUrl: './time-off-types.component.html',
  styleUrls: ['./time-off-types.component.scss']
})
export class TimeOffTypesComponent implements OnInit {
  timeOffTypes: TimeOffType[] = [];
  isLoading = false;
  error: string | null = null;
  term: string = '';
  breadCrumbItems: Array<{}> = [
    { label: 'Configuration' },
    { label: 'Time Off Types', active: true }
  ];
  selectedTimeOffType: TimeOffType | null = null;
  modalRef: any;

  timeOffTypeForm: FormGroup;
  submitted = false;
  isEdit = false;
  selectedTimeOffTypeId: string | null = null;
  saving = false;
  deleteLoading = false;

  // Permission system - using existing p_id approach
  permissions: (number | string)[] = [];

  // API data
  allTimeOffTypes: TimeOffType[] = [];
  timeOffKinds: TimeOffKind[] = [];

  // Form options
  takeTimeOffInOptions = [
    { label: 'Days', value: 1 },
    { label: 'Hours', value: 2 },
    { label: 'Weeks', value: 3 }
  ];

  approvalTypeOptions = [
    { label: 'Both can approve', value: 1 },
    { label: 'Department Officer Approval', value: 2 },
    { label: 'Time-Off Officer Approval', value: 3 }
  ];

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private timeOffTypesService: TimeOffTypesService,
    private timeOffKindsService: TimeOffKindsService
  ) {
    this.timeOffTypeForm = this.fb.group({
      name: ['', [Validators.required]],
      code: ['', [Validators.required]],
      description: ['', [Validators.required]],
      kind_id: ['', [Validators.required]],
      is_paid: [true],
      take_time_off_in: [1, [Validators.required]],
      require_supporting_document: [false],
      requires_allocation: [true],
      approval_type: [2, [Validators.required]]
    });

    // Get permissions from session storage (same as sidebar)
    const user = sessionStorage.getItem('current_user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        this.permissions = userData.permissions || [];
      } catch (e) {
        console.error('Error parsing user permissions:', e);
        this.permissions = [];
      }
    }
  }

  ngOnInit(): void {
    this.loadTimeOffTypes();
    this.loadTimeOffKinds();
  }

  // Permission check methods using p_id system for Time Off Types
  // Temporarily enabling all permissions for development
  canViewTimeOffTypes(): boolean {
    return true;
  }

  canCreateTimeOffType(): boolean {
    return true;
  }

  canUpdateTimeOffType(): boolean {
    return true;
  }

  canDeleteTimeOffType(): boolean {
    return true;
  }

  // Check if user has any time off type management permissions
  hasAnyTimeOffTypePermission(): boolean {
    return true;
  }

  loadTimeOffTypes() {
    this.isLoading = true;
    this.error = null;
    
    this.timeOffTypesService.getTimeOffTypes().subscribe({
      next: (data) => {
        this.allTimeOffTypes = data;
        this.timeOffTypes = [...data];
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
        console.error('Error loading time off types:', error);
      }
    });
  }

  loadTimeOffKinds() {
    this.timeOffKindsService.getTimeOffKinds().subscribe({
      next: (data) => {
        this.timeOffKinds = data;
      },
      error: (error) => {
        console.error('Error loading time off kinds:', error);
      }
    });
  }

  searchTimeOffTypes() {
    if (!this.term) {
      this.timeOffTypes = [...this.allTimeOffTypes];
      return;
    }
    const lowerTerm = this.term.toLowerCase();
    this.timeOffTypes = this.allTimeOffTypes.filter(type =>
      type.name.toLowerCase().includes(lowerTerm) ||
      type.code.toLowerCase().includes(lowerTerm) ||
      type.description.toLowerCase().includes(lowerTerm)
    );
  }

  openViewModal(content: any, timeOffType: TimeOffType) {
    this.selectedTimeOffType = timeOffType;
    this.modalRef = this.modalService.open(content, { size: 'lg' });
  }

  openModal(content: any, timeOffType?: TimeOffType) {
    this.submitted = false;
    this.isEdit = !!timeOffType;
    this.selectedTimeOffTypeId = timeOffType ? timeOffType.id : null;
    
    if (this.isEdit && timeOffType) {
      console.log('Editing time off type:', timeOffType);
      this.timeOffTypeForm.patchValue({
        name: timeOffType.name,
        code: timeOffType.code,
        description: timeOffType.description,
        kind_id: timeOffType.kind_id,
        is_paid: timeOffType.is_paid,
        take_time_off_in: timeOffType.take_time_off_in,
        require_supporting_document: timeOffType.require_supporting_document,
        requires_allocation: timeOffType.requires_allocation,
        approval_type: timeOffType.approval_type
      });
    } else {
      this.timeOffTypeForm.reset({
        is_paid: true,
        take_time_off_in: 1,
        require_supporting_document: false,
        requires_allocation: true,
        approval_type: 2
      });
    }
    this.modalService.open(content, { size: 'lg' });
  }

  onSubmit() {
    this.submitted = true;
    this.saving = true;
    
    if (this.timeOffTypeForm.invalid) {
      setTimeout(() => {
        this.saving = false;
      }, 800);
      return;
    }

    const formData = this.timeOffTypeForm.value;
    console.log('Sending payload:', formData);

    const requestData: CreateTimeOffTypeRequest = {
      name: formData.name,
      code: formData.code,
      description: formData.description,
      kind_id: formData.kind_id,
      is_paid: formData.is_paid,
      take_time_off_in: formData.take_time_off_in,
      require_supporting_document: formData.require_supporting_document,
      requires_allocation: formData.requires_allocation,
      approval_type: formData.approval_type
    };

    if (this.isEdit && this.selectedTimeOffTypeId) {
      // Update existing
      console.log('Updating time off type with ID:', this.selectedTimeOffTypeId);
      console.log('Update payload:', requestData);
      this.timeOffTypesService.updateTimeOffType(this.selectedTimeOffTypeId, requestData).subscribe({
        next: (response) => {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Time Off Type updated successfully',
            text: 'Time Off Type updated successfully',
            showConfirmButton: false,
            timer: 1500
          });
          this.modalService.dismissAll();
          this.loadTimeOffTypes();
          this.isEdit = false;
          this.selectedTimeOffTypeId = null;
          this.saving = false;
        },
        error: (error) => {
          this.saving = false;
          this.handleApiError(error);
        }
      });
    } else {
      // Create new
      this.timeOffTypesService.createTimeOffType(requestData).subscribe({
        next: (newType) => {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Time Off Type created successfully',
            showConfirmButton: false,
            timer: 1500
          });
          this.modalService.dismissAll();
          this.loadTimeOffTypes();
          this.isEdit = false;
          this.selectedTimeOffTypeId = null;
          this.saving = false;
        },
        error: (error) => {
          this.saving = false;
          this.handleApiError(error);
        }
      });
    }
  }

  private handleApiError(error: any) {
    if (error && error.errors) {
      // Validation error
      let errorMessage = '<ul>';
      
      Object.keys(error.errors).forEach(field => {
        error.errors[field].forEach((message: string) => {
          errorMessage += `<li>${message}</li>`;
        });
      });
      
      errorMessage += '</ul>';
      
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Validation Error',
        html: errorMessage,
        showConfirmButton: true
      });
    } else {
      // General error
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Error',
        text: error.message || 'An error occurred',
        showConfirmButton: true
      });
    }
  }

  confirm(id: string, modalTemplate: any) {
    this.selectedTimeOffTypeId = id;
    const timeOffType = this.allTimeOffTypes.find(t => t.id === id);
    console.log('Confirming deletion of time off type:', timeOffType);
    this.modalService.open(modalTemplate, { centered: true });
  }

  deleteTimeOffType(id: string | null) {
    if (!id) return;
    this.deleteLoading = true;
    console.log('Deleting time off type with ID:', id);

    this.timeOffTypesService.deleteTimeOffType(id).subscribe({
      next: (response) => {
        console.log('Delete response:', response);
        this.modalService.dismissAll();
        this.loadTimeOffTypes();
        this.deleteLoading = false;
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Time Off Type deleted successfully',
          text: response.message,
          showConfirmButton: false,
          timer: 1500
        });
      },
      error: (error) => {
        console.error('Delete error:', error);
        this.deleteLoading = false;
        this.handleApiError(error);
      }
    });
  }

  // Helper methods
  getTakeTimeOffInLabel(value: number): string {
    const option = this.takeTimeOffInOptions.find(opt => opt.value === value);
    return option ? option.label : 'Unknown';
  }

  getApprovalTypeLabel(value: number): string {
    const option = this.approvalTypeOptions.find(opt => opt.value === value);
    return option ? option.label : 'Unknown';
  }

  getKindName(kindId: string): string {
    const kind = this.timeOffKinds.find(k => k.id === kindId);
    return kind ? kind.name : 'Unknown';
  }

  getTimeOffTypeName(id: string): string {
    const timeOffType = this.allTimeOffTypes.find(t => t.id === id);
    return timeOffType ? `${timeOffType.name} (${timeOffType.code})` : 'Unknown';
  }

  // Convenience getter for easy access to form fields
  get f() { return this.timeOffTypeForm.controls; }
}
