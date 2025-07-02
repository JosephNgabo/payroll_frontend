import { Component, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsModalService, BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';
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
      id: [''],
      name: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });

    this.loadData();
  }

  /**
   * Load data with loading state
   */
  loadData() {
    this.isLoading = true;
    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        this.orderlist = departments;
        this.Allorderlist = departments;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Open modal
   * @param content modal content
   */
  openViewModal(content: any, department: Department) {
    this.selectedDepartment = department;
    this.modalRef = this.modalService.show(content);
  }

  // The master checkbox will check/ uncheck all items
  checkUncheckAll(ev: any) {
    this.orderes?.forEach((x: { state: any; }) => x.state = ev.target.checked);
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
  confirm(id: any) {
    this.deletId = id;
    this.removeItemModal?.show();
  }
  // delete order
  deleteOrder() {
    console.log('Delete order called for ID:', this.deletId);
    if (!this.deletId) return;
    this.departmentService.deleteDepartment(this.deletId).subscribe({
      next: () => {
        this.loadData();
        this.removeItemModal?.hide();
      },
      error: () => {
        // Optionally handle error
      }
    });
  }

  // fiter job - Updated to search in department fields
  searchOrder() {
    if (this.term) {
      this.orderlist = this.Allorderlist.filter((data: any) => {
        return data.name.toLowerCase().includes(this.term.toLowerCase()) ||
               data.description.toLowerCase().includes(this.term.toLowerCase());
      });
    } else {
      this.orderlist = this.Allorderlist;
    }
  }

  /**
   * Open modal
   * @param isEdit boolean indicating if it's an edit operation
   * @param department department to be edited or null for a new department
   */
  openModal(isEdit: boolean = false, department?: Department) {
    this.submitted = false;
    if (isEdit && department) {
      this.selectedDepartment = department;
      this.ordersForm.patchValue({
        id: department.id,
        name: department.name,
        description: department.description
      });
      setTimeout(() => {
        const modelTitle = document.querySelector('.modal-title') as HTMLAreaElement;
        if (modelTitle) modelTitle.innerHTML = 'Edit Department';
        const updateBtn = document.getElementById('addNewUser-btn') as HTMLAreaElement;
        if (updateBtn) updateBtn.innerHTML = 'Update';
      });
    } else {
      this.selectedDepartment = null;
      this.ordersForm.reset();
      setTimeout(() => {
        const modelTitle = document.querySelector('.modal-title') as HTMLAreaElement;
        if (modelTitle) modelTitle.innerHTML = 'Add New Department';
        const updateBtn = document.getElementById('addNewUser-btn') as HTMLAreaElement;
        if (updateBtn) updateBtn.innerHTML = 'Save';
      });
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
  * Save department
  */
  saveUser() {
    this.submitted = true;
    this.saving = true;
    if (this.ordersForm.invalid) {
      setTimeout(() => {
        this.saving = false;
      }, 800); // Show spinner briefly even if invalid
      return;
    }
    const formValue = this.ordersForm.value;
    if (formValue.id) {
      this.departmentService.updateDepartment(formValue.id, {
        name: formValue.name,
        description: formValue.description
      }).subscribe({
        next: () => {
          this.loadData();
          this.showModal?.hide();
          this.ordersForm.reset();
          this.submitted = false;
          this.saving = false;
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Department updated successfully',
            showConfirmButton: false,
            timer: 1500
          });
        },
        error: () => {
          this.saving = false;
        }
      });
    } else {
      // Add new department
      const payload = {
        departement_name: formValue.name,
        departement_description: formValue.description
      };
      console.log('Payload sent to createDepartment:', payload);
      this.departmentService.createDepartment(payload).subscribe({
        next: () => {
          this.loadData();
          this.showModal?.hide();
          this.ordersForm.reset();
          this.submitted = false;
          this.saving = false;
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Department created successfully',
            showConfirmButton: false,
            timer: 1500
          });
        },
        error: () => {
          this.saving = false;
        }
      });
    }
  }

  /**
   * Open Edit modal
   * @param department department to be edited
   */
  editModal(department: Department) {
    this.openModal(true, department);
  }

  // pagination
  pagechanged(event: any) {
    const startItem = (event.page - 1) * event.itemsPerPage;
    this.enditem = event.page * event.itemsPerPage;
    this.orderlist = this.orderlist.slice(startItem, this.enditem);
  }
}
