import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { WorkflowService, WorkflowConfiguration } from '../../../core/services/workflow.service';
import { TableSkeletonComponent } from '../../../shared/ui/skeleton/table-skeleton.component';

                      
@Component({
  selector: 'app-list-workflows',
  templateUrl: './list-workflows.component.html',
  styleUrl: './list-workflows.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule, TableSkeletonComponent],
  providers: [WorkflowService]
})
export class ListWorkflowsComponent {
  workflows: WorkflowConfiguration[] = [];
  paginatedData: any | null = null;
  isLoading = false;
  error: string | null = null;
  term: string = '';
  breadCrumbItems: Array<{}> = [
    { label: 'Configuration' },
    { label: 'Workflow Management', active: true }
  ];


  // Permission system - using existing p_id approach
  permissions: (number | string)[] = [];

  constructor(
    private workflowService: WorkflowService,
    private modalService: NgbModal,
    private router: Router
  ) {
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
    this.loadWorkflows();
  }

  // Permission check methods for workflow management
  canViewWorkflows(): boolean {
    return this.permissions.some(p_id => p_id === 8001 || p_id === '8001'); // p_id for view_workflows
  }

  // Check if user has any workflow management permissions
  hasAnyWorkflowPermission(): boolean {
    const workflowPermissionIds = [8001, '8001'];
    return this.permissions.some(p_id => workflowPermissionIds.includes(p_id));
  }

  loadWorkflows(page: number = 1) {
    this.isLoading = true;
    this.error = null;
    this.workflowService.getWorkflowConfigurations(page).subscribe({
      next: (data) => {
        console.log(data);
        this.paginatedData = data;
        this.workflows = data.data;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load workflows. Please try again later.';
        this.isLoading = false;
        console.error('Error loading workflows:', error);
      }
    });
  }

  searchWorkflows() {
    if (!this.term) {
      this.workflows = this.paginatedData ? [...this.paginatedData.data] : [];
      return;
    }
    const lowerTerm = this.term.toLowerCase();
    this.workflows = (this.paginatedData ? this.paginatedData.data : []).filter(workflow =>
      workflow.name.toLowerCase().includes(lowerTerm) ||
      workflow.description.toLowerCase().includes(lowerTerm) ||
      workflow.code.toLowerCase().includes(lowerTerm) ||
      workflow.entity_type.toLowerCase().includes(lowerTerm)
    );
  }

  openViewModal(workflow: WorkflowConfiguration) {
    // Navigate to details page instead of opening modal
    this.router.navigate(['/workflow-management/details', workflow.id]);
  }

  navigateToDetails(workflowId: string) {
    this.router.navigate(['/workflow-management/details', workflowId]);
  }
}
