import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { WorkflowService, WorkflowConfiguration } from '../../../core/services/workflow.service';
import Swal from 'sweetalert2';
import { PagetitleComponent } from '../../../shared/ui/pagetitle/pagetitle.component';

interface WorkflowDetailsResponse {
  status: boolean;
  message: WorkflowConfiguration;
  data: string;
}

interface WorkflowActionConfigResponse {
  status: boolean;
  message: string;
  data: WorkflowActionConfig[];
}

interface WorkflowActionConfig {
  id: string;
  workflow_configuration_id: string;
  type_actor: number;
  id_actor: string;
  action_type: string;
  action_identifier: string;
  parent: string;
  configured_by: {
    id: string;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
  };
  comments: string | null;
  created_at: string;
  updated_at: string;
  workflow_configuration: {
    id: string;
    name: string;
    code: string;
    description: string;
    active: boolean;
    entity_type: string;
    settings: {
      notifications: {
        email: boolean;
        sms: boolean;
        in_app: boolean;
      };
      escalation: {
        enabled: boolean;
        escalation_hours: number;
      };
    };
  };
  user_actor: {
    id: string;
    firstname: string;
    lastname: string;
    username: string;
  } | null;
  group_actor: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  parent_action?: {
    id: string;
    action_type: string;
    action_identifier: string;
  };
}

interface WorkflowAction {
  id_step: number;
  action: string;
  actor: string;
  actor_value: string;
  parent: number;
}

interface WorkflowLevel {
  id_level: number;
  level: string;
  name: string;
}

interface WorkflowActionOption {
  id_action: number;
  action: string;
  name: string;
}

interface Actor {
  id: number;
  label: string;
}

interface User {
  id_utilis: number;
  nom: string;
  prenom: string;
}

interface Group {
  id_grp: number;
  group_name: string;
}

@Component({
  selector: 'app-workflow-details-page',
  templateUrl: './workflow-details-page.component.html',
  styleUrl: './workflow-details-page.component.css',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    NgSelectModule, 
    TranslateModule,
    PagetitleComponent
  ],
  providers: [WorkflowService]
})
export class WorkflowDetailsPageComponent implements OnInit {
  workflowId: string = '';
  workflowObj: any = null;
  workflowConfigObj: WorkflowActionConfig[] = [];
  allLevelsObj: WorkflowLevel[] = [];
  workflowLevelsObj: WorkflowLevel[] = [];
  subLevelsObj_1: WorkflowLevel[] = [];
  subLevelsObj_2: WorkflowLevel[] = [];
  workflowActionObj: WorkflowActionOption[] = [];
  workflowParentsObj: any[] = [];
  usersObj: User[] = [];
  groupsObj: Group[] = [];
  senariosObj: any[] = [];
  
  loading = true;
  loading_l = false;
  updating = false;
  editProcess = false;
  selectUsers = true;
  steps = 0;
  active = 1;
  theme = 'primary';
  activeTab = 'general';
  toggleLoading = false;
  addActionLoading = false;
  availableUsers: any[] = [];
  availableGroups: any[] = [];
  availableParentActions: WorkflowActionConfig[] = [];
  editingAction: WorkflowActionConfig | null = null;
  isEditMode = false;

  // Form variables
  v_workflow = '';
  v_desc = '';
  id_scenario: any = null;
  selected_levelI: any = null;
  selected_levelII: any = null;
  selected_levelIII: any = null;

  formGroup: FormGroup;
  editFormGroup: FormGroup;
  addActionForm: FormGroup;

  actors: Actor[] = [
    { id: 1, label: 'User' },
    { id: 2, label: 'Group' }
  ];

  breadCrumbItems: Array<{}> = [
    { label: 'Workflow Management' },
    { label: 'Workflow Details', active: true }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workflowService: WorkflowService,
    private fb: FormBuilder
  ) {
    this.formGroup = this.fb.group({
      v_id_action: [''],
      v_type_actor: [''],
      v_id_actor: [''],
      v_parent: ['']
    });

    this.editFormGroup = this.fb.group({
      v_id_action: [''],
      v_type_actor: [''],
      v_id_actor: [''],
      v_parent: ['']
    });

    this.addActionForm = this.fb.group({
      workflow_configuration_id: ['', Validators.required],
      action_type: ['', [Validators.required, Validators.pattern(/^(approve|reject)$/)]],
      type_actor: ['', [Validators.required, Validators.pattern(/^[12]$/)]],
      id_actor: ['', Validators.required],
      parent: ['0']
    });
  }

  ngOnInit(): void {
    this.workflowId = this.route.snapshot.params['id'];
    console.log('Workflow Details Page - Workflow ID:', this.workflowId);
    console.log('Workflow Details Page - Loading state:', this.loading);
    
    if (this.workflowId) {
      this.loadWorkflowDetails();
      this.loadWorkflowActions();
    } else {
      console.error('No workflow ID found in route parameters');
    }
  }

  loadWorkflowDetails() {
    console.log('Loading workflow details for ID:', this.workflowId);
    this.loading = true;
    this.workflowService.getWorkflowConfiguration(this.workflowId).subscribe({
      next: (response: WorkflowDetailsResponse) => {
        console.log("response",response);
        // Map the response structure where workflow data is in response.message
        this.workflowObj = response.message;
        console.log("workflowObj",this.workflowObj);
        this.v_workflow = response.message.name;
        this.v_desc = response.message.description;
        console.log('Workflow details loaded successfully:', response.message);
        console.log('Workflow object set to:', this.workflowObj);
        this.loading = false;
        console.log('Loading state set to:', this.loading);
      },
      error: (error) => {
        console.error('Error loading workflow details:', error);
        this.loading = false;
        console.log('Loading state set to false due to error');
      }
    });
  }

  loadWorkflowActions() {
    this.workflowService.getWorkflowActionConfigurations(this.workflowId).subscribe({
      next: (response: WorkflowActionConfigResponse) => {
        // Map the response structure where workflow actions are in response.data
        this.workflowConfigObj = response.data;
        console.log('Workflow actions loaded:', response.data);
      },
      error: (error) => {
        console.error('Error loading workflow actions:', error);
      }
    });
  }

  changeActiveClass(tab: number) {
    this.active = tab;
  }

  onActorChange(event: any) {
    this.selectUsers = event === 1;
    this.formGroup.patchValue({ v_id_actor: '' });
    this.editFormGroup.patchValue({ v_id_actor: '' });
  }

  getWorkflowLevelsBySenario(event: any) {
    // Implementation for getting workflow levels by scenario
    console.log('Scenario changed:', event);
  }

  getWorkflowSublevels(event: any, level: number) {
    // Implementation for getting workflow sublevels
    console.log('Level changed:', event, 'Level:', level);
  }

  createEditFormGroup(item: WorkflowActionConfig) {
    this.editProcess = true;
    this.editFormGroup.patchValue({
      v_id_action: item.action_type,
      v_type_actor: item.type_actor,
      v_id_actor: item.id_actor,
      v_parent: item.parent
    });
  }

  cancelEditAction() {
    this.editProcess = false;
    this.editFormGroup.reset();
  }

  updateWorkflowConfig() {
    // Implementation for updating workflow config
    console.log('Updating workflow config:', this.editFormGroup.value);
  }

  addWorkflowConfig() {
    // Implementation for adding workflow config
    console.log('Adding workflow config:', this.formGroup.value);
  }

  deleteWorkflowConfig(id: string) {
    // Implementation for deleting workflow config
    console.log('Deleting workflow config:', id);
  }

  updateWorkflow() {
    // Implementation for updating workflow
    console.log('Updating workflow');
  }

  activateWorkflow() {
    // Implementation for activating workflow
    console.log('Activating workflow');
  }

  deactivateWorkflow() {
    // Implementation for deactivating workflow
    console.log('Deactivating workflow');
  }

  // Helper method to get actor type label
  getActorTypeLabel(typeActor: number): string {
    switch (typeActor) {
      case 1:
        return 'User';
      case 2:
        return 'Group';
      default:
        return 'Unknown';
    }
  }

  // Helper method to get actor name
  getActorName(item: WorkflowActionConfig): string {
    if (item.type_actor === 1 && item.user_actor) {
      return `${item.user_actor.firstname} ${item.user_actor.lastname}`;
    } else if (item.type_actor === 2 && item.group_actor) {
      return item.group_actor.name;
    } else {
      return 'Unknown Actor';
    }
  }

  // Helper method to get parent action identifier
  getParentActionIdentifier(parentId: string): string {
    if (parentId === '0') {
      return 'None';
    }
    
    const parentAction = this.workflowConfigObj.find(action => action.id === parentId);
    console.log("parentAction",parentAction);
    if (parentAction) {
      return parentAction.action_identifier;
    }
    
    return `ID: ${parentId}`;
  }

  // Toggle workflow status
  toggleWorkflowStatus() {
    if (this.workflowId) {
      this.toggleLoading = true;
      this.workflowService.toggleWorkflowStatus(this.workflowId).subscribe({
        next: (response) => {
          console.log('Workflow status toggled:', response);
          // Reload workflow details to get updated status
          this.loadWorkflowDetails();
          this.toggleLoading = false;
        },
        error: (error) => {
          console.error('Error toggling workflow status:', error);
          this.toggleLoading = false;
          Swal.fire(
            'Error!',
            error.message || 'Failed to toggle workflow status. Please try again.',
            'error'
          );
        }
      });
    }
  }

  // Update workflow action
  updateWorkflowAction(action: WorkflowActionConfig) {
    console.log('Updating workflow action:', action);
    this.editingAction = action;
    this.isEditMode = true;
    
    // Pre-populate the form with existing data
    this.addActionForm.patchValue({
      workflow_configuration_id: action.workflow_configuration_id,
      action_type: action.action_type,
      type_actor: action.type_actor.toString(),
      id_actor: action.id_actor,
      parent: action.parent
    });
    
    // Load available actors and update parent actions
    this.loadAvailableActors();
    this.updateAvailableParentActions();
    
    // Show modal using Bootstrap
    const modal = document.getElementById('addActionModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  // Delete workflow action
  deleteWorkflowAction(actionId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.workflowService.deleteWorkflowAction(actionId).subscribe({
          next: (response) => {
            console.log('Workflow action deleted:', response);
            // Show success message
            Swal.fire(
              'Deleted!',
              'Workflow action has been deleted.',
              'success'
            );
            // Reload workflow actions to get updated list
            this.loadWorkflowActions();
          },
                  error: (error) => {
          console.error('Error deleting workflow action:', error);
          // Show error message
          Swal.fire(
            'Error!',
            error.message || 'Failed to delete workflow action. Please try again.',
            'error'
          );
        }
        });
      }
    });
  }

  // Navigate back to workflows list
  goBack() {
    this.router.navigate(['/workflow-management']);
  }

  // Open add action modal
  openAddActionModal() {
    this.addActionForm.patchValue({
      workflow_configuration_id: this.workflowId
    });
    this.loadAvailableActors();
    this.updateAvailableParentActions();
    // Show modal using Bootstrap
    const modal = document.getElementById('addActionModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  // Load available actors (users and groups)
  loadAvailableActors() {
    // Load users
    this.workflowService.getUsers().subscribe({
      next: (response) => {
        console.log('Users loaded:', response);
        this.availableUsers = response.data || response.message || [];
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.availableUsers = [];
        Swal.fire(
          'Warning!',
          error.message || 'Failed to load users. Some features may be limited.',
          'warning'
        );
      }
    });

    // Load groups
    this.workflowService.getGroups().subscribe({
      next: (response) => {
        console.log('Groups loaded:', response);
        this.availableGroups = response.data || response.message || [];
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        this.availableGroups = [];
        Swal.fire(
          'Warning!',
          error.message || 'Failed to load groups. Some features may be limited.',
          'warning'
        );
      }
    });
  }

  // Update available parent actions based on selected action type
  updateAvailableParentActions() {
    const selectedActionType = this.addActionForm.get('action_type')?.value;
    console.log('Updating parent actions for action type:', selectedActionType);
    console.log('Current workflow actions:', this.workflowConfigObj);
    
    if (selectedActionType && this.workflowConfigObj) {
      // Filter existing actions to find available parents
      this.availableParentActions = this.workflowConfigObj.filter(action => {
        const isSameType = action.action_type === selectedActionType;
        const isNotAlreadyParent = !this.workflowConfigObj.some(existing => existing.parent === action.id);
        const isAvailable = isSameType && isNotAlreadyParent;
        
        console.log(`Action ${action.id} (${action.action_type}):`, {
          isSameType,
          isNotAlreadyParent,
          isAvailable,
          actorName: this.getActorName(action)
        });
        
        return isAvailable;
      });
      
      console.log('Available parent actions:', this.availableParentActions);
    } else {
      this.availableParentActions = [];
      console.log('No action type selected or no workflow actions available');
    }
  }

  // Handle action type change
  onActionTypeChange() {
    this.updateAvailableParentActions();
  }

  // Handle actor type change
  onActorTypeChange() {
    this.addActionForm.patchValue({ id_actor: '' });
  }

  // Submit add/update action form
  submitAddAction() {
    if (this.addActionForm.valid) {
      this.addActionLoading = true;
      const formData = this.addActionForm.value;
      
      if (this.isEditMode && this.editingAction) {
        // Update existing action
        this.workflowService.updateWorkflowAction(this.editingAction.id, formData).subscribe({
          next: (response) => {
            console.log('Workflow action updated:', response);
            this.addActionLoading = false;
            Swal.fire(
              'Updated!',
              'Workflow action has been updated successfully.',
              'success'
            );
            this.loadWorkflowActions(); // Reload actions
            this.closeAddActionModal();
          },
          error: (error) => {
            console.error('Error updating workflow action:', error);
            this.addActionLoading = false;
            Swal.fire(
              'Error!',
              error.message || 'Failed to update workflow action. Please try again.',
              'error'
            );
          }
        });
      } else {
        // Create new action
        this.workflowService.createWorkflowAction(formData).subscribe({
          next: (response) => {
            console.log('Workflow action created:', response);
            this.addActionLoading = false;
            Swal.fire(
              'Created!',
              'Workflow action has been created successfully.',
              'success'
            );
            this.loadWorkflowActions(); // Reload actions
            this.closeAddActionModal();
          },
          error: (error) => {
            console.error('Error creating workflow action:', error);
            this.addActionLoading = false;
            Swal.fire(
              'Error!',
              error.message || 'Failed to create workflow action. Please try again.',
              'error'
            );
          }
        });
      }
    }
  }

  // Close add action modal
  closeAddActionModal() {
    const modal = document.getElementById('addActionModal');
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
    this.addActionForm.reset();
    this.editingAction = null;
    this.isEditMode = false;
  }

  // Validation helper methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.addActionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.addActionForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${fieldName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'action_type') {
          return 'Action type must be either "approve" or "reject"';
        }
        if (fieldName === 'type_actor') {
          return 'Actor type must be either "1" (User) or "2" (Group)';
        }
      }
    }
    return '';
  }

  isFormValid(): boolean {
    return this.addActionForm.valid;
  }
}
