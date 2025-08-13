import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsModalService, BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UserService, CreateUserPayload, UpdateUserPayload } from 'src/app/core/services/user.service';
import { UserDetail, PaginatedUsersResponse } from 'src/app/core/models/user.model';
import { Observable } from 'rxjs';

// Define a type for the user form for strong typing
interface UserForm {
  id: FormControl<string | null>;
  firstname: FormControl<string>;
  lastname: FormControl<string>;
  username: FormControl<string>;
  phone: FormControl<string>;
  title: FormControl<string>;
  language: FormControl<'en' | 'fr' | ''>;
  email: FormControl<string>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})

/**
 *  users component
 */
export class UsersComponent implements OnInit {
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
  updatingStatus: boolean = false;
  resettingPassword: boolean = false;
  
  // User data
  userList: UserDetail[] = [];
  allUserList: UserDetail[] = [];
  
  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  
  // Modal and form
  modalRef?: BsModalRef;
  ordersForm: FormGroup<UserForm>;
  submitted = false;
  deletId: any;
  isEditMode = false;
  originalUserData: UserDetail | null = null; // Track original user data for comparison

  // UI
  breadCrumbItems: Array<{}>;
  term: any;
  masterSelected!: boolean;
  
  @ViewChild('showModal', { static: false }) showModal?: ModalDirective;
  @ViewChild('removeItemModal') removeItemModal!: TemplateRef<any>;

  selectedUser: UserDetail | null = null;
  statusToUpdate: boolean = true;

  passwordForm: FormGroup = this.formBuilder.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Permission system - using existing p_id approach
  permissions: number[] = [];

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private store: Store,
    private userService: UserService
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

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Access Management' }, { label: 'Users', active: true }];

    this.ordersForm = this.formBuilder.group({
      id: [null],
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      phone: ['', [Validators.required]],
      title: ['', [Validators.required]],
      language: ['', [Validators.required, Validators.pattern('^(en|fr)$')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]] // Not required by default
    }) as FormGroup<UserForm>;

    this.fetchUsers();
  }

  canViewUsers(): boolean {
    return this.permissions.includes(1001); 
  }

  canCreateUser(): boolean {
    return this.permissions.includes(1002); 
  }

  canUpdateUser(): boolean {
    return this.permissions.includes(1003);
  }

  canDeleteUser(): boolean {
    return this.permissions.includes(1004); 
  }

  canResetUserPassword(): boolean {
    return this.permissions.includes(1005);
  }

  canUpdateUserStatus(): boolean {
    return this.permissions.includes(1006);
  }

  hasAnyUserPermission(): boolean {
    return this.permissions.includes(1001);
  }

  fetchUsers(page: number = 1) {
    this.isLoading = true;
    this.error = null;
    this.userService.getUsers(page).subscribe({
      next: (response: PaginatedUsersResponse) => {
        this.userList = response.data;
        this.allUserList = response.data;
        this.currentPage = response.current_page;
        this.totalPages = response.last_page;
        this.totalRecords = response.total;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch users. Please try again later.';
        this.isLoading = false;
        this.showAlert('Failed to fetch users. Please try again later.', 'error');
        console.error(err);
      }
    });
  }

  // The master checkbox will check/ uncheck all items
  checkUncheckAll(ev: any) {
    // This logic needs to be adapted if bulk operations are required
  }

  checkedValGet: any[] = [];
  // Delete Data
  deleteData(id: any) {
    if (id) {
      document.getElementById('u_' + id)?.remove();
    } else {
      this.checkedValGet?.forEach((item: any) => {
        document.getElementById('u_' + item)?.remove();
      });
    }
  }

  // Delete Data
  confirmDelete(id: any) {
    this.deletId = id;
    this.selectedUser = this.userList.find(u => u.id === id) || null;
    this.modalRef = this.modalService.show(this.removeItemModal, { class: 'modal-md' });
  }
  // delete order
  deleteUser() {
    if (!this.deletId) return;
    
    this.deleting = true;
    this.userService.deleteUser(this.deletId).subscribe({
      next: () => {
        this.fetchUsers(); // Refresh the list
        this.modalRef?.hide();
        this.deleting = false;
        this.showAlert('User deleted successfully!', 'success');
      },
      error: (err) => {
        console.error('Delete user error:', err);
        this.deleting = false;
        this.showAlert('Failed to delete user. Please try again.', 'error');
      }
    });
  }

  // fiter job - Updated to search in new fields
  searchUser() {
    if (this.term) {
      this.userList = this.allUserList.filter((data: UserDetail) => {
        return data.firstname.toLowerCase().includes(this.term.toLowerCase()) ||
               data.lastname.toLowerCase().includes(this.term.toLowerCase()) ||
               data.username.toLowerCase().includes(this.term.toLowerCase()) ||
               data.email.toLowerCase().includes(this.term.toLowerCase()) ||
               data.title.toLowerCase().includes(this.term.toLowerCase());
      });
    } else {
      this.userList = this.allUserList;
    }
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.isEditMode = false;
    this.submitted = false;
    this.error = null;
    this.ordersForm.reset();
    this.originalUserData = null;
    
    // Clear any server errors
    Object.keys(this.ordersForm.controls).forEach(key => {
      this.ordersForm.get(key)?.setErrors(null);
    });
    this.ordersForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.ordersForm.get('password')?.updateValueAndValidity();
    this.modalRef = this.modalService.show(content, { class: 'modal-md' });
  }
  /**
   * Form data get
   */
  get form() {
    return this.ordersForm.controls;
  }

  /**
  * Save user - Updated to handle new fields
  */
  saveUser() {
    this.submitted = true;
    if (this.ordersForm.invalid) {
      this.ordersForm.markAllAsTouched();
      return;
    }
    
    this.saving = true;
    this.error = null; // Clear any previous errors
    
    const formValue = this.ordersForm.value;
    const userId = this.ordersForm.get('id')?.value;
    
    if (userId) {
      // Update existing user - include email and username (required by backend)
      const updatePayload: Partial<UpdateUserPayload> = {
        firstname: formValue.firstname,
        lastname: formValue.lastname,
        phone: formValue.phone,
        title: formValue.title,
        language: formValue.language,
        is_active: true,
        user_profile: 'user',
        username: formValue.username, // <-- always include
        email: formValue.email       // <-- always include
      };
      if (formValue.password) {
        updatePayload.password = formValue.password;
      }
      this.userService.updateUser(userId, updatePayload as UpdateUserPayload).subscribe({
        next: (updatedUser) => {
          this.fetchUsers();
          this.modalRef?.hide();
          this.ordersForm.reset();
          this.submitted = false;
          this.saving = false;
          this.showAlert('User updated successfully!', 'success');
        },
        error: (err) => {
          if (err.status === 422 && err.error && err.error.errors) {
            const errors = err.error.errors;
            
            // Clear any existing server errors first
            Object.keys(this.ordersForm.controls).forEach(key => {
              const control = this.ordersForm.get(key);
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
              const control = this.ordersForm.get(field);
              if (control) {
                const currentErrors = control.errors || {};
                const errorMessage = errors[field][0];
                control.setErrors({ ...currentErrors, serverError: errorMessage });
              }
            });
            
            // Set a generic error message
            this.error = err.error.message || 'Please correct the validation errors below.';
            this.showAlert('Please correct the validation errors below.', 'warning', false);
          } else {
            this.error = err.error?.message || err.message || 'Failed to update user.';
            this.showAlert('Failed to update user. Please try again.', 'error');
          }
          this.saving = false;
        }
      });
    } else {
      // Create new user - include email and username
      const createPayload: CreateUserPayload = {
        firstname: formValue.firstname,
        lastname: formValue.lastname,
        username: formValue.username,
        phone: formValue.phone,
        title: formValue.title,
        language: formValue.language,
        email: formValue.email,
        password: formValue.password,
        is_active: true,
        user_profile: 'user'
      };
      
      this.userService.createUser(createPayload).subscribe({
        next: (newUser) => {
          this.fetchUsers();
          this.modalRef?.hide();
          this.ordersForm.reset();
          this.submitted = false;
          this.saving = false;
          this.showAlert('User created successfully!', 'success');
        },
        error: (err) => {
          if (err.status === 422 && err.error && err.error.errors) {
            const errors = err.error.errors;
            
            // Clear any existing server errors first
            Object.keys(this.ordersForm.controls).forEach(key => {
              const control = this.ordersForm.get(key);
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
              const control = this.ordersForm.get(field);
              if (control) {
                const currentErrors = control.errors || {};
                const errorMessage = errors[field][0];
                control.setErrors({ ...currentErrors, serverError: errorMessage });
              }
            });
            
            // Set a generic error message
            this.error = err.error.message || 'Please correct the validation errors below.';
            this.showAlert('Please correct the validation errors below.', 'warning', false);
          } else {
            this.error = err.error?.message || err.message || 'Failed to create user.';
            this.showAlert('Failed to create user. Please try again.', 'error');
          }
          this.saving = false;
        }
      });
    }
  }
  /**
   * Open Edit modal
   * @param content modal content
   */
  editModal(user: UserDetail, content: any) {
    this.isEditMode = true;
    this.submitted = false;
    this.error = null; // Clear any previous errors
    this.ordersForm.reset();
    
    // Store original user data for comparison
    this.originalUserData = { ...user };
    
    // Clear any server errors
    Object.keys(this.ordersForm.controls).forEach(key => {
      this.ordersForm.get(key)?.setErrors(null);
    });
    
    // Remove password requirement for edit mode
    this.ordersForm.get('password')?.clearValidators();
    this.ordersForm.get('password')?.updateValueAndValidity();
    
    // Set form values - ensure ID is properly set
    const formData = {
      id: user.id ? user.id.toString() : null,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      phone: user.phone,
      title: user.title,
      language: user.language as 'en' | 'fr' | '',
      email: user.email,
      password: null // Don't populate password in edit mode
    };
    this.ordersForm.patchValue(formData);
    
    // Show modal
    this.modalRef = this.modalService.show(content, { class: 'modal-md' });
  }

  // pagination
  pageChanged(event: any): void {
    this.fetchUsers(event.page);
  }

  openStatusModal(user: UserDetail, modalTemplate: TemplateRef<any>) {
    this.selectedUser = user;
    this.statusToUpdate = user.is_active;
    this.modalRef = this.modalService.show(modalTemplate, { class: 'modal-md' });
  }

  updateUserStatus() {
    if (!this.selectedUser) return;
    
    const userId = this.selectedUser.id;
    this.updatingStatus = true;
    this.userService.updateUserStatus(userId, this.statusToUpdate).subscribe({
      next: () => {
        // Update local userList for instant feedback
        const idx = this.userList.findIndex(u => u.id === this.selectedUser!.id);
        if (idx !== -1) {
          this.userList[idx].is_active = this.statusToUpdate;
        }
        this.fetchUsers(); // Still fetch to ensure data is in sync
        this.updatingStatus = false;
        this.showAlert(`User status updated to ${this.statusToUpdate ? 'Active' : 'Inactive'}!`, 'success');
      },
      error: (err) => {
        console.error('Failed to update user status', err);
        this.updatingStatus = false;
        this.showAlert('Failed to update user status. Please try again.', 'error');
      }
    });
  }

  openPasswordModal(user: UserDetail, modal: any) {
    this.selectedUser = user;
    this.passwordForm.reset();
    this.modalRef = this.modalService.show(modal, { class: 'modal-md' });
  }

  resetPassword(modal: any) {
    if (this.passwordForm.invalid || !this.selectedUser) return;
    
    this.resettingPassword = true;
    const payload = {
      ...this.selectedUser,
      user_id: this.selectedUser.id,
      password: this.passwordForm.value.newPassword
    };
    this.userService.resetPassword(payload).subscribe({
      next: () => {
        modal.close();
        this.resettingPassword = false;
        this.showAlert('Password reset successfully!', 'success');
      },
      error: (err) => {
        this.resettingPassword = false;
        this.showAlert('Failed to reset password. Please try again.', 'error');
      }
    });
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
}
