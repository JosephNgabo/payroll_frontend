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
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})

/**
 *  users component
 */
export class UsersComponent {
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
    this.breadCrumbItems = [{ label: 'Access Management' }, { label: 'Users', active: true }];

    /**
     * Form Validation - Updated to match backend requirements
     */
    this.ordersForm = this.formBuilder.group({
      id: [''],
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      phone: ['', [Validators.required]],
      title: ['', [Validators.required]],
      language: ['', [Validators.required, Validators.pattern('^(en|fr)$')]],
      email: ['', [Validators.required, Validators.email]]
    });

    // Mock data for testing - Updated to match new structure
    this.orderlist = [
      {
        id: 'EMP001',
        firstname: 'Mugisha',
        lastname: 'Benjamin',
        username: 'mugisha_ben',
        phone: '+250789123456',
        title: 'Software Developer',
        language: 'en',
        email: 'benjamin@gmail.com'
      },
      {
        id: 'EMP002',
        firstname: 'Ishimwe',
        lastname: 'Nadia',
        username: 'ishimwe_nadia',
        phone: '+250789123457',
        title: 'HR Manager',
        language: 'en',
        email: 'nadia@gmail.com'
      },
      {
        id: 'EMP003',
        firstname: 'Muneza',
        lastname: 'Jackson',
        username: 'muneza_jack',
        phone: '+250789123458',
        title: 'Finance Analyst',
        language: 'fr',
        email: 'jackson@gmail.com'
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
    // Here you would typically call your API to delete the user
    this.orderlist = this.orderlist.filter((item: any) => item.id !== this.deletId);
    this.removeItemModal?.hide();
  }

  // fiter job - Updated to search in new fields
  searchOrder() {
    if (this.term) {
      this.orderlist = this.Allorderlist.filter((data: any) => {
        return data.firstname.toLowerCase().includes(this.term.toLowerCase()) ||
               data.lastname.toLowerCase().includes(this.term.toLowerCase()) ||
               data.username.toLowerCase().includes(this.term.toLowerCase()) ||
               data.email.toLowerCase().includes(this.term.toLowerCase()) ||
               data.title.toLowerCase().includes(this.term.toLowerCase());
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
  * Save user - Updated to handle new fields
  */
  saveUser() {
    this.submitted = true;
    if (this.ordersForm.valid) {
      if (this.ordersForm.get('id')?.value) {
        // Update existing user
        const updatedData = this.ordersForm.value;
        const index = this.orderlist.findIndex((item: any) => item.id === updatedData.id);
        if (index !== -1) {
          this.orderlist[index] = updatedData;
        }
      } else {
        // Add new user
        const newId = 'EMP' + (this.orderlist.length + 1).toString().padStart(3, '0');
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
    modelTitle.innerHTML = 'Edit User';
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
