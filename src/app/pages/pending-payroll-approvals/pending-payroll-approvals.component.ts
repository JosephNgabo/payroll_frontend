import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { WorkflowService } from '../../core/services/workflow.service';

@Component({
  selector: 'app-pending-payroll-approvals',
  templateUrl: './pending-payroll-approvals.component.html',
  styleUrls: ['./pending-payroll-approvals.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PendingPayrollApprovalsComponent implements OnInit {
  
  pendingPayrolls: any[] = [];
  filteredPayrolls: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  selectedPayroll: any = null;

  constructor(
    private workflowService: WorkflowService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPendingPayrolls();
  }

  /**
   * Load pending payrolls from workflow API
   */
  loadPendingPayrolls() {
    this.isLoading = true;
    
    this.workflowService.getPendingPayrollApprovals()
      .subscribe({
        next: (response) => {
          // The API returns data in response.message, not response.data
          this.pendingPayrolls = response.message || [];
          this.filteredPayrolls = [...this.pendingPayrolls];
          this.isLoading = false;
          console.log('✅ Pending payroll approvals loaded successfully:', {
            count: this.pendingPayrolls.length,
            payrolls: this.pendingPayrolls
          });
        },
        error: (error) => {
          console.error('❌ Error loading pending payroll approvals:', error);
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load pending payroll approvals. Please try again later.',
            confirmButtonText: 'OK'
          });
        }
      });
  }

  /**
   * Filter payrolls based on search term
   */
  filterPayrolls() {
    if (!this.searchTerm.trim()) {
      this.filteredPayrolls = [...this.pendingPayrolls];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredPayrolls = this.pendingPayrolls.filter(payroll =>
        payroll.payroll?.payroll_date?.toLowerCase().includes(term) ||
        payroll.payroll?.payroll_number?.toLowerCase().includes(term) ||
        payroll.workflow_configuration?.code?.toLowerCase().includes(term) ||
        payroll.workflow_action_configuration?.action_identifier?.toLowerCase().includes(term) ||
        payroll.id_process?.toLowerCase().includes(term)
      );
    }
  }

  /**
   * Approve a payroll workflow
   */
  approvePayroll(payroll: any) {
    const workflowId = payroll.id_process; // Use id_process instead of id
    const payrollData = payroll.payroll; // Use payroll instead of entity_data
    const payrollDate = payrollData?.payroll_date || 'Unknown Date';
    
    Swal.fire({
      title: 'Approve Payroll?',
      text: `Are you sure you want to approve the payroll for ${payrollDate}?`,
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
          notes: result.value || undefined
        };
        
        this.workflowService.approveWorkflow(workflowId, payload)
          .subscribe({
            next: (response) => {
              this.isLoading = false;
              
              console.log('✅ Payroll approval successful:', response);
              
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Approved!',
                text: `Payroll for ${payrollDate} has been approved successfully.`,
                showConfirmButton: false,
                timer: 1500
              }).then(() => {
                // Remove the approved payroll from the list
                this.pendingPayrolls = this.pendingPayrolls.filter(p => p.id_process !== workflowId);
                this.filterPayrolls();
              });
            },
            error: (error) => {
              this.isLoading = false;
              console.error('❌ Payroll approval failed:', error);
              
              let errorMessage = 'Failed to approve payroll. Please try again.';
              if (error.error?.message) {
                errorMessage = error.error.message;
              } else if (error.message) {
                errorMessage = error.message;
              }
              
              Swal.fire({
                icon: 'error',
                title: 'Approval Failed',
                text: errorMessage,
                confirmButtonText: 'OK'
              });
            }
          });
      }
    });
  }

  /**
   * Reject a payroll workflow
   */
  rejectPayroll(payroll: any) {
    const workflowId = payroll.id_process; // Use id_process instead of id
    const payrollData = payroll.payroll; // Use payroll instead of entity_data
    const payrollDate = payrollData?.payroll_date || 'Unknown Date';
    
    Swal.fire({
      title: 'Reject Payroll?',
      text: `Are you sure you want to reject the payroll for ${payrollDate}?`,
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
          notes: result.value
        };
        
        this.workflowService.rejectWorkflow(workflowId, payload)
          .subscribe({
            next: (response) => {
              this.isLoading = false;
              
              console.log('✅ Payroll rejection successful:', response);
              
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Rejected!',
                text: `Payroll for ${payrollDate} has been rejected.`,
                showConfirmButton: false,
                timer: 1500
              }).then(() => {
                // Remove the rejected payroll from the list
                this.pendingPayrolls = this.pendingPayrolls.filter(p => p.id_process !== workflowId);
                this.filterPayrolls();
              });
            },
            error: (error) => {
              console.error('❌ Payroll rejection failed:', error);
              this.isLoading = false;
              
              let errorMessage = 'Failed to reject payroll. Please try again.';
              if (error.error?.message) {
                errorMessage = error.error.message;
              } else if (error.message) {
                errorMessage = error.message;
              }
              
              Swal.fire({
                icon: 'error',
                title: 'Rejection Failed',
                text: errorMessage,
                confirmButtonText: 'OK'
              });
            }
          });
      }
    });
  }

  /**
   * View payroll details
   */
  viewPayrollDetails(payroll: any) {
    const payrollId = payroll.payroll_id; // Use payroll_id instead of entity_id
    if (payrollId) {
      this.router.navigate(['/payroll/details', payrollId]);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'No Details Available',
        text: 'Payroll details are not available for this workflow.',
        confirmButtonText: 'OK'
      });
    }
  }

  /**
   * Get workflow status badge class
   */
  getWorkflowStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-warning';
      case 'approved': return 'bg-success';
      case 'rejected': return 'bg-danger';
      case 'cancelled': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  /**
   * Get workflow status label
   */
  getWorkflowStatusLabel(status: string): string {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  /**
   * Format date
   */
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    if (!amount) return '0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'RWF'
    }).format(amount);
  }

  /**
   * Get total amount of all pending payrolls
   */
  getTotalAmount(): number {
    return this.pendingPayrolls.reduce((sum, payroll) => {
      const amount = payroll.entity_data?.total_amount || 0;
      return sum + amount;
    }, 0);
  }

  /**
   * Get total number of employees across all pending payrolls
   */
  getTotalEmployees(): number {
    return this.pendingPayrolls.reduce((sum, payroll) => {
      const employees = payroll.entity_data?.total_employees || 0;
      return sum + employees;
    }, 0);
  }

  /**
   * Get average amount per payroll
   */
  getAverageAmount(): number {
    if (this.pendingPayrolls.length === 0) return 0;
    return this.getTotalAmount() / this.pendingPayrolls.length;
  }

  /**
   * Get current payroll month
   */
  getCurrentPayrollMonth(): string {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    return `${month} ${year}`;
  }

  /**
   * Get workflow type
   */
  getWorkflowType(): string {
    if (this.pendingPayrolls.length === 0) return 'N/A';
    const firstPayroll = this.pendingPayrolls[0];
    return firstPayroll.workflow_configuration?.name || 'Payroll Approval';
  }

  /**
   * Get action level
   */
  getActionLevel(): string {
    if (this.pendingPayrolls.length === 0) return 'N/A';
    const firstPayroll = this.pendingPayrolls[0];
    return firstPayroll.workflow_action_configuration?.action_identifier || 'Level 1';
  }

  /**
   * Debug API call
   */
  debugAPI() {
    console.log('🔍 Debug API - Current pending payrolls:', this.pendingPayrolls);
    console.log('🔍 Debug API - Filtered payrolls:', this.filteredPayrolls);
    console.log('🔍 Debug API - Search term:', this.searchTerm);
    
    Swal.fire({
      icon: 'info',
      title: 'API Debug Information',
      html: `
        <div class="text-start">
          <p><strong>Total Pending Payrolls:</strong> ${this.pendingPayrolls.length}</p>
          <p><strong>Filtered Payrolls:</strong> ${this.filteredPayrolls.length}</p>
          <p><strong>Search Term:</strong> "${this.searchTerm}"</p>
          <p><strong>Loading State:</strong> ${this.isLoading}</p>
          <hr>
          <p><strong>Sample Payroll Data:</strong></p>
          <pre style="font-size: 12px; max-height: 200px; overflow-y: auto;">${JSON.stringify(this.pendingPayrolls[0] || {}, null, 2)}</pre>
        </div>
      `,
      confirmButtonText: 'OK'
    });
  }

  /**
   * Debug approval process
   */
  debugApproval() {
    if (this.pendingPayrolls.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Payrolls Available',
        text: 'There are no pending payrolls to approve.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const firstPayroll = this.pendingPayrolls[0];
    console.log('🔍 Debug Approval - First payroll:', firstPayroll);
    
    Swal.fire({
      icon: 'question',
      title: 'Debug Approval Process',
      html: `
        <div class="text-start">
          <p><strong>Workflow ID:</strong> ${firstPayroll.id_process}</p>
          <p><strong>Payroll ID:</strong> ${firstPayroll.payroll_id}</p>
          <p><strong>Payroll Date:</strong> ${firstPayroll.payroll?.payroll_date}</p>
          <p><strong>Payroll Number:</strong> ${firstPayroll.payroll?.payroll_number}</p>
          <p><strong>Workflow Code:</strong> ${firstPayroll.workflow_configuration?.code}</p>
          <p><strong>Action Type:</strong> ${firstPayroll.workflow_action_configuration?.action_type}</p>
          <hr>
          <p>This will simulate the approval process for debugging purposes.</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simulate Approval',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.approvePayroll(firstPayroll);
      }
    });
  }

  /**
   * Debug rejection process
   */
  debugRejection() {
    if (this.pendingPayrolls.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Payrolls Available',
        text: 'There are no pending payrolls to reject.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const firstPayroll = this.pendingPayrolls[0];
    console.log('🔍 Debug Rejection - First payroll:', firstPayroll);
    
    Swal.fire({
      icon: 'question',
      title: 'Debug Rejection Process',
      html: `
        <div class="text-start">
          <p><strong>Workflow ID:</strong> ${firstPayroll.id_process}</p>
          <p><strong>Payroll ID:</strong> ${firstPayroll.payroll_id}</p>
          <p><strong>Payroll Date:</strong> ${firstPayroll.payroll?.payroll_date}</p>
          <p><strong>Payroll Number:</strong> ${firstPayroll.payroll?.payroll_number}</p>
          <p><strong>Workflow Code:</strong> ${firstPayroll.workflow_configuration?.code}</p>
          <p><strong>Action Type:</strong> ${firstPayroll.workflow_action_configuration?.action_type}</p>
          <hr>
          <p>This will simulate the rejection process for debugging purposes.</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simulate Rejection',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.rejectPayroll(firstPayroll);
      }
    });
  }
}
