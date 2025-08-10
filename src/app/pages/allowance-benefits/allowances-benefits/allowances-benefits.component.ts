import { Component, ViewChild, TemplateRef } from '@angular/core';
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
import { AllowanceService } from 'src/app/core/services/allowance.service';
import { Allowance } from 'src/app/core/models/allowance.model';
import { PermissionCheckService } from 'src/app/core/services/permission-check.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-allowances-benefits',
  templateUrl: './allowances-benefits.component.html',
  styleUrl: './allowances-benefits.component.scss'
})

/**
 *  Allowance benefit component
 */
export class AllowancesBenefitsComponent {
  enditem: any;
  modalRef?: BsModalRef;
  masterSelected!: boolean;
  // bread crumb items
  breadCrumbItems: Array<{}>;
  term: any;
  orderlist: Allowance[] = [];
  ordersForm!: UntypedFormGroup;
  submitted = false;
  content?: any;
  orderes?: any;
  total: Observable<number>;
  page: any = 1;
  deletId: any;
  Allorderlist: Allowance[] = [];
  isLoading: boolean = true; // Loading state
  deleteError: string | null = null; // To hold deletion error messages
  @ViewChild('showModal') showModal!: ModalDirective;
  @ViewChild('removeItemModal', { static: false }) removeItemModal?: ModalDirective;
  selectedAllowance: Allowance | null = null;
  saving: boolean = false;

  constructor(
    private modalService: BsModalService,
    private formBuilder: UntypedFormBuilder,
    private datePipe: DatePipe,
    private store: Store,
    private allowanceService: AllowanceService,
    private permissionCheck: PermissionCheckService
  ) { }

  ngOnInit(): void {
    // Initialize the form
    this.ordersForm = this.formBuilder.group({
      id: [null],
      name: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });
    
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.allowanceService.getAllowances().subscribe({
      next: (response: any) => {
        // Ensure response is an array
        if (Array.isArray(response)) {
          this.orderlist = response;
          this.Allorderlist = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          this.orderlist = response.data;
          this.Allorderlist = response.data;
        } else {
          this.orderlist = [];
          this.Allorderlist = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching allowances:', error);
        this.orderlist = [];
        this.Allorderlist = [];
        this.isLoading = false;
      }
    });
  }

  openViewModal(content: any, allowance: Allowance) {
    this.selectedAllowance = allowance;
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
      document.getElementById('a_' + id)?.remove();
    } else {
      this.checkedValGet?.forEach((item: any) => {
        document.getElementById('a_' + item)?.remove();
      });
    }
  }

  // Delete Data
  confirm(id: any) {
    this.deletId = id;
    this.selectedAllowance = this.orderlist.find(a => a.id === id) || null;
    this.removeItemModal?.show();
  }
  // delete order
  deleteOrder() {
    if (!this.deletId) return;
    this.allowanceService.deleteAllowance(this.deletId).subscribe({
      next: () => {
        this.loadData(); // Refresh the list
        this.modalRef?.hide();
        Swal.fire({
          title: 'Deleted!',
          text: 'Allowance has been deleted.',
          icon: 'success',
          confirmButtonColor: '#34c38f',
        });
      },
      error: (err) => {
        console.error('Delete allowance error:', err);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete allowance. Please try again.',
          icon: 'error',
          confirmButtonColor: '#f46a6a',
        });
      }
    });
  }

  // fiter job
  searchOrder() {
    if (this.term) {
      this.orderlist = this.Allorderlist.filter((data: Allowance) => {
        return data.name.toLowerCase().includes(this.term.toLowerCase()) ||
               data.description.toLowerCase().includes(this.term.toLowerCase()) ||
               data.taxValue.toString().includes(this.term);
      });
    } else {
      this.orderlist = this.Allorderlist;
    }
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.submitted = false;
    this.ordersForm.reset();
    this.modalRef = this.modalService.show(content, { class: 'modal-md' });
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
      // Update existing allowance
      this.allowanceService.updateAllowance(formValue.id, formValue).subscribe({
        next: () => {
          this.loadData();
          this.modalRef?.hide();
          this.ordersForm.reset();
          this.submitted = false;
          this.saving = false;
          Swal.fire({
            title: 'Updated!',
            text: 'Allowance has been updated.',
            icon: 'success',
            confirmButtonColor: '#34c38f',
          });
        },
        error: (err) => {
          console.error('Update allowance error:', err);
          this.saving = false;
          Swal.fire({
            title: 'Error!',
            text: 'Failed to update allowance. Please try again.',
            icon: 'error',
            confirmButtonColor: '#f46a6a',
          });
        }
      });
    } else {
      // Create new allowance
      this.allowanceService.createAllowance(formValue).subscribe({
        next: () => {
          this.loadData();
          this.modalRef?.hide();
          this.ordersForm.reset();
          this.submitted = false;
          this.saving = false;
          Swal.fire({
            title: 'Created!',
            text: 'Allowance has been created.',
            icon: 'success',
            confirmButtonColor: '#34c38f',
          });
        },
        error: (err) => {
          console.error('Create allowance error:', err);
          this.saving = false;
          Swal.fire({
            title: 'Error!',
            text: 'Failed to create allowance. Please try again.',
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
  editModal(index: number) {
    this.submitted = false;
    this.ordersForm.patchValue(this.orderlist[index]);
    this.showModal.show();
  }

  // pagination
  pagechanged(event: any): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.orderlist = this.Allorderlist.slice(startItem, endItem);
  }
}
