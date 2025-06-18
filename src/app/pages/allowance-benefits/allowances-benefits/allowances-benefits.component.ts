
import { Component, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsModalService, BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';

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
  orderlist: any;
  ordersForm!: UntypedFormGroup;
  submitted = false;
  content?: any;
  orderes?: any;
  total: Observable<number>;
  page: any = 1;
  deletId: any;
  Allorderlist: any;
  @ViewChild('showModal', { static: false }) showModal?: ModalDirective;
  @ViewChild('removeItemModal', { static: false }) removeItemModal?: ModalDirective;

  constructor(
    private modalService: BsModalService,
    private formBuilder: UntypedFormBuilder,
    private datePipe: DatePipe,
    private store: Store
  ) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Payroll Management' }, { label: 'Allowances & Benefits', active: true }];

    /**
     * Form Validation - Updated for Allowances/Benefits
     */
    this.ordersForm = this.formBuilder.group({
      id: [''],
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      taxValue: ['', [Validators.min(0), Validators.max(100)]]
    });

    // Mock data for testing - Updated for Allowances/Benefits
    this.orderlist = [
      {
        id: 'BEN001',
        name: 'Housing Allowance',
        description: 'Monthly housing allowance for employees',
        taxValue: 15
      },
      {
        id: 'BEN002',
        name: 'Transport Allowance',
        description: 'Transportation allowance for commuting',
        taxValue: 10
      },
      {
        id: 'BEN003',
        name: 'Medical Insurance',
        description: 'Comprehensive medical insurance coverage',
        taxValue: 0
      },
      {
        id: 'BEN004',
        name: 'Meal Allowance',
        description: 'Daily meal allowance for employees',
        taxValue: 5
      }
    ];
    this.Allorderlist = this.orderlist;
  }

  /**
   * Open modal
   * @param content modal content
   */
  openViewModal(content: any) {
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
    // Here you would typically call your API to delete the allowance/benefit
    this.orderlist = this.orderlist.filter((item: any) => item.id !== this.deletId);
    this.removeItemModal?.hide();
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
    this.modalRef = this.modalService.show(content, { class: 'modal-md' });
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
    if (this.ordersForm.valid) {
      if (this.ordersForm.get('id')?.value) {
        // Update existing allowance/benefit
        const updatedData = this.ordersForm.value;
        const index = this.orderlist.findIndex((item: any) => item.id === updatedData.id);
        if (index !== -1) {
          this.orderlist[index] = updatedData;
        }
      } else {
        // Add new allowance/benefit
        const newId = 'BEN' + (this.orderlist.length + 1).toString().padStart(3, '0');
        this.ordersForm.controls['id'].setValue(newId);
        const newData = this.ordersForm.value;
        this.orderlist.push(newData);
      }
      this.showModal?.hide();
      this.ordersForm.reset();
      this.submitted = false;
    }
  }
  /**
   * Open Edit modal
   * @param content modal content
   */
  editModal(id: any) {
    this.submitted = false;
    this.showModal?.show();
    const modelTitle = document.querySelector('.modal-title') as HTMLAreaElement;
    modelTitle.innerHTML = 'Edit Allowance/Benefit';
    const updateBtn = document.getElementById('addNewUser-btn') as HTMLAreaElement;
    updateBtn.innerHTML = "Update";
    this.ordersForm.patchValue(this.orderlist[id]);
  }

  // pagination
  pagechanged(event: any) {
    const startItem = (event.page - 1) * event.itemsPerPage;
    this.enditem = event.page * event.itemsPerPage;
    this.orderlist = this.orderlist.slice(startItem, this.enditem);
  }
}
