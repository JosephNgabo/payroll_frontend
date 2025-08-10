import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsModalService, BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { RoleService } from 'src/app/core/services/role.service';
import { PermissionService } from 'src/app/core/services/permission.service';
import { Role, PaginatedRolesResponse, CreateRolePayload, UpdateRolePayload } from 'src/app/core/models/role.model';
import { Permission } from 'src/app/core/models/permission.model';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

// Define a type for the role form for strong typing
interface RoleForm {
  id: FormControl<string | null>;
  name: FormControl<string>;
  permissions: FormControl<string[]>;
}

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})

/**
 *  roles component
 */
export class RolesComponent implements OnInit {
  // Component state
  isLoading: boolean = true;
  error: string | null = null;
  
  // Alert notification system
  alertMessage: string | null = null;
  alertType: 'success' | 'error' | 'warning' | 'info' = 'success';
  private alertTimeout: any;
  
  // Loading states for different operations
  saving: boolean = false;
  deleting: boolean = false;
  
  // Role data
  roleList: Role[] = [];
  allRoleList: Role[] = [];
  
  // Permission data for form
  allPermissions: Permission[] = [];
  permissionCategories: any[] = [];
  expandedCategories: number[] = [0]; // First category expanded by default
  
  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  
  // Modal and form
  modalRef?: BsModalRef;
  roleForm: FormGroup<RoleForm>;
  submitted = false;
  deletId: any;
  isEditMode = false;
  originalRoleData: Role | null = null; // Track original role data for comparison

  // UI
  breadCrumbItems: Array<{}>;
  term: any;
  masterSelected!: boolean;
  
  @ViewChild('showModal', { static: false }) showModal?: ModalDirective;
  @ViewChild('removeItemModal') removeItemModal!: TemplateRef<any>;

  selectedRole: Role | null = null;

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private store: Store,
    private router: Router,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Access Management' }, { label: 'Roles', active: true }];

    this.roleForm = this.formBuilder.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      permissions: [[] as string[], [Validators.required, Validators.minLength(1)]]
    }) as FormGroup<RoleForm>;

    // Set up permissions form control to handle multiple selections
    const permissionsControl = this.roleForm.get('permissions');
    if (permissionsControl) {
      permissionsControl.valueChanges.subscribe(value => {
        // Permission value change tracking removed for production
      });
    }

    this.fetchRoles();
    this.fetchPermissions();
  }

  fetchRoles(page: number = 1) {
    this.isLoading = true;
    this.error = null;
    this.roleService.getRoles(page).pipe(
      catchError(this.handleError.bind(this))
    ).subscribe({
      next: (response: PaginatedRolesResponse) => {
        this.roleList = response.data;
        this.allRoleList = response.data;
        this.currentPage = response.current_page;
        this.totalPages = response.last_page;
        this.totalRecords = response.total;
        this.isLoading = false;
        
        // Debug: Check if roles have permissions
        this.roleList.forEach((role, index) => {
        });
      },
      error: (err) => {
        this.error = 'Failed to fetch roles. Please try again later.';
        this.isLoading = false;
        this.toastr.error('Failed to fetch roles. Please try again later.', 'Error');
      }
    });
  }

  fetchPermissions() {
    this.permissionService.getPermissions().pipe(
      catchError(this.handleError.bind(this))
    ).subscribe({
      next: (response) => {
        this.allPermissions = [];
        response.data.forEach(category => {
          this.allPermissions.push(...category.permissions);
        });
        this.permissionCategories = response.data;
      },
      error: (err) => {
        console.error('Failed to fetch permissions:', err);
        this.toastr.error('Failed to load permissions. Please refresh the page.', 'Error');
      }
    });
  }

  /**
   * Handle HTTP errors and extract backend validation messages
   */
  private handleError(error: any) {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    if (error && error.error) {
      if (error.error.errors) {
        // Laravel validation errors
        const errors = error.error.errors;
        errorMessage = Object.values(errors).flat().join(', ');
      } else if (error.error.message) {
        errorMessage = error.error.message;
      }
    } else if (error && error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    console.error('Service Error:', error);
    this.toastr.error(errorMessage, 'Error');
    
    return throwError(() => errorMessage);
  }

  // The master checkbox will check/ uncheck all items
  checkUncheckAll(ev: any) {
    // This logic needs to be adapted if bulk operations are required
  }

  checkedValGet: any[] = [];
  // Delete Data
  deleteData(id: any) {
    if (id) {
      document.getElementById('r_' + id)?.remove();
    } else {
      this.checkedValGet?.forEach((item: any) => {
        document.getElementById('r_' + item)?.remove();
      });
    }
  }

  // Delete Data
  confirmDelete(id: any) {
    this.deletId = id;
    this.selectedRole = this.roleList.find(r => r.id === id) || null;
    this.modalRef = this.modalService.show(this.removeItemModal, { class: 'modal-md' });
  }
  
  // delete role
  deleteRole() {
    if (!this.deletId) return;
    this.deleting = true;
    this.roleService.deleteRole(this.deletId).pipe(
      catchError(this.handleError.bind(this))
    ).subscribe({
      next: () => {
        this.fetchRoles(); // Refresh the list
        this.modalRef?.hide();
        this.deleting = false;
        this.toastr.success('Role deleted successfully!', 'Success');
      },
      error: (err) => {
        console.error('Delete role error:', err);
        this.deleting = false;
        this.toastr.error('Failed to delete role. Please try again.', 'Error');
      }
    });
  }

  // filter roles - Updated to search in new fields
  searchRole() {
    if (this.term) {
      this.roleList = this.allRoleList.filter((data: Role) => {
        return data.name.toLowerCase().includes(this.term.toLowerCase());
      });
    } else {
      this.roleList = this.allRoleList;
    }
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.isEditMode = false;
    this.submitted = false;
    this.error = null; // Clear any previous errors
    this.roleForm.reset();
    this.originalRoleData = null; // Clear original role data for new role creation
    
    // Clear any server errors
    Object.keys(this.roleForm.controls).forEach(key => {
      this.roleForm.get(key)?.setErrors(null);
    });
    
    // Ensure permissions are loaded before opening modal
    if (this.permissionCategories.length === 0) {
      this.fetchPermissions();
      // Wait a bit for permissions to load
      setTimeout(() => {
        this.modalRef = this.modalService.show(content, { class: 'modal-lg' });
      }, 500);
    } else {
      this.modalRef = this.modalService.show(content, { class: 'modal-lg' });
    }
  }
  
  /**
   * Form data get
   */
  get form() {
    return this.roleForm.controls;
  }

  /**
   * Check if the role has been modified from its original state
   */
  hasRoleBeenModified(): boolean {
    if (!this.originalRoleData || !this.roleForm.value) {
      return false;
    }
    
    const currentData = this.roleForm.value;
    const originalData = this.originalRoleData;
    
    // Check if name has changed
    const nameChanged = currentData.name !== originalData.name;
    
    if (nameChanged) {
      return true;
    }
    
    // Check if permissions have changed
    const currentPermissions = Array.isArray(currentData.permissions) ? currentData.permissions : [];
    
    // Convert original permissions from RolePermission[] to string[]
    const originalPermissionIds = Array.isArray(originalData.permissions) 
      ? originalData.permissions.map(p => {
          // Handle both string[] and RolePermission[] cases
          if (typeof p === 'string') {
            return p;
          } else if (p && typeof p === 'object') {
            const permission = p as any;
            return permission.id || permission.permission_id;
          }
          return null;
        }).filter(id => id !== null)
      : [];
    
    if (currentPermissions.length !== originalPermissionIds.length) {
      return true;
    }
    
    // Check if any permissions have been added or removed
    const currentSet = new Set(currentPermissions);
    const originalSet = new Set(originalPermissionIds);
    
    for (const permission of currentSet) {
      if (!originalSet.has(permission)) {
        return true;
      }
    }
    
    for (const permission of originalSet) {
      if (!currentSet.has(permission)) {
        return true;
      }
    }
    
    return false;
  }

  /**
  * Save role - Updated to handle new fields
  */
  saveRole() {
    this.submitted = true;
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }
    
    // Check if any changes were made in edit mode
    if (this.isEditMode && !this.hasRoleBeenModified()) {
      this.toastr.info('No changes detected. Role remains unchanged.', 'Info');
      this.modalRef?.hide();
      this.submitted = false;
      return;
    }
    
    // Validate role name uniqueness (skip if editing and name hasn't changed)
    const roleName = this.roleForm.get('name')?.value;
    if (roleName) {
      // Only validate name uniqueness if we're creating a new role OR if the name has actually changed
      const nameChanged = this.isEditMode ? this.roleForm.get('name')?.value !== this.originalRoleData?.name : true;
      
      if (nameChanged) {
        const nameError = this.validateRoleName(roleName);
        if (nameError) {
          this.toastr.error(nameError, 'Validation Error');
          const nameControl = this.roleForm.get('name');
          if (nameControl) {
            nameControl.setErrors({ ...nameControl.errors, serverError: nameError });
          }
          return;
        }
      }
    }
    
    // Show changes summary in edit mode
    if (this.isEditMode) {
      this.showChangesSummary();
    }
    
    this.saving = true;
    this.error = null; // Clear any previous errors
    
    const formValue = this.roleForm.value;
    const roleId = this.roleForm.get('id')?.value;
    
    if (roleId) {
      // Update existing role - always include name to satisfy backend validation
      const changes = this.getChangesSummary();
      const updatePayload: UpdateRolePayload = {
        name: formValue.name, // Always include name to satisfy backend validation
        permissions: formValue.permissions
      };
      
      // If no changes, don't make the API call
      if (!changes.nameChanged && !changes.permissionsChanged) {
        this.toastr.info('No changes detected. Role remains unchanged.', 'Info');
        this.modalRef?.hide();
        this.submitted = false;
        this.saving = false;
        return;
      }
      
      // If only permissions are being updated, show a warning about potential name conflict
      if (!changes.nameChanged && changes.permissionsChanged) {
      }
      
      this.roleService.updateRole(roleId, updatePayload).pipe(
        catchError(this.handleError.bind(this))
      ).subscribe({
        next: (response) => {
          
          // Handle the new response format
          if (response.status && response.data) {
            this.fetchRoles();
            this.modalRef?.hide();
            this.roleForm.reset();
            this.submitted = false;
            this.saving = false;
            this.toastr.success(response.message || 'Role updated successfully!', 'Success');
          } else {
            // Fallback for old response format
            this.fetchRoles();
            this.modalRef?.hide();
            this.roleForm.reset();
            this.submitted = false;
            this.saving = false;
            this.toastr.success('Role updated successfully!', 'Success');
          }
        },
        error: (err) => {
          if (err.status === 422 && err.error && err.error.errors) {
            const errors = err.error.errors;
            
            // Clear any existing server errors first
            Object.keys(this.roleForm.controls).forEach(key => {
              const control = this.roleForm.get(key);
              if (control) {
                const currentErrors = control.errors;
                if (currentErrors && currentErrors['serverError']) {
                  delete currentErrors['serverError'];
                  control.setErrors(Object.keys(currentErrors).length > 0 ? currentErrors : null);
                }
              }
            });
            
            // Set new server errors
            Object.keys(errors).forEach(field => {
              const control = this.roleForm.get(field);
              if (control) {
                const currentErrors = control.errors || {};
                const errorMessage = errors[field][0];
                control.setErrors({ ...currentErrors, serverError: errorMessage });
              }
            });
            
            // Set a generic error message
            this.error = err.error.message || 'Please correct the validation errors below.';
            this.toastr.warning('Please correct the validation errors below.', 'Validation Error');
          } else if (err.status === 404) {
            this.error = 'Role not found. It may have been deleted.';
            this.toastr.error('Role not found. It may have been deleted.', 'Error');
          } else if (err.status === 403) {
            this.error = 'You do not have permission to update this role.';
            this.toastr.error('You do not have permission to update this role.', 'Error');
          } else if (err.status === 409) {
            // Handle conflict errors (like duplicate name)
            const errorMessage = err.error?.message || 'Role name already exists.';
            this.error = errorMessage;
            this.toastr.error(errorMessage, 'Conflict Error');
            
            // Set error on the name field if it's a duplicate name error
            const nameControl = this.roleForm.get('name');
            if (nameControl && errorMessage.toLowerCase().includes('name')) {
              nameControl.setErrors({ ...nameControl.errors, serverError: errorMessage });
            }
          } else if (err.status === 422 && err.error?.errors?.name) {
            // Handle validation errors for name field
            const nameError = err.error.errors.name[0];
            this.error = nameError;
            this.toastr.error(nameError, 'Validation Error');
            
            // Set error on the name field
            const nameControl = this.roleForm.get('name');
            if (nameControl) {
              nameControl.setErrors({ ...nameControl.errors, serverError: nameError });
            }
            
            // If this is a "name already taken" error and we're editing without changing the name,
            // show a more helpful message
            if (nameError.toLowerCase().includes('already been taken') && !changes.nameChanged) {
              this.toastr.warning('The role name conflicts with another role. Please change the name or contact an administrator.', 'Name Conflict');
            }
          } else {
            // Handle other errors with full message
            const errorMessage = err.error?.message || err.message || 'Failed to update role.';
            this.error = errorMessage;
            this.toastr.error(errorMessage, 'Error');
          }
          this.saving = false;
        }
      });
    } else {
      // Ensure permissions is properly formatted as an array
      const permissions = formValue.permissions;
      
      // Ensure permissions is an array
      const permissionsArray = Array.isArray(permissions) ? permissions : [];
      
      // Create new role
      const createPayload: CreateRolePayload = {
        name: formValue.name,
        permissions: permissionsArray
      };
      
      this.roleService.createRole(createPayload).pipe(
        catchError(this.handleError.bind(this))
      ).subscribe({
        next: (newRole) => {
          this.fetchRoles();
          this.modalRef?.hide();
          this.roleForm.reset();
          this.submitted = false;
          this.saving = false;
          this.toastr.success('Role created successfully!', 'Success');
        },
        error: (err) => {
          if (err.status === 422 && err.error && err.error.errors) {
            const errors = err.error.errors;
            
            // Clear any existing server errors first
            Object.keys(this.roleForm.controls).forEach(key => {
              const control = this.roleForm.get(key);
              if (control) {
                const currentErrors = control.errors;
                if (currentErrors && currentErrors['serverError']) {
                  delete currentErrors['serverError'];
                  control.setErrors(Object.keys(currentErrors).length > 0 ? currentErrors : null);
                }
              }
            });
            
            // Set new server errors
            Object.keys(errors).forEach(field => {
              const control = this.roleForm.get(field);
              if (control) {
                const currentErrors = control.errors || {};
                const errorMessage = errors[field][0];
                control.setErrors({ ...currentErrors, serverError: errorMessage });
              }
            });
            
            // Set a generic error message
            this.error = err.error.message || 'Please correct the validation errors below.';
            this.toastr.warning('Please correct the validation errors below.', 'Validation Error');
          } else if (err.status === 409) {
            // Handle conflict errors (like duplicate name)
            const errorMessage = err.error?.message || 'Role name already exists.';
            this.error = errorMessage;
            this.toastr.error(errorMessage, 'Conflict Error');
            
            // Set error on the name field if it's a duplicate name error
            const nameControl = this.roleForm.get('name');
            if (nameControl && errorMessage.toLowerCase().includes('name')) {
              nameControl.setErrors({ ...nameControl.errors, serverError: errorMessage });
            }
          } else {
            // Handle other errors with full message
            const errorMessage = err.error?.message || err.message || 'Failed to create role.';
            this.error = errorMessage;
            this.toastr.error(errorMessage, 'Error');
          }
          this.saving = false;
        }
      });
    }
  }
  
  /**
   * Fetch role details for editing
   * @param roleId The role ID to fetch details for
   */
  fetchRoleForEditing(roleId: string): void {
    this.roleService.getRole(roleId).pipe(
      catchError(this.handleError.bind(this))
    ).subscribe({
      next: (response) => {
        if (response.data) {
          // Update the role in the list with fresh data
          const index = this.roleList.findIndex(r => r.id === roleId);
          if (index !== -1) {
            this.roleList[index] = response.data;
          }
        }
      },
      error: (err) => {
        console.error('Failed to fetch role details for editing:', err);
        // Continue with the existing role data if fetch fails
      }
    });
  }

  /**
   * Open Edit modal
   * @param content modal content
   */
  editModal(role: Role, content: any) {
    
    if (!role || !role.id) {
      this.toastr.error('Invalid role data for editing', 'Error');
      return;
    }
    
    // Fetch the latest role details before editing
    this.roleService.getRole(role.id).pipe(
      catchError(this.handleError.bind(this))
    ).subscribe({
      next: (response) => {
        const latestRole = response.data;
        if (latestRole) {
          // Store original role data for comparison
          this.originalRoleData = { ...latestRole };
          
          // Convert RolePermission[] to string[] for the form
          const permissionIds = Array.isArray(latestRole.permissions) 
            ? latestRole.permissions.map(p => p.id || p.permission_id)
            : [];
          
          // Prepare form data
          const formData = {
            id: latestRole.id ? latestRole.id.toString() : null,
            name: latestRole.name || '',
            permissions: permissionIds
          };
          
          // Patch the form with the latest data
          this.roleForm.patchValue(formData);
          // Open the modal after patching
          this.isEditMode = true;
          this.submitted = false;
          this.error = null;
          this.roleForm.markAsPristine();
          // Ensure permissions are loaded before opening modal
          if (this.permissionCategories.length === 0) {
            this.fetchPermissions();
            setTimeout(() => {
              this.modalRef = this.modalService.show(content, { class: 'modal-lg' });
            }, 500);
          } else {
            this.modalRef = this.modalService.show(content, { class: 'modal-lg' });
          }
        }
      },
      error: (err) => {
        this.toastr.error('Failed to fetch role details for editing.', 'Error');
      }
    });
  }

  // pagination
  pageChanged(event: any): void {
    this.fetchRoles(event.page);
  }

  // Get permission name by ID
  getPermissionName(permissionId: string): string {
    if (!permissionId) return 'Unknown Permission';
    const permission = this.allPermissions.find(p => p.id === permissionId);
    return permission ? permission.label : 'Unknown Permission';
  }

  // Get permission category by permission ID
  getPermissionCategory(permissionId: string): string {
    const permission = this.allPermissions.find(p => p.id === permissionId);
    if (!permission) return 'Unknown';
    
    const category = this.permissionCategories.find(cat => cat.id === permission.p_category_id);
    return category ? category.name : 'Unknown Category';
  }

  // Get selected permissions count
  getSelectedPermissionsCount(): number {
    const selectedPermissions = this.roleForm.get('permissions')?.value;
    
    // Ensure selectedPermissions is an array
    if (!Array.isArray(selectedPermissions)) {
      return 0;
    }
    
    return selectedPermissions.length;
  }

  // Get selected permissions count for a specific category
  getSelectedPermissionsInCategory(categoryId: string): number {
    if (!categoryId) return 0;
    const selectedPermissions = this.roleForm.get('permissions')?.value;
    
    // Ensure selectedPermissions is an array
    if (!Array.isArray(selectedPermissions)) {
      return 0;
    }
    
    const categoryPermissions = this.allPermissions.filter(p => p.p_category_id === categoryId);
    return selectedPermissions.filter((permissionId: string) => 
      categoryPermissions.some(p => p.id === permissionId)
    ).length;
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

  // Check if a permission is selected
  isPermissionSelected(permissionId: string): boolean {
    const selectedPermissions = this.roleForm.get('permissions')?.value || [];
    return Array.isArray(selectedPermissions) && selectedPermissions.includes(permissionId);
  }

  // Handle permission checkbox change
  onPermissionChange(event: any, permissionId: string) {
    const permissionsControl = this.roleForm.get('permissions');
    if (!permissionsControl) return;

    const currentPermissions = permissionsControl.value || [];
    const permissionsArray = Array.isArray(currentPermissions) ? currentPermissions : [];

    if (event.target.checked) {
      // Add permission if not already selected
      if (!permissionsArray.includes(permissionId)) {
        permissionsArray.push(permissionId);
      }
    } else {
      // Remove permission if selected
      const index = permissionsArray.indexOf(permissionId);
      if (index > -1) {
        permissionsArray.splice(index, 1);
      }
    }

    permissionsControl.setValue(permissionsArray);
  }

  /**
   * Show alert notification
   */
  showAlert(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success', autoDismiss: boolean = true) {
    this.clearAlert(); // Clear any existing alert
    this.alertMessage = message;
    this.alertType = type;
    
    if (autoDismiss) {
      this.alertTimeout = setTimeout(() => {
        this.clearAlert();
      }, 5000); // Auto dismiss after 5 seconds
    }
  }

  /**
   * Clear alert notification
   */
  clearAlert() {
    this.alertMessage = null;
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
      this.alertTimeout = null;
    }
  }

  /**
   * Navigate to role details page
   */
  viewRoleDetails(roleId: string) {
    this.router.navigate(['/access-management/roles', roleId]);
  }

  /**
   * Get a summary of changes made to the role
   */
  getChangesSummary(): { nameChanged: boolean; permissionsChanged: boolean; addedPermissions: string[]; removedPermissions: string[] } {
    if (!this.originalRoleData || !this.roleForm.value) {
      return { nameChanged: false, permissionsChanged: false, addedPermissions: [], removedPermissions: [] };
    }
    
    const currentData = this.roleForm.value;
    const originalData = this.originalRoleData;
    
    const nameChanged = currentData.name !== originalData.name;
    
    const currentPermissions = Array.isArray(currentData.permissions) ? currentData.permissions : [];
    
    // Convert original permissions from RolePermission[] to string[]
    const originalPermissionIds = Array.isArray(originalData.permissions) 
      ? originalData.permissions.map(p => {
          // Handle both string[] and RolePermission[] cases
          if (typeof p === 'string') {
            return p;
          } else if (p && typeof p === 'object') {
            const permission = p as any;
            return permission.id || permission.permission_id;
          }
          return null;
        }).filter(id => id !== null)
      : [];
    
    const currentSet = new Set(currentPermissions);
    const originalSet = new Set(originalPermissionIds);
    
    const addedPermissions = currentPermissions.filter(p => !originalSet.has(p));
    const removedPermissions = originalPermissionIds.filter(p => !currentSet.has(p));
    
    const permissionsChanged = addedPermissions.length > 0 || removedPermissions.length > 0;
    
    return {
      nameChanged,
      permissionsChanged,
      addedPermissions,
      removedPermissions
    };
  }

  /**
   * Show changes summary before saving
   */
  showChangesSummary(): void {
    const changes = this.getChangesSummary();
    
    if (!changes.nameChanged && !changes.permissionsChanged) {
      this.toastr.info('No changes detected. Role remains unchanged.', 'Info');
      return;
    }
    
    let message = 'Changes to be saved:\n';
    
    if (changes.nameChanged) {
      message += `• Role name will be updated\n`;
    }
    
    if (changes.permissionsChanged) {
      if (changes.addedPermissions.length > 0) {
        message += `• ${changes.addedPermissions.length} permission(s) will be added\n`;
      }
      if (changes.removedPermissions.length > 0) {
        message += `• ${changes.removedPermissions.length} permission(s) will be removed\n`;
      }
    }
    
    this.toastr.info(message, 'Changes Summary');
  }

  /**
   * Check if a role name already exists (excluding current role in edit mode)
   * @param name The role name to check
   * @returns boolean indicating if the name already exists
   */
  isRoleNameTaken(name: string): boolean {
    if (!name || !name.trim()) return false;
    
    const trimmedName = name.trim().toLowerCase();
    const existingRole = this.roleList.find(role => 
      role.name.toLowerCase() === trimmedName && 
      role.id !== this.roleForm.get('id')?.value
    );
    
    return !!existingRole;
  }

  /**
   * Validate role name uniqueness
   * @param name The role name to validate
   * @returns string | null - error message if name is taken, null if valid
   */
  validateRoleName(name: string): string | null {
    if (this.isRoleNameTaken(name)) {
      return 'Role name already exists. Please choose a different name.';
    }
    return null;
  }
} 