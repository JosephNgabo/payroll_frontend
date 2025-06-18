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
  orderlist: any;
  ordersForm!: UntypedFormGroup;
  submitted = false;
  content?: any;
  orderes?: any;
  total: Observable<number>;
  page: any = 1;
  deletId: any;
  Allorderlist: any;
  isLoading: boolean = true; // Loading state
  @ViewChild('showModal', { static: false }) showModal?: ModalDirective;
  @ViewChild('removeItemModal', { static: false }) removeItemModal?: ModalDirective;

  constructor(
    private modalService: BsModalService,
    private formBuilder: UntypedFormBuilder,
    private datePipe: DatePipe,
    private store: Store
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

    // Simulate loading delay
    this.loadData();
  }

  /**
   * Load data with loading state
   */
  loadData() {
    this.isLoading = true;
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock data for testing - Updated for Department Management
      this.orderlist = [
        {
          id: 'DEPT001',
          name: 'Information Technology',
          description: 'Handles all IT infrastructure, software development, and technical support'
        },
        {
          id: 'DEPT002',
          name: 'Human Resources',
          description: 'Manages employee relations, recruitment, training, and HR policies'
        },
        {
          id: 'DEPT003',
          name: 'Finance',
          description: 'Handles financial planning, accounting, budgeting, and financial reporting'
        },
        {
          id: 'DEPT004',
          name: 'Marketing',
          description: 'Manages brand promotion, advertising, market research, and customer engagement'
        },
        {
          id: 'DEPT005',
          name: 'Operations',
          description: 'Oversees daily business operations, process improvement, and quality management'
        }
      ];
      this.Allorderlist = this.orderlist;
      this.isLoading = false;
    }, 1500); // 1.5 second delay to show skeleton
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
    // Here you would typically call your API to delete the department
    this.orderlist = this.orderlist.filter((item: any) => item.id !== this.deletId);
    this.removeItemModal?.hide();
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
  * Save department
  */
  saveUser() {
    this.submitted = true;
    if (this.ordersForm.valid) {
      if (this.ordersForm.get('id')?.value) {
        // Update existing department
        const updatedData = this.ordersForm.value;
        const index = this.orderlist.findIndex((item: any) => item.id === updatedData.id);
        if (index !== -1) {
          this.orderlist[index] = updatedData;
        }
      } else {
        // Add new department
        const newId = 'DEPT' + (this.orderlist.length + 1).toString().padStart(3, '0');
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
    modelTitle.innerHTML = 'Edit Department';
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
