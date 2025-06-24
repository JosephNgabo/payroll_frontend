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

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private store: Store,
    private userService: UserService
  ) {}

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
    this.modalRef = this.modalService.show(this.removeItemModal, { class: 'modal-md' });
  }
  // delete order
  deleteUser() {
    if (!this.deletId) return;
    this.userService.deleteUser(this.deletId).subscribe({
      next: () => {
        this.fetchUsers(); // Refresh the list
        this.modalRef?.hide();
      },
      error: (err) => {
        console.error('Delete user error:', err);
        // Optionally show an error message to the user
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
    this.error = null; // Clear any previous errors
    this.ordersForm.reset();
    this.originalUserData = null; // Clear original user data for new user creation
    
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
    console.log('saveUser called. userId:', this.ordersForm.get('id')?.value, 'isEditMode:', this.isEditMode);
    console.log('=== SAVE USER DEBUG ===');
    this.submitted = true;
    if (this.ordersForm.invalid) {
      this.ordersForm.markAllAsTouched();
      console.log('Form is invalid, returning early');
      return;
    }
    
    const formValue = this.ordersForm.value;
    const userId = this.ordersForm.get('id')?.value;
    
    console.log('Full form value:', formValue); // Debug log
    console.log('User ID from form:', userId, 'Type:', typeof userId); // Debug log
    console.log('User ID as number:', Number(userId)); // Debug log
    console.log('Is user ID truthy?', !!userId); // Debug log
    console.log('Is user ID NaN?', isNaN(Number(userId))); // Debug log
    
    if (userId && !isNaN(Number(userId))) {
      // Update existing user - exclude email and username
      const updatePayload: Partial<UpdateUserPayload> = {
        firstname: formValue.firstname,
        lastname: formValue.lastname,
        phone: formValue.phone,
        title: formValue.title,
        language: formValue.language,
        is_active: true,
        user_profile: 'user'
      };
      if (formValue.password) {
        updatePayload.password = formValue.password;
      }
      this.userService.updateUser(Number(userId), updatePayload as UpdateUserPayload).subscribe({
        next: (updatedUser) => {
          this.fetchUsers();
          this.modalRef?.hide();
          this.ordersForm.reset();
          this.submitted = false;
        },
        error: (err) => {
          console.log('=== UPDATE ERROR DEBUG ===');
          console.log('Error response:', err); // Debug log
          console.log('Error status:', err.status); // Debug log
          console.log('Error message:', err.message); // Debug log
          console.log('Error URL:', err.url); // Debug log
          
          if (err.status === 422 && err.error && err.error.errors) {
            const errors = err.error.errors;
            console.log('Validation errors:', errors); // Debug log
            
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
                console.log(`Set error on ${field}:`, errorMessage); // Debug log
              }
            });
            
            // Set a generic error message
            this.error = err.error.message || 'Please correct the validation errors below.';
          } else {
            this.error = err.error?.message || err.message || 'Failed to update user.';
          }
          console.log('=== END UPDATE ERROR DEBUG ===');
        }
      });
    } else {
      console.log('Creating new user - include email and username');
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
      
      console.log('Create payload:', createPayload); // Debug log
      
      this.userService.createUser(createPayload).subscribe({
        next: (newUser) => {
          this.fetchUsers();
          this.modalRef?.hide();
          this.ordersForm.reset();
          this.submitted = false;
        },
        error: (err) => {
          console.log('=== UPDATE ERROR DEBUG ===');
          console.log('Error response:', err); // Debug log
          console.log('Error status:', err.status); // Debug log
          console.log('Error message:', err.message); // Debug log
          console.log('Error URL:', err.url); // Debug log
          
          if (err.status === 422 && err.error && err.error.errors) {
            const errors = err.error.errors;
            console.log('Validation errors:', errors); // Debug log
            
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
                console.log(`Set error on ${field}:`, errorMessage); // Debug log
              }
            });
            
            // Set a generic error message
            this.error = err.error.message || 'Please correct the validation errors below.';
          } else {
            this.error = err.error?.message || err.message || 'Failed to create user.';
          }
          console.log('=== END UPDATE ERROR DEBUG ===');
        }
      });
    }
  }
  /**
   * Open Edit modal
   * @param content modal content
   */
  editModal(user: UserDetail, content: any) {
    console.log('=== EDIT MODAL DEBUG ===');
    console.log('Editing user:', user); // Debug log
    console.log('User ID type:', typeof user.id, 'Value:', user.id); // Debug log
    console.log('User ID as number:', Number(user.id)); // Debug log
    
    this.isEditMode = true;
    this.submitted = false;
    this.error = null; // Clear any previous errors
    this.ordersForm.reset();
    
    // Store original user data for comparison
    this.originalUserData = { ...user };
    console.log('Original user data stored:', this.originalUserData);
    
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
    console.log('Form data to patch:', formData); // Debug log
    this.ordersForm.patchValue(formData);
    
    // Verify ID was set correctly
    console.log('Form ID value after patch:', this.ordersForm.get('id')?.value); // Debug log
    console.log('Form ID type after patch:', typeof this.ordersForm.get('id')?.value); // Debug log
    console.log('Form ID as number after patch:', Number(this.ordersForm.get('id')?.value)); // Debug log
    console.log('=== END EDIT MODAL DEBUG ===');
    
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
    this.userService.updateUserStatus(userId, this.statusToUpdate).subscribe({
      next: () => {
        // Update local userList for instant feedback
        const idx = this.userList.findIndex(u => u.id === this.selectedUser!.id);
        if (idx !== -1) {
          this.userList[idx].is_active = this.statusToUpdate;
        }
        this.fetchUsers(); // Still fetch to ensure data is in sync
      },
      error: (err) => {
        console.error('Failed to update user status', err);
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
    const payload = {
      username: this.selectedUser.username,
      password: this.passwordForm.value.newPassword
    };
    this.userService.resetPassword(payload).subscribe({
      next: () => {
        modal.close();
        // Optionally show a success message
      },
      error: (err) => {
        // Optionally show an error message
      }
    });
  }
}
