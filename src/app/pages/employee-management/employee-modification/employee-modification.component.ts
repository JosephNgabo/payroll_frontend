import { Component, ViewChild, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsModalService, BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { TableSkeletonComponent } from 'src/app/shared/ui/skeleton/table-skeleton.component';
import { NgStepperModule } from 'angular-ng-stepper';
import { CdkStepper } from '@angular/cdk/stepper';

@Component({
  selector: 'app-employee-modification',
  templateUrl: './employee-modification.component.html',
  styleUrl: './employee-modification.component.scss'
})

/**
 *  users component
 */
export class EmployeeModificationComponent implements OnInit {
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
  isLoading = true;
  saving = false;
  countries: string[] = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
    'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
    'Bolivia (Plurinational State of)', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei Darussalam', 'Bulgaria',
    'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad',
    'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia',
    'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea',
    'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia',
    'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras',
    'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran (Islamic Republic of)', 'Iraq', 'Ireland', 'Israel', 'Italy',
    'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Lao People\'s Democratic Republic',
    'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar',
    'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
    'Micronesia (Federated States of)', 'Republic of Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco',
    'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger',
    'Nigeria', 'Democratic People\'s Republic of Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau',
    'State of Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
    'Qatar', 'Romania', 'Russian Federation', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
    'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal',
    'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
    'South Africa', 'Republic of Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden',
    'Switzerland', 'Syrian Arab Republic', 'Taiwan', 'Tajikistan', 'United Republic of Tanzania', 'Thailand',
    'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Türkiye', 'Turkmenistan', 'Tuvalu', 'Uganda',
    'Ukraine', 'United Arab Emirates', 'United Kingdom of Great Britain and Northern Ireland', 'United States of America',
    'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City State', 'Venezuela (Bolivarian Republic of)', 'Viet Nam',
    'Yemen', 'Zambia', 'Zimbabwe'
  ];
  
  basicInfoForm: UntypedFormGroup;
  submittedBasicInfo = false;
  legalInfoForm: UntypedFormGroup;
  submittedLegalInfo = false;
  contactInfoForm: UntypedFormGroup;
  submittedContactInfo = false;
  @ViewChild('cdkStepper') cdkStepper!: CdkStepper;

  constructor(
    private modalService: BsModalService,
    private formBuilder: UntypedFormBuilder,
    private datePipe: DatePipe,
    private store: Store
  ) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Employee Management' }, { label: 'Employee Creation', active: true }];
    setTimeout(() => {
      this.isLoading = false;
    }, 1500); // Simulate loading delay

    /**
     * Form Validation
     */
    this.ordersForm = this.formBuilder.group({
      id: [''],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      department: ['', [Validators.required]],
      role: ['', [Validators.required]],
      status: ['', [Validators.required]]
    });

    this.basicInfoForm = this.formBuilder.group({
      salutation: ['', Validators.required],
      firstName: ['', [Validators.required]],
      lastName: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      nationality: ['', Validators.required],
      countryOfBirth: ['', Validators.required],
      maritalStatus: ['', Validators.required],
      spouseName: [''],
      numberOfChildren: ['', [Validators.required, Validators.min(0)]]
    });

    this.legalInfoForm = this.formBuilder.group({
      documentType: ['', Validators.required],
      documentNumber: ['', Validators.required],
      documentIssueDate: ['', Validators.required],
      documentExpiryDate: ['', Validators.required],
      placeOfIssue: ['', Validators.required],
      rssbNumber: ['', Validators.required],
      highestEducation: ['', Validators.required]
    });

    this.contactInfoForm = this.formBuilder.group({
      personalMobile: ['', Validators.required],
      personalEmail: ['', [Validators.required, Validators.email]],
      homePhone: ['', Validators.required]
    });

    // Example dummy data for demonstration
    this.basicInfoForm.patchValue({
      salutation: 'Mr',
      firstName: 'John',
      lastName: 'Doe',
      gender: 'Male',
      dateOfBirth: '1990-01-01',
      nationality: 'Rwandan',
      countryOfBirth: 'Rwanda',
      maritalStatus: 'single',
      spouseName: '',
      numberOfChildren: 0
    });
    this.legalInfoForm.patchValue({
      documentType: 'ID Card',
      documentNumber: '123456789',
      documentIssueDate: '2010-01-01',
      documentExpiryDate: '2030-01-01',
      placeOfIssue: 'Kigali',
      rssbNumber: 'RSSB123456',
      highestEducation: 'Bachelor'
    });
    this.contactInfoForm.patchValue({
      personalMobile: '+250788123456',
      personalEmail: 'john.doe@example.com',
      homePhone: '+250252123456'
    });

    // Simulate loading delay
    setTimeout(() => {
      // Mock data for testing
      this.orderlist = [
        {
          id: 'EMP001',
          name: 'Mugisha Benjamin',
          email: 'benjamin@gmail.com',
          department: 'IT',
          role: 'Developer',
          status: 'Active'
        },
        {
          id: 'EMP002',
          name: 'Ishimwe Nadia',
          email: 'nadia@gmail.com',
          department: 'HR',
          role: 'Manager',
          status: 'Active'
        },
        {
          id: 'EMP003',
          name: 'Muneza Jackson',
          email: 'jackson@gmail.com',
          department: 'Finance',
          role: 'User',
          status: 'Inactive'
        }
      ];
      this.Allorderlist = this.orderlist;
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
    // Here you would typically call your API to delete the user
    this.orderlist = this.orderlist.filter((item: any) => item.id !== this.deletId);
    this.removeItemModal?.hide();
  }

  // fiter job
  searchOrder() {
    if (this.term) {
      this.orderlist = this.Allorderlist.filter((data: any) => {
        return data.name.toLowerCase().includes(this.term.toLowerCase()) ||
               data.email.toLowerCase().includes(this.term.toLowerCase()) ||
               data.department.toLowerCase().includes(this.term.toLowerCase());
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
  * Save user
  */
  saveUser() {
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
      this.submitted = true;
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

  saveEmployee() {
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      // Optionally show a success message here
    }, 1500); // Simulate save delay
  }

  get basicInfo() {
    return this.basicInfoForm.controls;
  }

  onBasicInfoNext() {
    this.submittedBasicInfo = true;
    if (this.basicInfoForm.invalid) {
      return;
    }
    // Advance the stepper (assume cdkStepper is available via ViewChild)
    if (this.cdkStepper) {
      this.cdkStepper.next();
    }
  }

  get legalInfo() {
    return this.legalInfoForm.controls;
  }

  onLegalInfoNext() {
    this.submittedLegalInfo = true;
    if (this.legalInfoForm.invalid) {
      return;
    }
    if (this.cdkStepper) {
      this.cdkStepper.next();
    }
  }

  get contactInfo() {
    return this.contactInfoForm.controls;
  }

  onContactInfoSubmit() {
    this.submittedContactInfo = true;
    if (this.contactInfoForm.invalid) {
      return;
    }
    this.saveEmployee();
  }
}
