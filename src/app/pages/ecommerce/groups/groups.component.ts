import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsModalService, BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { GroupService } from 'src/app/core/services/group.service';
import { RoleService } from 'src/app/core/services/role.service';
import { UserService } from 'src/app/core/services/user.service';
import { PermissionService } from 'src/app/core/services/permission.service';
import { Group, PaginatedGroupsResponse, CreateGroupPayload, UpdateGroupPayload } from 'src/app/core/models/group.model';
import { Role } from 'src/app/core/models/role.model';
import { UserDetail } from 'src/app/core/models/user.model';
import { Permission } from 'src/app/core/models/permission.model';
import { Observable, throwError, of, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { GroupDetail } from 'src/app/core/models/group.model';

// Define a type for the group form for strong typing
interface GroupForm {
  id: FormControl<string | null>;
  name: FormControl<string>;
  description: FormControl<string | null>;
  roles: FormControl<string[]>;
  users: FormControl<string[]>;
}

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss'
})

/**
 * Groups component for Access Management
 */
export class GroupsComponent implements OnInit {
  // Component state
  isLoading: boolean = true;
  error: string | null = null;
  
  // Alert properties
  alertMessage: string | null = null;
  alertType: 'success' | 'error' | 'warning' | 'info' = 'success';
  private alertTimeout: any;
  alert: { type: 'success' | 'error'; message: string } | null = null;
  
  // Loading states for different operations
  saving: boolean = false;
  deleting: boolean = false;
  
  // Group data
  groupList: Group[] = [];
  allGroupList: Group[] = [];
  
  // Related data for forms
  allRoles: Role[] = [];
  allUsers: UserDetail[] = [];
  permissionCategories: any[] = [];
  expandedCategories: number[] = [0]; // First category expanded by default
  
  // Pagination properties
  currentPage: number = 1;
  totalPages: number = 1;
  lastPage: number = 1;
  totalRecords: number = 0;
  totalItems: number = 0;
  
  // Modal and form
  modalRef?: BsModalRef;
  groupForm: FormGroup<GroupForm>;
  submitted = false;
  deletId: any;
  isEditMode = false;
  originalGroupData: Group | null = null; // Track original group data for comparison

  // UI
  breadCrumbItems: Array<{}>;
  // Search and filtering
  term: any;
  searchTerm: string = '';
  masterSelected!: boolean;
  
  @ViewChild('showModal', { static: false }) showModal?: ModalDirective;
  @ViewChild('removeItemModal') removeItemModal!: TemplateRef<any>;
  @ViewChild('addEditModal') addEditModal!: TemplateRef<any>;
  @ViewChild('groupDetailsModal') groupDetailsModal!: TemplateRef<any>;

  selectedGroup: Group | null = null;
  selectedGroupDetail: GroupDetail | null = null;

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private store: Store,
    private router: Router,
    private groupService: GroupService,
    private roleService: RoleService,
    private userService: UserService,
    private permissionService: PermissionService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Access Management' }, { label: 'Groups', active: true }];

    this.groupForm = this.formBuilder.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: [''],
      roles: [[] as string[]],
      users: [[] as string[]]
    }) as FormGroup<GroupForm>;

    this.fetchGroups();
    this.fetchRoles();
    this.fetchUsers();
  }

  fetchGroups(page: number = 1) {
    this.isLoading = true;
    this.error = null;
    
    this.groupService.getGroups(page).pipe(
      catchError(this.handleError.bind(this))
    ).subscribe({
      next: (response) => {
        this.groupList = response.data;
        this.allGroupList = response.data;
        this.currentPage = response.current_page;
        this.totalPages = response.last_page;
        this.lastPage = response.last_page;
        this.totalRecords = response.total;
        this.totalItems = response.total;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch groups. Please try again later.';
        this.isLoading = false;
        this.toastr.error('Failed to fetch groups. Please try again later.', 'Error');
      }
    });
  }

  fetchRoles() {
    this.roleService.getRoles().subscribe({
      next: (response) => {
        this.allRoles = response.data;
      },
      error: (err) => {
        this.toastr.error('Failed to load roles. Please refresh the page.', 'Error');
      }
    });
  }

  fetchUsers() {
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.allUsers = response.data;
      },
      error: (err) => {
        this.toastr.error('Failed to load users. Please refresh the page.', 'Error');
      }
    });
  }

  /**
   * Handle errors with detailed logging
   */
  private handleError(error: any) {
    // Let the error interceptor handle the main error logging and user feedback
    // This method is for component-specific error handling
    
    if (error.status === 422) {
      // Validation errors - handled by error interceptor, but we can add component-specific logic here
    } else if (error.status === 404) {
      // Not found - error interceptor will handle the toast
    } else if (error.status === 500) {
      // Server error - error interceptor will handle the toast
    }
    
    return throwError(() => error);
  }

  /**
   * Search groups
   */
  searchGroup() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.groupList = this.allGroupList;
      return;
    }
    
    const searchTerm = this.searchTerm.toLowerCase().trim();
    this.groupList = this.allGroupList.filter(group => 
      group.name.toLowerCase().includes(searchTerm) ||
      (group.description && group.description.toLowerCase().includes(searchTerm))
    );
  }

  // pagination
  pageChanged(event: any): void {
    this.fetchGroups(event.page);
  }

  /**
   * Form data get
   */
  get form() {
    return this.groupForm.controls;
  }

  // Get role name by ID
  getRoleName(roleId: string): string {
    if (!roleId) return 'Unknown Role';
    const role = this.allRoles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown Role';
  }

  // Get user name by ID
  getUserName(userId: string): string {
    if (!userId) return 'Unknown User';
    const user = this.allUsers.find(u => u.id === userId);
    return user ? `${user.firstname} ${user.lastname}` : 'Unknown User';
  }

  // Toggle category expansion
  toggleCategory(categoryIndex: number) {
    const index = this.expandedCategories.indexOf(categoryIndex);
    if (index > -1) {
      this.expandedCategories.splice(index, 1);
    } else {
      this.expandedCategories.push(categoryIndex);
    }
  }

  // Check if a role is selected
  isRoleSelected(roleId: string): boolean {
    const selectedRoles = this.groupForm.get('roles')?.value || [];
    return Array.isArray(selectedRoles) && selectedRoles.includes(roleId);
  }

  // Check if a user is selected
  isUserSelected(userId: string): boolean {
    const selectedUsers = this.groupForm.get('users')?.value || [];
    return Array.isArray(selectedUsers) && selectedUsers.includes(userId);
  }

  // Handle role checkbox change
  onRoleChange(event: any, roleId: string) {
    const rolesControl = this.groupForm.get('roles');
    if (!rolesControl) return;

    const currentRoles = rolesControl.value || [];
    const rolesArray = Array.isArray(currentRoles) ? currentRoles : [];

    if (event.target.checked) {
      // Add role if not already selected
      if (!rolesArray.includes(roleId)) {
        rolesArray.push(roleId);
      }
    } else {
      // Remove role if selected
      const index = rolesArray.indexOf(roleId);
      if (index > -1) {
        rolesArray.splice(index, 1);
      }
    }

    rolesControl.setValue(rolesArray);
  }

  // Handle user checkbox change
  onUserChange(event: any, userId: string) {
    const usersControl = this.groupForm.get('users');
    if (!usersControl) return;

    const currentUsers = usersControl.value || [];
    const usersArray = Array.isArray(currentUsers) ? currentUsers : [];

    if (event.target.checked) {
      // Add user if not already selected
      if (!usersArray.includes(userId)) {
        usersArray.push(userId);
      }
    } else {
      // Remove user if selected
      const index = usersArray.indexOf(userId);
      if (index > -1) {
        usersArray.splice(index, 1);
      }
    }

    usersControl.setValue(usersArray);
  }

  /**
   * Open modal for adding/editing group
   */
  openModal(content?: any) {
    this.isEditMode = false;
    this.submitted = false;
    this.selectedGroup = null;
    this.originalGroupData = null;
    
    // Reset form
    this.groupForm.patchValue({
      id: null,
      name: '',
      description: '',
      roles: [],
      users: []
    });
    
    // Ensure all necessary data is loaded before opening modal
    if (this.allRoles.length === 0 || this.allUsers.length === 0) {
      this.toastr.warning('Loading data, please wait...', 'Please Wait');
      return;
    }
    
    // Open modal using the correct template
    this.modalRef = this.modalService.show(this.addEditModal, {
      class: 'modal-lg',
      backdrop: 'static',
      keyboard: false
    });
  }

  /**
   * Save group (create or update)
   */
  saveGroup() {
    this.submitted = true;
    
    if (this.groupForm.invalid) {
      this.toastr.error('Please fill in all required fields correctly.', 'Validation Error');
      return;
    }

    this.saving = true;
    const formData = this.groupForm.value;
    
    // Prepare the payload
    const payload = {
      name: formData.name,
      description: formData.description || null
    };

    if (this.isEditMode && formData.id) {
      // Update existing group
      this.groupService.updateGroup(formData.id, payload).pipe(
        catchError(this.handleError.bind(this))
      ).subscribe({
        next: (response) => {
          // After updating the group, assign roles and users separately
          this.assignRolesAndUsers(formData.id, formData.roles, formData.users);
        },
        error: (err) => {
          this.saving = false;
          
          if (err.status === 422) {
            // Validation errors
            const errors = err.error?.errors;
            if (errors) {
              Object.keys(errors).forEach(field => {
                const control = this.groupForm.get(field);
                if (control) {
                  control.setErrors({ serverError: errors[field][0] });
                }
              });
            }
            this.toastr.error(err.error?.message || 'Validation failed. Please check the form.', 'Validation Error');
          } else {
            this.toastr.error('Failed to update group. Please try again.', 'Error');
          }
        }
      });
    } else {
      // Create new group
      this.groupService.createGroup(payload).pipe(
        catchError(this.handleError.bind(this))
      ).subscribe({
        next: (response) => {
          // After creating the group, assign roles and users separately
          if (response.data && response.data.id) {
            this.assignRolesAndUsers(response.data.id, formData.roles, formData.users);
          } else {
            this.saving = false;
            this.modalRef?.hide();
            this.fetchGroups();
            this.toastr.success('Group created successfully!', 'Success');
          }
        },
        error: (err) => {
          this.saving = false;
          
          if (err.status === 422) {
            // Validation errors
            const errors = err.error?.errors;
            if (errors) {
              Object.keys(errors).forEach(field => {
                const control = this.groupForm.get(field);
                if (control) {
                  control.setErrors({ serverError: errors[field][0] });
                }
              });
            }
            this.toastr.error(err.error?.message || 'Validation failed. Please check the form.', 'Validation Error');
          } else {
            this.toastr.error('Failed to create group. Please try again.', 'Error');
          }
        }
      });
    }
  }

  /**
   * Assign roles and users to a group
   */
  private assignRolesAndUsers(groupId: string, roleIds: string[], userIds: string[]) {
    const assignments = [];
    
    // Assign roles one by one (backend expects singular role_id)
    if (roleIds && roleIds.length > 0) {
      roleIds.forEach(roleId => {
        assignments.push(
          this.groupService.assignRoleToGroup(groupId, roleId).pipe(
            catchError(error => {
              if (error.status === 422) {
                const errors = error.error?.errors;
                if (errors?.role_id) {
                  this.toastr.error(`Role assignment failed: ${errors.role_id[0]}`, 'Validation Error');
                } else {
                  this.toastr.warning(`Failed to assign role ${roleId}.`, 'Warning');
                }
              } else {
                this.toastr.warning(`Failed to assign role ${roleId}.`, 'Warning');
              }
              return of(null);
            })
          )
        );
      });
    }
    
    // Assign users one by one (backend expects singular user_id)
    if (userIds && userIds.length > 0) {
      userIds.forEach(userId => {
        assignments.push(
          this.groupService.assignUserToGroup(groupId, userId).pipe(
            catchError(error => {
              if (error.status === 422) {
                const errors = error.error?.errors;
                if (errors?.user_id) {
                  this.toastr.error(`User assignment failed: ${errors.user_id[0]}`, 'Validation Error');
                } else {
                  this.toastr.warning(`Failed to assign user ${userId}.`, 'Warning');
                }
              } else {
                this.toastr.warning(`Failed to assign user ${userId}.`, 'Warning');
              }
              return of(null);
            })
          )
        );
      });
    }
    
    if (assignments.length > 0) {
      forkJoin(assignments).subscribe({
        next: (results) => {
          this.saving = false;
          this.modalRef?.hide();
          this.fetchGroups();
          this.toastr.success('Group saved successfully!', 'Success');
        },
        error: (err) => {
          this.saving = false;
          this.modalRef?.hide();
          this.fetchGroups();
          this.toastr.success('Group saved with some assignment issues.', 'Success');
        }
      });
    } else {
      this.saving = false;
      this.modalRef?.hide();
      this.fetchGroups();
      this.toastr.success('Group saved successfully!', 'Success');
    }
  }

  /**
   * Remove a role from a group
   */
  removeRoleFromGroup(groupId: string, roleId: string, roleName: string) {
    if (confirm(`Are you sure you want to remove the role "${roleName}" from this group?`)) {
      this.groupService.removeRoleFromGroup(groupId, roleId).pipe(
        catchError(this.handleError.bind(this))
      ).subscribe({
        next: (response) => {
          this.fetchGroups(); // Refresh the list
          this.toastr.success(`Role "${roleName}" removed from group successfully!`, 'Success');
        },
        error: (err) => {
          this.toastr.error('Failed to remove role from group. Please try again.', 'Error');
        }
      });
    }
  }

  /**
   * Remove a user from a group
   */
  removeUserFromGroup(groupId: string, userId: string, userName: string) {
    if (confirm(`Are you sure you want to remove the user "${userName}" from this group?`)) {
      this.groupService.removeUserFromGroup(groupId, userId).pipe(
        catchError(this.handleError.bind(this))
      ).subscribe({
        next: (response) => {
          this.fetchGroups(); // Refresh the list
          this.toastr.success(`User "${userName}" removed from group successfully!`, 'Success');
        },
        error: (err) => {
          this.toastr.error('Failed to remove user from group. Please try again.', 'Error');
        }
      });
    }
  }

  /**
   * Edit group modal
   */
  editModal(group: Group) {
    this.isEditMode = true;
    this.submitted = false;
    this.selectedGroup = group;
    this.originalGroupData = { ...group }; // Store original data for comparison
    
    // Populate form with group data
    this.groupForm.patchValue({
      id: group.id,
      name: group.name,
      description: group.description || '',
      roles: group.roles || [],
      users: group.users || []
    });
    
    // Ensure all necessary data is loaded before opening modal
    if (this.allRoles.length === 0 || this.allUsers.length === 0) {
      this.toastr.warning('Loading data, please wait...', 'Please Wait');
      return;
    }
    
    // Open modal using the correct template
    this.modalRef = this.modalService.show(this.addEditModal, {
      class: 'modal-lg',
      backdrop: 'static',
      keyboard: false
    });
  }

  /**
   * Confirm delete group
   */
  confirmDelete(groupOrId: Group | string) {
    let groupId: string;
    let group: Group | null = null;
    
    if (typeof groupOrId === 'string') {
      groupId = groupOrId;
      group = this.groupList.find(g => g.id === groupId) || null;
    } else {
      group = groupOrId;
      groupId = group.id;
    }
    
    if (!groupId) {
      this.toastr.error('Invalid group ID', 'Error');
      return;
    }
    
    if (!group) {
      this.toastr.error('Group not found', 'Error');
      return;
    }
    
    this.deletId = groupId;
    this.selectedGroup = group;
    
    this.modalRef = this.modalService.show(this.removeItemModal, { class: 'modal-md' });
  }
  
  /**
   * Delete group
   */
  deleteGroup() {
    if (!this.deletId) {
      this.toastr.error('No group selected for deletion', 'Error');
      return;
    }
    
    this.deleting = true;
    const groupId = this.deletId.toString();
    
    this.groupService.deleteGroup(groupId).pipe(
      catchError(this.handleError.bind(this))
    ).subscribe({
      next: (response) => {
        this.fetchGroups();
        this.modalRef?.hide();
        this.deleting = false;
        this.toastr.success('Group deleted successfully!', 'Success');
        this.selectedGroup = null;
        this.deletId = null;
      },
      error: (err) => {
        this.deleting = false;
        
        if (err.status === 404) {
          this.toastr.error('Group not found. It may have been already deleted.', 'Error');
        } else if (err.status === 403) {
          this.toastr.error('You do not have permission to delete this group.', 'Error');
        } else if (err.status === 409) {
          this.toastr.error('Cannot delete group: It has active relationships.', 'Error');
        } else {
          this.toastr.error(`Failed to delete group: ${err.error?.message || 'Unknown error'}`, 'Error');
        }
      }
    });
  }

  /**
   * Show alert notification
   */
  showAlert(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success', autoDismiss: boolean = true) {
    this.clearAlert();
    this.alert = { type: type as 'success' | 'error', message };
    
    if (autoDismiss) {
      this.alertTimeout = setTimeout(() => {
        this.clearAlert();
      }, 5000);
    }
  }

  /**
   * Clear alert notification
   */
  clearAlert() {
    this.alert = null;
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
      this.alertTimeout = null;
    }
  }

  /**
   * Navigate to group details page
   */
  viewGroupDetails(groupId: string) {
    this.router.navigate(['/access-management/groups', groupId]);
  }

  /**
   * Fetch and display group details
   */
  fetchGroupDetails(groupId: string) {
    this.isLoading = true;
    this.groupService.getGroup(groupId).pipe(
      catchError(this.handleError.bind(this))
    ).subscribe({
      next: (response) => {
        this.selectedGroupDetail = response.data;
        this.isLoading = false;
        this.modalRef = this.modalService.show(this.groupDetailsModal, { class: 'modal-lg' });
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Failed to fetch group details. Please try again.', 'Error');
      }
    });
  }

  /**
   * Show group details modal
   */
  showGroupDetailsModal(group: GroupDetail) {
    // You can implement a detailed modal here or navigate to a separate details page
    const details = `
Group: ${group.name}
Description: ${group.description || 'No description'}
Created: ${new Date(group.created_at).toLocaleDateString()}
Updated: ${new Date(group.updated_at).toLocaleDateString()}

Roles: ${group.roles?.length || 0}
Users: ${group.users?.length || 0}
    `;
    
    // For now, show in alert. You can replace this with a proper modal
    alert(details);
  }

  // Add Math property for template use
  Math = Math;

  /**
   * Get page numbers for pagination
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  /**
   * Test role assignment (for debugging)
   */
  testRoleAssignment(groupId: string, roleId?: string) {
    // Use the first available role if no roleId is provided
    const testRoleId = roleId || (this.allRoles.length > 0 ? this.allRoles[0].id : null);
    
    if (!testRoleId) {
      this.toastr.error('No roles available for testing!', 'Test Error');
      return;
    }
    
    console.log('Testing role assignment for group:', groupId, 'role:', testRoleId);
    console.log('Available roles:', this.allRoles.map(r => ({ id: r.id, name: r.name })));
    
    this.groupService.assignRoleToGroup(groupId, testRoleId).subscribe({
      next: (response) => {
        console.log('Role assignment test successful:', response);
        this.toastr.success(`Role assignment test successful for role: ${this.getRoleName(testRoleId)}!`, 'Test');
        this.fetchGroups(); // Refresh the list
      },
      error: (error) => {
        console.error('Role assignment test failed:', error);
        this.toastr.error(`Role assignment test failed: ${error.error?.message || 'Unknown error'}`, 'Test Error');
      }
    });
  }

  /**
   * Debug form data
   */
  debugFormData() {
    const formData = this.groupForm.value;
    console.log('=== FORM DEBUG INFO ===');
    console.log('Form valid:', this.groupForm.valid);
    console.log('Form dirty:', this.groupForm.dirty);
    console.log('Form touched:', this.groupForm.touched);
    console.log('Form data:', formData);
    console.log('Roles from form:', formData.roles);
    console.log('Users from form:', formData.users);
    console.log('Available roles:', this.allRoles.map(r => ({ id: r.id, name: r.name })));
    console.log('Available users:', this.allUsers.map(u => ({ id: u.id, name: `${u.firstname} ${u.lastname}` })));
    console.log('Is edit mode:', this.isEditMode);
    console.log('Selected group:', this.selectedGroup);
    console.log('=== END DEBUG INFO ===');
    
    this.toastr.info('Form debug info logged to console', 'Debug');
  }

  /**
   * Refresh a specific group's data
   */
  refreshGroup(groupId: string) {
    console.log('Refreshing group:', groupId);
    
    this.groupService.getGroup(groupId).subscribe({
      next: (response) => {
        console.log('Refreshed group data:', response.data);
        // Convert GroupDetail to Group format for display
        const groupData: Group = {
          id: response.data.id,
          name: response.data.name,
          description: response.data.description,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
          roles: response.data.roles?.map(role => role.id) || [],
          users: response.data.users?.map(user => user.id) || []
        };
        
        // Update the group in the list
        const index = this.groupList.findIndex(g => g.id === groupId);
        if (index !== -1) {
          this.groupList[index] = groupData;
        }
        this.toastr.success('Group data refreshed!', 'Success');
      },
      error: (error) => {
        console.error('Error refreshing group:', error);
        this.toastr.error('Failed to refresh group data.', 'Error');
      }
    });
  }

  /**
   * Test delete group (for debugging)
   */
  testDeleteGroup(groupId: string) {
    console.log('Testing delete for group:', groupId);
    
    if (confirm(`Are you sure you want to test delete for group ${groupId}?`)) {
      this.groupService.deleteGroup(groupId).subscribe({
        next: (response) => {
          console.log('Delete test successful:', response);
          this.toastr.success('Delete test successful!', 'Test');
          this.fetchGroups(); // Refresh the list
        },
        error: (error) => {
          console.error('Delete test failed:', error);
          this.toastr.error(`Delete test failed: ${error.error?.message || 'Unknown error'}`, 'Test Error');
        }
      });
    }
  }

  /**
   * Test role and user assignments (for debugging)
   */
  testAssignments(groupId: string) {
    console.log('Testing assignments for group:', groupId);
    
    // Get first available role and user for testing
    const testRoleId = this.allRoles.length > 0 ? this.allRoles[0].id : null;
    const testUserId = this.allUsers.length > 0 ? this.allUsers[0].id : null;
    
    if (!testRoleId || !testUserId) {
      this.toastr.error('No roles or users available for testing', 'Test Error');
      return;
    }
    
    console.log('Testing with role:', testRoleId, 'and user:', testUserId);
    
    // Test role assignment (individual)
    this.groupService.assignRoleToGroup(groupId, testRoleId).subscribe({
      next: (response) => {
        console.log('Role assignment test successful:', response);
        this.toastr.success('Role assignment test successful!', 'Test');
        
        // Test user assignment (individual)
        this.groupService.assignUserToGroup(groupId, testUserId).subscribe({
          next: (userResponse) => {
            console.log('User assignment test successful:', userResponse);
            this.toastr.success('User assignment test successful!', 'Test');
            this.fetchGroups(); // Refresh the list
          },
          error: (userError) => {
            console.error('User assignment test failed:', userError);
            this.toastr.error(`User assignment test failed: ${userError.error?.message || 'Unknown error'}`, 'Test Error');
          }
        });
      },
      error: (error) => {
        console.error('Role assignment test failed:', error);
        this.toastr.error(`Role assignment test failed: ${error.error?.message || 'Unknown error'}`, 'Test Error');
      }
    });
  }
} 