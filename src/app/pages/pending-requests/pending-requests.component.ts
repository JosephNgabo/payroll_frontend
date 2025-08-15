import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { EmployeeTimeOffRequestsAdminService, EmployeeTimeOffRequestAdmin } from '../../core/services/employee-time-off-requests-admin.service';

// Import Bootstrap for modal functionality
declare var bootstrap: any;

@Component({
  selector: 'app-pending-requests',
  templateUrl: './pending-requests.component.html',
  styleUrls: ['./pending-requests.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PendingRequestsComponent implements OnInit {
  
  pendingRequests: EmployeeTimeOffRequestAdmin[] = [];
  filteredRequests: EmployeeTimeOffRequestAdmin[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  selectedRequest: EmployeeTimeOffRequestAdmin | null = null;

  constructor(private employeeTimeOffRequestsAdminService: EmployeeTimeOffRequestsAdminService) { }

  ngOnInit(): void {
    this.loadPendingRequests();
  }

  /**
   * Load pending requests from API
   */
  loadPendingRequests() {
    this.isLoading = true;
    
    this.employeeTimeOffRequestsAdminService.getPendingEmployeeTimeOffRequests()
      .subscribe({
        next: (response) => {
          this.pendingRequests = response;
          this.filteredRequests = [...this.pendingRequests];
          this.isLoading = false;
          console.log('Pending requests loaded:', this.pendingRequests);
        },
        error: (error) => {
          console.error('Error loading pending requests:', error);
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load pending requests. Please try again.',
          });
        }
      });
  }

  /**
   * Filter requests based on search term
   */
  filterRequests() {
    if (!this.searchTerm.trim()) {
      this.filteredRequests = [...this.pendingRequests];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredRequests = this.pendingRequests.filter(request =>
        `${request.employee.first_name} ${request.employee.last_name}`.toLowerCase().includes(term) ||
        request.employee.personal_email.toLowerCase().includes(term) ||
        request.time_off_type.name.toLowerCase().includes(term) ||
        request.reason.toLowerCase().includes(term)
      );
    }
  }

  /**
   * Approve a request
   */
  approveRequest(request: EmployeeTimeOffRequestAdmin) {
    const employeeName = `${request.employee.first_name} ${request.employee.last_name}`;
    
    Swal.fire({
      title: 'Approve Request?',
      text: `Are you sure you want to approve ${employeeName}'s ${request.time_off_type.name} request?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, approve it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        
        this.employeeTimeOffRequestsAdminService.approveRequest(request.id)
          .subscribe({
            next: (response) => {
              this.isLoading = false;
              request.status = 2; // Update local status
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Approved!',
                text: `${employeeName}'s request has been approved.`,
                showConfirmButton: false,
                timer: 1500
              });
            },
            error: (error) => {
              console.error('Error approving request:', error);
              this.isLoading = false;
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to approve request. Please try again.',
              });
            }
          });
      }
    });
  }

  /**
   * Reject a request
   */
  rejectRequest(request: EmployeeTimeOffRequestAdmin) {
    const employeeName = `${request.employee.first_name} ${request.employee.last_name}`;
    
    Swal.fire({
      title: 'Reject Request?',
      text: `Are you sure you want to reject ${employeeName}'s ${request.time_off_type.name} request?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, reject it!',
      cancelButtonText: 'Cancel',
      input: 'text',
      inputPlaceholder: 'Enter rejection reason (optional)',
      inputValidator: (value) => {
        // Optional rejection reason
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        
        const rejectionReason = result.value || '';
        
        this.employeeTimeOffRequestsAdminService.rejectRequest(request.id, rejectionReason)
          .subscribe({
            next: (response) => {
              this.isLoading = false;
              request.status = 3; // Update local status
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Rejected!',
                text: `${employeeName}'s request has been rejected.`,
                showConfirmButton: false,
                timer: 1500
              });
            },
            error: (error) => {
              console.error('Error rejecting request:', error);
              this.isLoading = false;
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to reject request. Please try again.',
              });
            }
          });
      }
    });
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: number): string {
    switch (status) {
      case 1: // PENDING
        return 'badge bg-warning';
      case 2: // APPROVED
        return 'badge bg-success';
      case 3: // REJECTED
        return 'badge bg-danger';
      case 4: // CANCELLED
        return 'badge bg-secondary';
      default:
        return 'badge bg-secondary';
    }
  }

  /**
   * Get status label
   */
  getStatusLabel(status: number): string {
    switch (status) {
      case 1: // PENDING
        return 'Pending';
      case 2: // APPROVED
        return 'Approved';
      case 3: // REJECTED
        return 'Rejected';
      case 4: // CANCELLED
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get pending requests count
   */
  getPendingCount(): number {
    return this.pendingRequests.filter(r => r.status === 1).length;
  }

  /**
   * Get approved requests count
   */
  getApprovedCount(): number {
    return this.pendingRequests.filter(r => r.status === 2).length;
  }

  /**
   * Get rejected requests count
   */
  getRejectedCount(): number {
    return this.pendingRequests.filter(r => r.status === 3).length;
  }

  /**
   * View request details in modal
   */
  viewRequestDetails(request: EmployeeTimeOffRequestAdmin) {
    this.selectedRequest = request;
    // Open modal using Bootstrap
    const modal = document.getElementById('requestDetailsModal');
    if (modal) {
      const bootstrapModal = new bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  /**
   * Close the modal
   */
  closeModal() {
    const modal = document.getElementById('requestDetailsModal');
    if (modal) {
      const bootstrapModal = bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
  }
}
