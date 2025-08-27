import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { EmployeeTimeOffRequestsAdminService, EmployeeTimeOffRequestAdmin } from '../../core/services/employee-time-off-requests-admin.service';
import { environment } from '../../../environments/environment';

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
  usingFallback: boolean = false;

  // Permission tracking
  hasViewTimeOffRequestsPermission: boolean = false;
  hasApproveTimeOffRequestsPermission: boolean = false;
  hasManageTimeOffBalancesPermission: boolean = false;
  hasViewTimeOffReportsPermission: boolean = false;
  hasManageTimeOffTypesPermission: boolean = false;
  permissions: number[] = [];

  constructor(private employeeTimeOffRequestsAdminService: EmployeeTimeOffRequestsAdminService) { }

  ngOnInit(): void {
    this.loadUserPermissions();
    
    // Add a small delay to ensure permissions are loaded before making API calls
    setTimeout(() => {
      console.log('🔍 Permission check after load:', {
        permissions: this.permissions,
        hasViewTimeOffRequestsPermission: this.hasViewTimeOffRequestsPermission,
        hasApproveTimeOffRequestsPermission: this.hasApproveTimeOffRequestsPermission,
        permission9001: this.permissions.includes(9001),
        permission9002: this.permissions.includes(9002)
      });
      
      this.loadPendingRequests();
    }, 100);
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
        
        // Check for specific time-off management permissions
        this.hasViewTimeOffRequestsPermission = this.permissions.includes(9001);
        this.hasApproveTimeOffRequestsPermission = this.permissions.includes(9002);
        this.hasManageTimeOffBalancesPermission = this.permissions.includes(9003);
        this.hasViewTimeOffReportsPermission = this.permissions.includes(9004);
        this.hasManageTimeOffTypesPermission = this.permissions.includes(9005);
        
        console.log('Time-off management permissions loaded:', this.permissions);
        console.log('View Time Off Requests (9001):', this.hasViewTimeOffRequestsPermission);
        console.log('Approve Time Off Requests (9002):', this.hasApproveTimeOffRequestsPermission);
        console.log('Manage Time Off Balances (9003):', this.hasManageTimeOffBalancesPermission);
        console.log('View Time Off Reports (9004):', this.hasViewTimeOffReportsPermission);
        console.log('Manage Time Off Types (9005):', this.hasManageTimeOffTypesPermission);
      } catch (e) {
        console.error('Error parsing user permissions:', e);
        this.permissions = [];
        this.resetPermissions();
      }
    } else {
      console.warn('No user data found in session storage');
      this.resetPermissions();
    }
  }

  /**
   * Reset all permissions to false
   */
  private resetPermissions(): void {
    this.hasViewTimeOffRequestsPermission = false;
    this.hasApproveTimeOffRequestsPermission = false;
    this.hasManageTimeOffBalancesPermission = false;
    this.hasViewTimeOffReportsPermission = false;
    this.hasManageTimeOffTypesPermission = false;
  }

  /**
   * Get current user ID from session storage
   */
  private getCurrentUserId(): number {
    const user = sessionStorage.getItem('current_user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.id || 1;
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    return 1; // Default fallback
  }

  /**
   * Debug method to check current permissions
   */
  debugPermissions(): void {
    const user = sessionStorage.getItem('current_user');
    console.log('🔍 Debug Permissions:');
    console.log('Raw session storage:', user);
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        console.log('Parsed user data:', userData);
        console.log('User permissions:', userData.permissions);
        console.log('Current component permissions:', this.permissions);
        console.log('Permission checks:', {
          hasViewTimeOffRequestsPermission: this.hasViewTimeOffRequestsPermission,
          hasApproveTimeOffRequestsPermission: this.hasApproveTimeOffRequestsPermission,
          permission9001: this.permissions.includes(9001),
          permission9002: this.permissions.includes(9002),
          permission9003: this.permissions.includes(9003),
          permission9004: this.permissions.includes(9004),
          permission9005: this.permissions.includes(9005)
        });
        console.log('Current user ID:', this.getCurrentUserId());
        
        // Check if user has an employee record
        if (userData.employee_id) {
          console.log('User has employee_id:', userData.employee_id);
        } else {
          console.log('User does not have employee_id');
        }
        
        // Check user profile type
        if (userData.user_profile) {
          console.log('User profile type:', userData.user_profile);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    } else {
      console.log('No user data in session storage');
    }
  }

  /**
   * Test different API endpoints to get pending requests
   */
  testAPIEndpoints(): void {
    console.log('🧪 Testing different API endpoints...');
    
    // Test 1: Get all requests (no status filter)
    this.employeeTimeOffRequestsAdminService.getAllEmployeeTimeOffRequests()
      .subscribe({
        next: (allRequests) => {
          console.log('📋 All requests (no status filter):', {
            count: allRequests.length,
            requests: allRequests.map(r => ({
              id: r.id,
              employee: `${r.employee.first_name} ${r.employee.last_name}`,
              type: r.time_off_type.name,
              status: r.status,
              statusLabel: this.getStatusLabel(r.status)
            }))
          });
          
          // Test approval on first pending request if available
          const firstPendingRequest = allRequests.find(r => r.status === 1);
          if (firstPendingRequest && this.hasApproveTimeOffRequestsPermission) {
            console.log('🧪 Testing approval on request:', firstPendingRequest.id);
            this.testApprovalPermission(firstPendingRequest.id);
          }
        },
        error: (error) => {
          console.error('❌ Error getting all requests:', error);
        }
      });
    
    // Test 2: Get pending requests with different page
    this.employeeTimeOffRequestsAdminService.getPendingEmployeeTimeOffRequests(1)
      .subscribe({
        next: (pendingRequests) => {
          console.log('📋 Pending requests (page 1):', {
            count: pendingRequests.length,
            requests: pendingRequests.map(r => ({
              id: r.id,
              employee: `${r.employee.first_name} ${r.employee.last_name}`,
              type: r.time_off_type.name,
              status: r.status
            }))
          });
        },
        error: (error) => {
          console.error('❌ Error getting pending requests:', error);
        }
      });
    

  }

 

  /**
   * Test different approver_id values for approval
   */
  testDifferentApproverIds(): void {
    console.log('🧪 Testing different approver_id values for approval...');
    
    const requestId = '0198db28-92c8-7174-a4f7-a5bf84e7abde'; // Use the same request ID
    const testApproverIds = [1, 2, 3, this.getCurrentUserId()];
    
    testApproverIds.forEach(approverId => {
      console.log(`🧪 Testing approval with approver_id: ${approverId}`);
      
      const payload = { 
        approver_id: approverId,
        notes: `Test approval with approver_id ${approverId}` 
      };
      
      this.employeeTimeOffRequestsAdminService.approveRequest(requestId, payload)
        .subscribe({
          next: (response) => {
            console.log(`✅ Approval successful with approver_id ${approverId}:`, response);
          },
          error: (error) => {
            console.log(`❌ Approval failed with approver_id ${approverId}:`, {
              status: error.status,
              message: error.error?.message || error.message || 'Unknown error'
            });
          }
        });
    });
  }

  /**
   * Test getting approval details for a specific request
   */
  testApprovalDetails(): void {
    console.log('🧪 Testing approval details for request...');
    
    const requestId = '0198db28-92c8-7174-a4f7-a5bf84e7abde';
    
    // Try to get the specific request details
    const url = `${environment.apiUrl}/employee-time-off-requests/${requestId}`;
    
    fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.text())
    .then(data => {
      try {
        const jsonData = JSON.parse(data);
        console.log('📋 Request details:', jsonData);
        
        if (jsonData.data && jsonData.data.approvals) {
          console.log('📋 Approval records:', jsonData.data.approvals);
          
          jsonData.data.approvals.forEach((approval: any, index: number) => {
            console.log(`📋 Approval ${index + 1}:`, {
              id: approval.id,
              approver_id: approval.approver_id,
              approval_level: approval.approval_level,
              status: approval.status,
              comments: approval.comments
            });
          });
        }
      } catch (e) {
        console.error('❌ Error parsing request details:', e);
      }
    })
    .catch(error => {
      console.error('❌ Error getting request details:', error);
    });
  }

  /**
   * Test approval API response structure
   */
  testApprovalAPIResponse(): void {
    console.log('🧪 Testing approval API response structure...');
    
    // Find a pending request to test with
    const pendingRequest = this.pendingRequests.find(r => r.status === 1);
    
    if (!pendingRequest) {
      console.log('❌ No pending requests available for testing');
      Swal.fire({
        icon: 'warning',
        title: 'No Test Data',
        text: 'No pending requests available for testing approval response.',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    console.log('🧪 Testing with request:', {
      id: pendingRequest.id,
      employee: `${pendingRequest.employee.first_name} ${pendingRequest.employee.last_name}`,
      currentStatus: pendingRequest.status,
      statusLabel: this.getStatusLabel(pendingRequest.status)
    });
    
    const payload = {
      approver_id: this.getCurrentUserId(),
      notes: 'Test approval - checking API response structure'
    };
    
    console.log('🧪 Sending test approval payload:', payload);
    
    this.employeeTimeOffRequestsAdminService.approveRequest(pendingRequest.id, payload)
      .subscribe({
        next: (response) => {
          console.log('✅ Test approval successful!');
          console.log('🔍 Full response object:', response);
          console.log('🔍 Response type:', typeof response);
          console.log('🔍 Response keys:', Object.keys(response || {}));
          
          // Check for status in different possible locations
          if (response) {
            console.log('🔍 response.status:', response.status);
            console.log('🔍 response.data?.status:', response.data?.status);
            console.log('🔍 response.request?.status:', response.request?.status);
            console.log('🔍 response.employee_time_off_request?.status:', response.employee_time_off_request?.status);
          }
          
          // Show detailed response info
          Swal.fire({
            icon: 'success',
            title: 'Test Approval Successful',
            html: `
              <div class="text-start">
                <p><strong>Response Type:</strong> ${typeof response}</p>
                <p><strong>Response Keys:</strong> ${Object.keys(response || {}).join(', ')}</p>
                <p><strong>Status Field:</strong> ${response?.status || 'Not found'}</p>
                <p><strong>Data Status:</strong> ${response?.data?.status || 'Not found'}</p>
              </div>
            `,
            confirmButtonText: 'OK'
          });
        },
        error: (error) => {
          console.log('❌ Test approval failed:', error);
          console.log('❌ Error response:', error.error);
          
          Swal.fire({
            icon: 'error',
            title: 'Test Approval Failed',
            text: error.error?.message || error.message || 'Unknown error',
            confirmButtonText: 'OK'
          });
        }
      });
  }

  /**
   * Test if backend is filtering requests by approver_id
   */

  /**
   * Manually trigger fallback to load all requests
   */
  manualFallback(): void {
    console.log('🔄 Manually triggering fallback to load all requests...');
    this.loadAllRequestsAsFallback();
  }

  /**
   * Test if user can actually approve a specific request
   */
  testApprovalPermission(requestId: string): void {
    console.log('🧪 Testing approval permission for request:', requestId);
    
    // Try to approve with approver_id (required by API)
    const approverId = this.getCurrentUserId();
    console.log('🧪 Using approver_id:', approverId, 'for user test approval');
    
    const payload = { 
      approver_id: approverId,
      notes: 'Test approval - checking permissions' 
    };
    
    console.log('🧪 Sending approval payload:', payload);
    
    this.employeeTimeOffRequestsAdminService.approveRequest(requestId, payload)
      .subscribe({
        next: (response) => {
          console.log('✅ Approval test successful:', response);
          Swal.fire({
            icon: 'success',
            title: 'Approval Test Successful',
            text: 'User has approval permissions and can approve requests.',
            confirmButtonText: 'OK'
          });
        },
        error: (error) => {
          console.log('❌ Approval test failed:', error);
          console.log('❌ Full error object:', error);
          
          let errorMessage = 'Unknown error';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          } else if (error.status === 403) {
            errorMessage = '403 Forbidden - User does not have permission to approve this request or is not assigned as an approver';
          }
          
          console.log('❌ Error message:', errorMessage);
          
          Swal.fire({
            icon: 'error',
            title: 'Approval Test Failed',
            text: errorMessage,
            confirmButtonText: 'OK'
          });
        }
      });
  }

  /**
   * Load pending requests from API
   */
  loadPendingRequests() {
    this.isLoading = true;
    
    console.log('🔍 Loading pending requests with permissions:', {
      hasViewTimeOffRequestsPermission: this.hasViewTimeOffRequestsPermission,
      hasApproveTimeOffRequestsPermission: this.hasApproveTimeOffRequestsPermission,
      permissions: this.permissions
    });
    
    // First, try to get pending requests with status filter
    this.employeeTimeOffRequestsAdminService.getPendingEmployeeTimeOffRequests()
      .subscribe({
        next: (response) => {
          this.pendingRequests = response;
          this.filteredRequests = [...this.pendingRequests];
          this.isLoading = false;
          this.usingFallback = false; // Reset fallback flag
          console.log('✅ Pending requests loaded successfully:', {
            count: this.pendingRequests.length,
            requests: this.pendingRequests
          });
          
          // Check if we have requests but no approval permission
          if (this.pendingRequests.length > 0 && !this.hasApproveTimeOffRequestsPermission) {
            console.log('⚠️ User has requests to view but no approval permission');
          }
          
          // If no requests found, try fallback regardless of permissions
          if (this.pendingRequests.length === 0) {
            console.log('🔄 No pending requests found. Trying fallback to get all requests...');
            this.loadAllRequestsAsFallback();
          }
        },
        error: (error) => {
          console.error('❌ Error loading pending requests:', error);
          this.isLoading = false;
          
          // If there's an error, try fallback
          console.log('🔄 Error loading pending requests. Trying fallback...');
          this.loadAllRequestsAsFallback();
        }
      });
  }

  /**
   * Fallback method to load all requests when pending requests API returns empty
   */
  loadAllRequestsAsFallback() {
    console.log('🔄 Loading all requests as fallback...');
    
    this.employeeTimeOffRequestsAdminService.getAllEmployeeTimeOffRequests()
      .subscribe({
        next: (allRequests) => {
          // Filter to only show pending requests (status = 1)
          const pendingRequests = allRequests.filter(request => request.status === 1);
          
          if (pendingRequests.length > 0) {
            console.log('✅ Found pending requests in all requests:', {
              total: allRequests.length,
              pending: pendingRequests.length,
              requests: pendingRequests.map(r => ({
                id: r.id,
                employee: `${r.employee.first_name} ${r.employee.last_name}`,
                type: r.time_off_type.name,
                status: r.status
              }))
            });
            
            this.pendingRequests = pendingRequests;
            this.filteredRequests = [...this.pendingRequests];
            this.usingFallback = true;
            
            // Show a success message with fallback info
            const message = this.hasApproveTimeOffRequestsPermission 
              ? `Successfully loaded ${pendingRequests.length} pending time-off requests using fallback method.`
              : `Found ${pendingRequests.length} pending time-off requests. Note: You may not have approval permissions for these requests.`;
            
            Swal.fire({
              icon: 'success',
              title: 'Pending Requests Loaded',
              text: message,
              confirmButtonText: 'OK'
            });
          } else {
            console.log('ℹ️ No pending requests found in all requests either');
            Swal.fire({
              icon: 'info',
              title: 'No Pending Requests',
              text: 'There are currently no pending time-off requests in the system.',
              confirmButtonText: 'OK'
            });
          }
        },
        error: (error) => {
          console.error('❌ Error loading all requests as fallback:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load requests. Please try again later.',
            confirmButtonText: 'OK'
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
    if (!this.hasApproveTimeOffRequestsPermission) {
      Swal.fire({
        icon: 'error',
        title: 'Permission Denied',
        text: 'You need "Approve Time Off Requests" permission (ID: 9002) to approve requests. Please contact your administrator.',
      });
      return;
    }
    
    const employeeName = `${request.employee.first_name} ${request.employee.last_name}`;
    
    Swal.fire({
      title: 'Approve Request?',
      text: `Are you sure you want to approve ${employeeName}'s ${request.time_off_type.name} request?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, approve it!',
      cancelButtonText: 'Cancel',
      input: 'text',
      inputPlaceholder: 'Enter approval notes (optional)',
      inputValidator: (value) => {
        // Optional approval notes
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        
        const payload = {
          approver_id: this.getCurrentUserId(),
          notes: result.value || undefined
        };
        
        this.employeeTimeOffRequestsAdminService.approveRequest(request.id, payload)
          .subscribe({
            next: (response) => {
              this.isLoading = false;
              
              // Debug the approval response
              console.log('✅ Approval successful - Response:', response);
              console.log('🔍 Response status field:', response?.status);
              console.log('🔍 Response data:', response);
              
              // Check if response has status information
              if (response && response.data) {
                // Check for approval_status first (this is the correct field for approval state)
                if (response.data.approval_status !== undefined) {
                  console.log('🔍 Using approval_status from API response:', response.data.approval_status);
                  request.status = response.data.approval_status;
                } else if (response.data.status !== undefined) {
                  console.log('🔍 Using status from API response:', response.data.status);
                  request.status = response.data.status;
                } else {
                  console.log('🔍 No status fields found, setting to 2 (APPROVED)');
                  request.status = 2; // Update local status to APPROVED
                }
              } else if (response && response.status !== undefined) {
                console.log('🔍 Using status from API response:', response.status);
                request.status = response.status;
              } else {
                console.log('🔍 No status in response, setting to 2 (APPROVED)');
                request.status = 2; // Update local status to APPROVED
              }
              
              console.log('🔍 Final request status after approval:', request.status);
              console.log('🔍 Status label:', this.getStatusLabel(request.status));
              
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
              
              let errorMessage = 'Failed to approve request. Please try again.';
              if (error.message && error.message.includes('Admin users can approve all requests')) {
                errorMessage = 'You do not have admin permissions to approve requests. Please contact your administrator.';
              } else if (error.error && error.error.errors) {
                // Show validation errors
                const errors = Object.values(error.error.errors).flat();
                errorMessage = errors.join(', ');
              } else if (error.error && error.error.message) {
                errorMessage = error.error.message;
              }
              
              Swal.fire({
                icon: 'error',
                title: 'Permission Denied',
                text: errorMessage,
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
    if (!this.hasApproveTimeOffRequestsPermission) {
      Swal.fire({
        icon: 'error',
        title: 'Permission Denied',
        text: 'You need "Approve Time Off Requests" permission (ID: 9002) to reject requests. Please contact your administrator.',
      });
      return;
    }
    
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
      inputPlaceholder: 'Enter rejection reason (required)',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return 'You need to provide a rejection reason!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        
        const payload = {
          reason: result.value
        };
        
        this.employeeTimeOffRequestsAdminService.rejectRequest(request.id, payload)
          .subscribe({
            next: (response) => {
              this.isLoading = false;
              
              // Debug the rejection response
              console.log('✅ Rejection successful - Response:', response);
              console.log('🔍 Response status field:', response?.status);
              console.log('🔍 Response data:', response);
              
              // Check if response has status information
              if (response && response.data) {
                // Check for approval_status first (this is the correct field for approval state)
                if (response.data.approval_status !== undefined) {
                  console.log('🔍 Using approval_status from API response:', response.data.approval_status);
                  request.status = response.data.approval_status;
                } else if (response.data.status !== undefined) {
                  console.log('🔍 Using status from API response:', response.data.status);
                  request.status = response.data.status;
                } else {
                  console.log('🔍 No status fields found, setting to 3 (REJECTED)');
                  request.status = 3; // Update local status to REJECTED
                }
              } else if (response && response.status !== undefined) {
                console.log('🔍 Using status from API response:', response.status);
                request.status = response.status;
              } else {
                console.log('🔍 No status in response, setting to 3 (REJECTED)');
                request.status = 3; // Update local status to REJECTED
              }
              
              console.log('🔍 Final request status after rejection:', request.status);
              console.log('🔍 Status label:', this.getStatusLabel(request.status));
              
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
              
              let errorMessage = 'Failed to reject request. Please try again.';
              if (error.message && error.message.includes('Admin users can approve all requests')) {
                errorMessage = 'You do not have admin permissions to reject requests. Please contact your administrator.';
              } else if (error.error && error.error.errors) {
                // Show validation errors
                const errors = Object.values(error.error.errors).flat();
                errorMessage = errors.join(', ');
              } else if (error.error && error.error.message) {
                errorMessage = error.error.message;
              }
              
              Swal.fire({
                icon: 'error',
                title: 'Permission Denied',
                text: errorMessage,
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
