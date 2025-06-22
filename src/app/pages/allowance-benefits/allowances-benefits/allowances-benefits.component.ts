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

  constructor(
    private modalService: BsModalService,
    private formBuilder: UntypedFormBuilder,
    private datePipe: DatePipe,
    private store: Store,
    private allowanceService: AllowanceService
  ) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Payroll Management' }, { label: 'Allowances & Benefits', active: true }];

    /**
     * Form Validation - Updated for Allowances/Benefits
     */
    this.ordersForm = this.formBuilder.group({
      id: [''],
      name: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });

    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.allowanceService.getAllowances().subscribe({
      next: (response: any) => {
        this.orderlist = response.data;
        this.Allorderlist = response.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Open modal
   * @param content modal content
   */
  openViewModal(content: any, allowance: Allowance) {
    this.selectedAllowance = allowance;
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
    this.deleteError = null;
    this.removeItemModal?.show();
  }
  // delete order
  deleteOrder() {
    if (!this.deletId) return;
    this.allowanceService.deleteAllowance(this.deletId).subscribe({
      next: () => {
        this.loadData(); // Refresh the list after deletion
        this.removeItemModal?.hide();
      },
      error: (err) => {
        if (err.status === 404 && err.error && err.error.message) {
          this.deleteError = err.error.message;
        } else {
          this.deleteError = 'An unexpected error occurred while deleting the allowance.';
        }
        console.error('Delete allowance error:', err);
      }
    });
  }

  // fiter job - Updated to search in allowance/benefit fields
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
   * @param content modal content
   */
  openModal(content: any) {
    this.submitted = false;
    this.showModal.show();
  }
  /**
   * Form data get
   */
  get form() {
    return this.ordersForm.controls;
  }

  /**
  * Save allowance/benefit
  */
  saveUser() {
    this.submitted = true;
    if (this.ordersForm.invalid) return;

    const formValue = this.ordersForm.value;
    if (formValue.id) {
      // Update existing allowance
      this.allowanceService.updateAllowance(formValue.id, {
        name: formValue.name,
        description: formValue.description
      }).subscribe({
        next: (updated) => {
          this.loadData(); // Refresh list
          this.showModal.hide();
          this.ordersForm.reset();
          this.submitted = false;
        },
        error: (err) => {
          // Handle error, show message if needed
        }
      });
    } else {
      // Add new allowance/benefit
      this.allowanceService.createAllowance({
        name: formValue.name,
        description: formValue.description
      }).subscribe({
        next: (created) => {
          this.loadData(); // Refresh list
          this.showModal.hide();
          this.ordersForm.reset();
          this.submitted = false;
        },
        error: (err) => {
          // Handle error, e.g., show validation errors
          console.error('Create allowance error:', err);
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
    const allowance = this.orderlist[index];
    this.ordersForm.patchValue({
      id: allowance.id,
      name: allowance.name,
      description: allowance.description
      // taxValue: allowance.taxValue (add later if needed)
    });
    this.showModal.show();
    // Optionally update modal title/button text for edit mode
  }

  // pagination
  pagechanged(event: any) {
    const startItem = (event.page - 1) * event.itemsPerPage;
    this.enditem = event.page * event.itemsPerPage;
    this.orderlist = this.orderlist.slice(startItem, this.enditem);
  }
}
