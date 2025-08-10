import { Component, ViewChild, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsModalService, BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { SkeletonComponent } from 'src/app/shared/ui/skeleton/skeleton.component';
import { TableSkeletonComponent } from 'src/app/shared/ui/skeleton/table-skeleton.component';
import { DepartmentService } from 'src/app/core/services/department.service';
import { Department } from 'src/app/core/models/department.model';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrl: './department.component.scss'
})
/**
 *  Department component
 */
export class DepartmentComponent {
  enditem: any;
  modalRef?: BsModalRef;
  masterSelected!: boolean;
  // bread crumb items
  breadCrumbItems: Array<{}>;
  term: any;
  orderlist: Department[] = [];
  ordersForm!: UntypedFormGroup;
  submitted = false;
  content?: any;
  orderes?: any;
  total: Observable<number>;
  page: any = 1;
  deletId: any;
  Allorderlist: Department[] = [];
  isLoading: boolean = true; // Loading state
  saving: boolean = false;
  @ViewChild('showModal', { static: false }) showModal?: ModalDirective;
  @ViewChild('removeItemModal', { static: false }) removeItemModal?: ModalDirective;
  selectedDepartment: Department | null = null;

  constructor(
    private modalService: BsModalService,
    private formBuilder: UntypedFormBuilder,
    private datePipe: DatePipe,
    private store: Store,
    private departmentService: DepartmentService
  ) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Organization Management' }, { label: 'Departments', active: true }];

    /**
     * Form Validation - Updated for Department Management
     */
    this.ordersForm = this.formBuilder.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      location: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      manager: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      budget: ['', [Validators.required, Validators.min(0)]],
      status: ['active', [Validators.required]]
    });

    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.departmentService.getDepartments().subscribe({
      next: (response: any) => {
        this.orderlist = response.data;
        this.Allorderlist = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching departments:', error);
        this.isLoading = false;
      }
    });
  }

  openViewModal(content: any, department: Department) {
    this.selectedDepartment = department;
    this.modalRef = this.modalService.show(content, { class: 'modal-lg' });
  }

  // The master checkbox will check/ uncheck all items
  checkUncheckAll(ev: any) {
    this.orderlist.forEach((x: any) => (x.checked = ev.target.checked));
  }

  checkedValGet: any[] = [];
  // Delete Data
  deleteData(id: any) {
    if (id) {
      document.getElementById('d_' + id)?.remove();
    } else {
      this.checkedValGet?.forEach((item: any) => {
        document.getElementById('d_' + item)?.remove();
      });
    }
  }

  // Delete Data
  confirm(id: any) {
    this.deletId = id;
    this.selectedDepartment = this.orderlist.find(d => d.id === id) || null;
    this.removeItemModal?.show();
  }
  // delete order
  deleteOrder() {
    if (!this.deletId) return;
    this.departmentService.deleteDepartment(this.deletId).subscribe({
      next: () => {
        this.loadData(); // Refresh the list
        this.removeItemModal?.hide();
        Swal.fire({
          title: 'Deleted!',
          text: 'Department has been deleted.',
          icon: 'success',
          confirmButtonColor: '#34c38f',
        });
      },
      error: (err) => {
        console.error('Delete department error:', err);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete department. Please try again.',
          icon: 'error',
          confirmButtonColor: '#f46a6a',
        });
      }
    });
  }

  // fiter job
  searchOrder() {
    if (this.term) {
      this.orderlist = this.Allorderlist.filter((data: Department) => {
        return data.name.toLowerCase().includes(this.term.toLowerCase()) ||
               data.description.toLowerCase().includes(this.term.toLowerCase());
      });
    } else {
      this.orderlist = this.Allorderlist;
    }
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(isEdit: boolean = false, department?: Department) {
    this.submitted = false;
    this.ordersForm.reset();
    
    if (isEdit && department) {
      this.ordersForm.patchValue(department);
    }
    
    this.showModal?.show();
  }
  /**
   * Form data get
   */
  get form() {
    return this.ordersForm.controls;
  }

  /**
  * Save user
  */
  saveUser() {
    this.submitted = true;
    if (this.ordersForm.invalid) {
      return;
    }
    
    this.saving = true;
    const formValue = this.ordersForm.value;
    
    if (formValue.id) {
      // Update existing department
      this.departmentService.updateDepartment(formValue.id, formValue).subscribe({
        next: () => {
          this.loadData();
          this.showModal?.hide();
          this.ordersForm.reset();
          this.submitted = false;
          this.saving = false;
          Swal.fire({
            title: 'Updated!',
            text: 'Department has been updated.',
            icon: 'success',
            confirmButtonColor: '#34c38f',
          });
        },
        error: (err) => {
          console.error('Update department error:', err);
          this.saving = false;
          Swal.fire({
            title: 'Error!',
            text: 'Failed to update department. Please try again.',
            icon: 'error',
            confirmButtonColor: '#f46a6a',
          });
        }
      });
    } else {
      // Create new department
      this.departmentService.createDepartment(formValue).subscribe({
        next: () => {
          this.loadData();
          this.showModal?.hide();
          this.ordersForm.reset();
          this.submitted = false;
          this.saving = false;
          Swal.fire({
            title: 'Created!',
            text: 'Department has been created.',
            icon: 'success',
            confirmButtonColor: '#34c38f',
          });
        },
        error: (err) => {
          console.error('Create department error:', err);
          this.saving = false;
          Swal.fire({
            title: 'Error!',
            text: 'Failed to create department. Please try again.',
            icon: 'error',
            confirmButtonColor: '#f46a6a',
          });
        }
      });
    }
  }

  /**
   * Open Edit modal
   * @param content modal content
   */
  editModal(department: Department) {
    this.openModal(true, department);
  }

  // pagination
  pagechanged(event: any): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.orderlist = this.Allorderlist.slice(startItem, endItem);
  }
}
