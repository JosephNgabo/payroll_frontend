import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsModalService, BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UserService, CreateUserPayload } from 'src/app/core/services/user.service';
import { UserDetail, PaginatedUsersResponse } from 'src/app/core/models/user.model';

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

  // UI
  breadCrumbItems: Array<{}>;
  term: any;
  masterSelected!: boolean;
  
  @ViewChild('showModal', { static: false }) showModal?: ModalDirective;
  @ViewChild('removeItemModal', { static: false }) removeItemModal?: ModalDirective;

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
    this.removeItemModal?.show();
  }
  // delete order
  deleteUser() {
    // Here you would call userService.deleteUser(this.deletId)
    this.userList = this.userList.filter((item: any) => item.id !== this.deletId);
    this.removeItemModal?.hide();
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
    if (this.ordersForm.get('id')?.value) {
      // Here you would call userService.updateUser(this.ordersForm.value)
      const updatedData = this.ordersForm.value;
      const index = this.userList.findIndex((item: any) => item.id === updatedData.id);
      if (index !== -1) {
        this.userList[index] = { ...this.userList[index], ...updatedData };
      }
    } else {
      const formValue = this.ordersForm.value;
      const payload: CreateUserPayload = {
        firstname: formValue.firstname,
        lastname: formValue.lastname,
        username: formValue.username,
        phone: formValue.phone,
        title: formValue.title,
        language: formValue.language,
        email: formValue.email,
        password: formValue.password,
        is_active: 1,
        user_profile: 'user'
      };
      this.userService.createUser(payload).subscribe({
        next: (newUser) => {
          this.fetchUsers();
          this.modalRef?.hide();
          this.ordersForm.reset();
          this.submitted = false;
        },
        error: (err) => {
          console.log('Error response:', err); // Debug log
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
        }
      });
    }
  }
  /**
   * Open Edit modal
   * @param content modal content
   */
  editModal(user: UserDetail) {
    this.isEditMode = true;
    this.submitted = false;
    this.ordersForm.reset();
    this.ordersForm.get('password')?.clearValidators();
    this.ordersForm.get('password')?.updateValueAndValidity();
    this.showModal?.show();
    this.ordersForm.patchValue(user as any);
  }

  // pagination
  pageChanged(event: any): void {
    this.fetchUsers(event.page);
  }
}
