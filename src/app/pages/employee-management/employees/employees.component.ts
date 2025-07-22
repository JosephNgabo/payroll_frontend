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
import { EmployeeInformationService } from 'src/app/core/services/employee-information.service';
import { EmployeeInformation } from 'src/app/core/models/employee-information.model';
import { DepartmentService } from 'src/app/core/services/department.service';
import { Department } from 'src/app/core/models/department.model';
import { EmployeeContractService } from 'src/app/core/services/employee-contract.service';
import { EmployeeContract } from 'src/app/core/models/employee-contract.model';
import { AllowanceService } from 'src/app/core/services/allowance.service';
import { Allowance } from 'src/app/core/models/allowance.model';
import { EmployeeAllowanceService } from 'src/app/core/services/employee-allowance.service';
import { EmployeeAllowance } from 'src/app/core/models/employee-allowance.model';
import { DeductionsService } from 'src/app/core/services/deductions.service';
import { RssbDeduction } from 'src/app/core/models/rssb-deduction.model';
import { EmployeeRssbContributionService } from 'src/app/core/services/employee-rssb-contribution.service';
import { EmployeeRssbContribution } from 'src/app/core/models/employee-rssb-contribution.model';
import { OtherDeductionsService } from 'src/app/core/services/other-deductions.service';
import { OtherDeduction } from 'src/app/core/models/other-deduction.model';
import { EmployeeDeductionService } from 'src/app/core/services/employee-deduction.service';
import { EmployeeDeduction } from 'src/app/core/models/employee-deduction.model';
import { forkJoin } from 'rxjs';
import { EmployeeBankInfoService } from 'src/app/core/services/employee-bank-info.service';
import { EmployeeBankInfo } from 'src/app/core/models/employee-bank-info.model';
import { LocalizationService } from 'src/app/core/services/localization.service';
import { EmployeeAddressService } from 'src/app/core/services/employee-address.service';
import { EmployeeAddress } from 'src/app/core/models/employee-address.model';
import { EmployeeEmergencyContactService } from 'src/app/core/services/employee-emergency-contact.service';
import { EmployeeEmergencyContact } from 'src/app/core/models/employee-emergency-contact.model';
import { EmployeeDocumentService } from 'src/app/core/services/employee-document.service';
import { EmployeeDocument } from 'src/app/core/models/employee-document.model';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})

/**
 *  users component
 */
export class EmployeesComponent implements OnInit {
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
  countries: any[] = [];
  
  basicInfoForm: UntypedFormGroup;
  submittedBasicInfo = false;
  legalContactsInfoForm: UntypedFormGroup;
  submittedLegalContactsInfo = false;
  @ViewChild('cdkStepper') cdkStepper!: CdkStepper;
  contractInfoForm: UntypedFormGroup;
  submittedContractInfo = false;
  departments: Department[] = [];
  allowanceForm: UntypedFormGroup;
  submittedAllowance = false;
  rssbDeductionForm: UntypedFormGroup;
  submittedRssbDeduction = false;
  otherDeductionForm: UntypedFormGroup;
  submittedOtherDeduction = false;
  deductionsFormGroup: UntypedFormGroup;
  submittedDeductions = false;
  bankInfoForm: UntypedFormGroup;
  submittedBankInfo = false;
  employeeAddressForm: UntypedFormGroup;
  submittedEmployeeAddress = false;
  provinces: any[] = [];
  districts: any[] = [];
  sectors: any[] = [];
  cells: any[] = [];
  villages: any[] = [];
  documentsForm: UntypedFormGroup;
  submittedDocuments = false;
  salutations = [
    { label: 'Mr', value: 'mr' },
    { label: 'Ms', value: 'ms' },
    { label: 'Mrs', value: 'mrs' },
    { label: 'Dr', value: 'dr' }
  ];
  genders = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' }
  ];
  documentTypes = [];
  emergencyContactForm: UntypedFormGroup;
  submittedEmergencyContact = false;
  employeeId: string;
  allowances: Allowance[] = [];
  rssbDeductions: RssbDeduction[] = [];
  otherDeductions: OtherDeduction[] = [];
  existingEmployeeDeductions: string[] = [];
  legalDocumentTypes = [
    { label: 'Passport', value: 'passport' },
    { label: 'ID Card', value: 'id_card' },
    { label: 'Driver License', value: 'driver_license' }
  ];
  employeeRssbDeductions: any[] = [];
  addRssbDeductionForm: UntypedFormGroup;
  addRssbDeductionModalRef: BsModalRef | undefined;
  employeeOtherDeductions: any[] = [];
  addOtherDeductionForm: UntypedFormGroup;
  addOtherDeductionModalRef: BsModalRef | undefined;
  @ViewChild('addOtherDeductionModal') addOtherDeductionModal: any;
  selectedOtherDeduction: any = null;

  @ViewChild('addRssbDeductionModal') addRssbDeductionModal: any;
  addAllowanceModalRef: BsModalRef | undefined;
  @ViewChild('addAllowanceModal') addAllowanceModal: any;

  selectedDocumentFile: File | null = null;

  highlightedEmployeeId: string | null = null;

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  lastPage = 1;
  employeeList: EmployeeInformation[] = [];
  employeeAllowances: any[] = [];
  savingNext: boolean = false;
  savingPrevious: boolean = false;

  constructor(
    private modalService: BsModalService,
    private formBuilder: UntypedFormBuilder,
    private datePipe: DatePipe,
    private store: Store,
    private employeeInformationService: EmployeeInformationService,
    private departmentService: DepartmentService,
    private employeeContractService: EmployeeContractService,
    private allowanceService: AllowanceService,
    private employeeAllowanceService: EmployeeAllowanceService,
    private deductionsService: DeductionsService,
    private employeeRssbContributionService: EmployeeRssbContributionService,
    private otherDeductionsService: OtherDeductionsService,
    private employeeDeductionService: EmployeeDeductionService,
    private employeeBankInfoService: EmployeeBankInfoService,
    private localizationService: LocalizationService,
    private employeeAddressService: EmployeeAddressService,
    private employeeEmergencyContactService: EmployeeEmergencyContactService,
    private employeeDocumentService: EmployeeDocumentService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Employee Management' }, { label: 'Employee Creation', active: true }];
    this.route.queryParams.subscribe(params => {
      this.highlightedEmployeeId = params['highlight'] || null;
    });
    this.employeeInformationService.getCountries().subscribe({
      next: (data: any) => {
        // If the API returns an array, use it. If it returns an object, try to use data property, else fallback to []
        if (Array.isArray(data)) {
          this.countries = data;
        } else if (data && Array.isArray(data.data)) {
          this.countries = data.data;
        } else {
          this.countries = [];
        }
      },
      error: (err) => {
        console.error('Failed to load countries', err);
        this.countries = [];
      }
    });
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
      salutation: ['mr'],
      firstName: ['', [Validators.required]],
      lastName: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      nationality: ['', Validators.required],
      countryOfBirth: ['', Validators.required],
      maritalStatus: ['', Validators.required],
      spouseName: ['NA'],
      numberOfChildren: 0,
      personalMobile: ['', Validators.required],
      personalEmail: ['', [Validators.required, Validators.email]],
      homePhone: ['NA']
    });

    this.legalContactsInfoForm = this.formBuilder.group({
      documentType: ['', Validators.required],
      documentNumber: [''],
      documentIssueDate: [''],
      documentExpiryDate: [''],
      placeOfIssue: [''],
      rssbNumber: ['', Validators.required],
      highestEducation: ['', Validators.required]
    });

    this.contractInfoForm = this.formBuilder.group({
      department: ['', Validators.required],
      job_title: ['', Validators.required],
      employment_type: ['', Validators.required],
      hire_date: ['', Validators.required],
      end_date: [''],
      salary_basis: ['', Validators.required],
      salary_amount: ['', [Validators.required, Validators.min(0)]],
      salary_frequency: ['', Validators.required],
      tin_number: ['']
    });

    this.allowanceForm = this.formBuilder.group({
      name: [''],
      amount: ['', [Validators.required, Validators.min(0)]],
      type: ['', Validators.required],
      allowance_id: ['', Validators.required],
      description: ['']
    });

    this.rssbDeductionForm = this.formBuilder.group({
      employee_contribution: ['', [Validators.required, Validators.min(0)]],
      employer_contribution: ['', [Validators.required, Validators.min(0)]],
      rssb_deduction_id: ['', Validators.required]
    });

    this.otherDeductionForm = this.formBuilder.group({
      description: [''],
      amount: ['', [Validators.required, Validators.min(0)]],
      type: ['', Validators.required],
      deduction_id: ['', Validators.required]
    });

    this.deductionsFormGroup = this.formBuilder.group({
      rssbDeductionForm: this.rssbDeductionForm,
      otherDeductionForm: this.otherDeductionForm
    });

    this.bankInfoForm = this.formBuilder.group({
      bank_name: ['', Validators.required],
      account_number: ['', Validators.required],
      account_name: ['', Validators.required],
      iban: [''],
      swift_code: ['']
    });

    this.employeeAddressForm = this.formBuilder.group({
      type: ['NA'],
      city: ['NA'],
      additional_address: ['NA'],
      country: ['', Validators.required],
      province: ['', Validators.required],
      district: ['', Validators.required],
      sector: ['', Validators.required],
      cell: ['', Validators.required],
      village: ['', Validators.required],
      postal_code: ['NA'],
      street_address: ['NA']
    });

    this.documentsForm = this.formBuilder.group({
      document_type_id: ['', Validators.required],
      document: ['', Validators.required],
      uploaded_at: [new Date().toISOString().slice(0, 19).replace('T', ' ')],
      description: [''],
      expiration_date: ['']
    });

    this.emergencyContactForm = this.formBuilder.group({
      name: ['', Validators.required],
      gender: ['', Validators.required],
      relationship: ['', Validators.required],
      phone: ['', Validators.required],
      email: [''] // Optional
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

    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (err) => {
        console.error('Failed to load departments', err);
        this.departments = [];
      }
    });

    this.allowanceService.getAllowances().subscribe({
      next: (response: any) => {
        this.allowances = response.data || [];
      },
      error: (err) => {
        console.error('Failed to load allowances', err);
        this.allowances = [];
      }
    });

    this.deductionsService.getRssbDeductions().subscribe({
      next: (data: any) => {
        // If paginated, use data.data; otherwise, use data directly
        this.rssbDeductions = Array.isArray(data) ? data : (data.data || []);
      },
      error: (err) => {
        console.error('Failed to load RSSB deductions', err);
        this.rssbDeductions = [];
      }
    });

    this.otherDeductionsService.getOtherDeductions().subscribe({
      next: (data: any) => {
        // If paginated, use data.data; otherwise, use data directly
        this.otherDeductions = Array.isArray(data) ? data : (data.data || []);
      },
      error: (err) => {
        console.error('Failed to load other deductions', err);
        this.otherDeductions = [];
      }
    });

    this.localizationService.getLocalizations(0).subscribe({
      next: (data: any) => {
        this.provinces = data.data || [];
      }
    });

    // Fetch document types from backend
    this.employeeDocumentService.getDocumentTypes().subscribe({
      next: (res: any) => {
        if (res && Array.isArray(res.data)) {
          this.documentTypes = res.data.map((item: any) => ({ label: item.label, value: item.id }));
        } else {
          this.documentTypes = [];
        }
      },
      error: (err) => {
        this.documentTypes = [];
      }
    });

    this.addRssbDeductionForm = this.formBuilder.group({
      rssb_deduction_id: ['', Validators.required],
      employee_contribution: [{ value: '', disabled: true }, Validators.required],
      employer_contribution: [{ value: '', disabled: true }, Validators.required]
    });

    this.addOtherDeductionForm = this.formBuilder.group({
      description: [''],
      amount: ['', [Validators.required, Validators.min(0)]],
      type: ['', Validators.required],
      deduction_id: ['', Validators.required],
      deduction_name: ['']
    });

    this.fetchEmployees(this.currentPage);
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

  onFinalSubmit() {
    this.saving = true;
    // Simulate API call or use your real submission logic here
    setTimeout(() => {
      this.saving = false;
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Employee submitted successfully!',
        confirmButtonText: 'OK',
      }).then(() => {
        // Pass the new employee's ID as a query param
        this.router.navigate(['/employees/employees-view'], { queryParams: { highlight: this.employeeId } });
      });
    }, 1500);
  }

  get basicInfo() {
    return this.basicInfoForm.controls;
  }

  onBasicInfoNext() {
    this.submittedBasicInfo = true;
    if (this.basicInfoForm.invalid) {
      return;
    }
    this.savingNext = true;
    setTimeout(() => {
      this.savingNext = false;
      if (this.cdkStepper) {
        this.cdkStepper.next();
      }
    }, 1500);
  }

  onPreviousStep() {
    this.savingPrevious = true;
    setTimeout(() => {
      this.savingPrevious = false;
      if (this.cdkStepper) {
        this.cdkStepper.previous();
      }
    }, 500);
  }

  get legalContactsInfo() {
    return this.legalContactsInfoForm.controls;
  }

  onLegalContactsInfoSubmit() {
    this.submittedLegalContactsInfo = true;
    if (this.legalContactsInfoForm.invalid || this.basicInfoForm.invalid) {
      return;
    }
    this.savingNext = true;
    // Map form values to API structure
    const basic = this.basicInfoForm.value;
    const legal = this.legalContactsInfoForm.value;
    const payload: EmployeeInformation = {
      salutation: basic.salutation || 'mr',
      first_name: basic.firstName,
      last_name: basic.lastName,
      gender: basic.gender,
      date_of_birth: basic.dateOfBirth,
      nationality: basic.nationality,
      country_of_birth: basic.countryOfBirth,
      marital_status: basic.maritalStatus,
      name_of_spouse: basic.spouseName || 'NA',
      number_of_children: Number.isInteger(basic.numberOfChildren) ? basic.numberOfChildren : 0,
      document_type: legal.documentType,
      document_number: legal.documentNumber,
      document_issue_date: legal.documentIssueDate,
      document_place_of_issue: (legal.placeOfIssue ?? '').toString(),
      rssb_number: legal.rssbNumber,
      highest_education: legal.highestEducation,
      personal_mobile: basic.personalMobile,
      personal_email: basic.personalEmail
    };
    this.employeeInformationService.createEmployeeInformation(payload).subscribe({
      next: (res: any) => {
        this.savingNext = false;
        console.log('Employee creation response:', res);
        if (res && res.data && res.data.id) {
          this.employeeId = res.data.id;
        }
        if (this.cdkStepper) {
          this.cdkStepper.next();
        }
      },
      error: (err) => {
        this.savingNext = false;
        let errorMsg = 'Failed to submit employee information';
        let errorList: string[] = [];
        if (typeof err === 'string') {
          errorMsg = err;
        } else if (err && typeof err === 'object') {
          if (err.message) {
            errorMsg = err.message;
          }
          if (err.errors) {
            // Laravel validation errors: collect all messages as strings
            errorList = Object.values(err.errors).flatMap((v: any) => v.map((msg: any) => String(msg)));
          }
        }
        // Remove redundant summary if error list is present
        if (errorList.length > 0) {
          const summary = errorMsg.replace(/\s*\(and \d+ more error[s]?\)/, '');
          Swal.fire({
            icon: 'error',
            title: 'Error',
            html: `<div style='text-align:left'><div>${summary}</div><ul style='margin:0;padding-left:1.2em'>${errorList.map(e => `<li>${e}</li>`).join('')}</ul></div>`
          });
        } else {
          Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
        }
        console.error('Failed to submit employee information', err);
      }
    });
  }

  get contractInfo() {
    return this.contractInfoForm.controls;
  }

  onContractInfoSubmit() {
    this.submittedContractInfo = true;
    if (this.contractInfoForm.invalid) {
      return;
    }
    if (!this.employeeId) {
      // Optionally show error feedback
      console.error('Employee ID is missing. Cannot submit contract info.');
      return;
    }
    this.savingNext = true;
    const contract: EmployeeContract = {
      ...this.contractInfoForm.value,
      employee_id: this.employeeId
    };
    this.employeeContractService.createContract(this.employeeId, contract).subscribe({
      next: (res) => {
        this.savingNext = false;
        // Handle success, go to next tab
        if (this.cdkStepper) {
          this.cdkStepper.next();
        }
      },
      error: (err) => {
        this.savingNext = false;
        // Optionally show error feedback
        console.error('Failed to submit contract information', err);
      }
    });
  }

  get allowance() {
    return this.allowanceForm.controls;
  }

  onAllowanceSubmit() {
    this.submittedAllowance = true;
    if (!this.employeeId) {
      return;
    }
    this.savingNext = true;
    this.employeeAllowanceService.createEmployeeAllowance(this.employeeId, this.allowanceForm.value).subscribe({
      next: (res) => {
        this.savingNext = false;
        if (res && res.data) {
          this.employeeAllowances.push(res.data);
        } else {
          this.employeeAllowances.push({ ...this.allowanceForm.value });
        }
        this.closeAddAllowanceModal();
        this.submittedAllowance = false;
        this.allowanceForm.reset();
      },
      error: (err) => {
        this.savingNext = false;
        Swal.fire({
          icon: 'error',
          title: 'Failed to add allowance',
          text: 'Please try again.',
        });
      }
    });
  }

  removeAllowance(index: number) {
    this.employeeAllowances.splice(index, 1);
  }

  get rssbDeduction() {
    return this.rssbDeductionForm.controls;
  }

  onRssbDeductionSubmit() {
    this.submittedRssbDeduction = true;
    if (this.rssbDeductionForm.invalid || !this.employeeId) {
      return;
    }
    this.savingNext = true;
    const contribution: EmployeeRssbContribution = {
      ...this.rssbDeductionForm.value
    };
    this.employeeRssbContributionService.createRssbContribution(this.employeeId, contribution).subscribe({
      next: (res) => {
        this.savingNext = false;
        // Optionally go to next section or show success
        if (this.cdkStepper) {
          this.cdkStepper.next();
        }
      },
      error: (err) => {
        this.savingNext = false;
        // Error interceptor will handle errors
      }
    });
  }

  get otherDeduction() {
    return this.otherDeductionForm.controls;
  }

  onOtherDeductionSubmit() {
    this.submittedOtherDeduction = true;
    if (this.otherDeductionForm.invalid || !this.employeeId) {
      return;
    }
    this.savingNext = true;
    const deduction: EmployeeDeduction = {
      amount: this.otherDeductionForm.value.amount,
      type: this.otherDeductionForm.value.type,
      deduction_id: this.otherDeductionForm.value.deduction_id
    };
    this.employeeDeductionService.createEmployeeDeduction(this.employeeId, deduction).subscribe({
      next: (res) => {
        this.savingNext = false;
        // Optionally go to next section or show success
        if (this.cdkStepper) {
          this.cdkStepper.next();
        }
      },
      error: (err) => {
        this.savingNext = false;
        // Error interceptor will handle errors
      }
    });
  }

  onDeductionsSubmit() {
    this.submittedDeductions = true;

    // Removed employeeId validation block

    this.savingNext = true;

    // Create RSSB deductions
    const rssbRequests = this.employeeRssbDeductions.map(deduction => {
      return this.employeeRssbContributionService.createRssbContribution(this.employeeId, {
        employee_contribution: deduction.rssb_employee_contribution,
        employer_contribution: deduction.rssb_employer_contribution,
        rssb_deduction_id: deduction.id
      });
    });

    // Create other deductions
    const otherRequests = this.employeeOtherDeductions.map(deduction => {
      return this.employeeDeductionService.createEmployeeDeduction(this.employeeId, {
        amount: deduction.amount,
        type: deduction.type,
        deduction_id: deduction.deduction_id
      });
    });

    // Combine all requests
    const allRequests = [...rssbRequests, ...otherRequests];

    if (allRequests.length === 0) {
      this.savingNext = false;
      if (this.cdkStepper) {
        this.cdkStepper.next();
      }
      return;
    }

    forkJoin(allRequests).subscribe({
      next: (results) => {
        this.savingNext = false;
        Swal.fire({
          icon: 'success',
          title: 'Deductions Saved',
          text: 'Employee deductions have been saved successfully.',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          if (this.cdkStepper) {
            this.cdkStepper.next();
          }
        });
      },
      error: (err) => {
        this.savingNext = false;
        console.error('Error saving deductions:', err);
        Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text: 'Failed to save deductions. Please try again.',
        });
      }
    });
  }

  get bankInfo() {
    return this.bankInfoForm.controls;
  }

  onBankInfoSubmit() {
    this.submittedBankInfo = true;
    if (this.bankInfoForm.invalid || !this.employeeId) {
      return;
    }
    this.savingNext = true;
    const bankInfo: EmployeeBankInfo = {
      bank_name: this.bankInfoForm.value.bank_name,
      account_number: this.bankInfoForm.value.account_number,
      account_name: this.bankInfoForm.value.account_name,
      iban: this.bankInfoForm.value.iban,
      swift_code: this.bankInfoForm.value.swift_code
    };
    this.employeeBankInfoService.createEmployeeBankInfo(this.employeeId, bankInfo).subscribe({
      next: (res) => {
        this.savingNext = false;
        // Optionally go to next section or show success
        if (this.cdkStepper) {
          this.cdkStepper.next();
        }
      },
      error: (err) => {
        this.savingNext = false;
        // Error interceptor will handle errors
      }
    });
  }

  get employeeAddress() {
    return this.employeeAddressForm.controls;
  }

  onEmployeeAddressSubmit() {
    this.submittedEmployeeAddress = true;
    if (this.employeeAddressForm.invalid || !this.employeeId) {
      return;
    }
    this.savingNext = true;
    const address: EmployeeAddress = {
      type: this.employeeAddressForm.value.type || 'NA',
      country: this.employeeAddressForm.value.country,
      province: this.employeeAddressForm.value.province,
      district: this.employeeAddressForm.value.district,
      sector: this.employeeAddressForm.value.sector,
      cell: this.employeeAddressForm.value.cell,
      village: this.employeeAddressForm.value.village,
      city: this.employeeAddressForm.value.city || 'NA',
      additional_address: this.employeeAddressForm.value.additional_address || 'NA',
      postal_code: this.employeeAddressForm.value.postal_code || 'NA',
      street_address: this.employeeAddressForm.value.street_address || 'NA'
    };
    this.employeeAddressService.createEmployeeAddress(this.employeeId, address).subscribe({
      next: (res) => {
        this.savingNext = false;
        // Optionally go to next section or show success
        if (this.cdkStepper) {
          this.cdkStepper.next();
        }
      },
      error: (err) => {
        this.savingNext = false;
        // Error interceptor will handle errors
      }
    });
  }

  get documents() {
    return this.documentsForm.controls;
  }

  onDocumentFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        // Show error to user (e.g., with SweetAlert or a form error)
        alert('Invalid file type. Allowed types: pdf, jpg, jpeg, png, doc, docx.');
        this.selectedDocumentFile = null;
        this.documentsForm.patchValue({ document: '' });
        return;
      }
      this.selectedDocumentFile = file;
      this.documentsForm.patchValue({ document: file.name });
      this.documentsForm.get('document')?.markAsDirty();
      this.documentsForm.get('document')?.updateValueAndValidity();
    }
  }

  onDocumentsSubmit() {
    this.submittedDocuments = true;
    if (this.documentsForm.invalid || !this.employeeId || !this.selectedDocumentFile) {
      return;
    }
    this.savingNext = true;
    const formData = new FormData();
    formData.append('document_type_id', this.documentsForm.value.document_type_id);
    formData.append('description', this.documentsForm.value.description || '');
    formData.append('expiration_date', this.documentsForm.value.expiration_date || '');
    formData.append('document', this.selectedDocumentFile); // The actual file
    this.employeeDocumentService.createEmployeeDocument(this.employeeId, formData).subscribe({
      next: (res) => {
        this.savingNext = false;
        // Optionally go to next section or show success
    if (this.cdkStepper) {
      this.cdkStepper.next();
    }
      },
      error: (err) => {
        this.savingNext = false;
        // Error interceptor will handle errors
      }
    });
  }

  get emergencyContact() {
    return this.emergencyContactForm.controls;
  }

  onEmergencyContactSubmit() {
    const contact: EmployeeEmergencyContact = {
      name: this.emergencyContactForm.value.name,
      gender: this.emergencyContactForm.value.gender,
      relationship: this.emergencyContactForm.value.relationship,
      phone: this.emergencyContactForm.value.phone,
      email: this.emergencyContactForm.value.email
    };
    // If all fields are empty or null, do not call the API
    const allEmpty = Object.values(contact).every(v => v === null || v === undefined || v === '');
    if (allEmpty) {
      return;
    }
    this.submittedEmergencyContact = true;
    if (this.emergencyContactForm.invalid || !this.employeeId) {
      return;
    }
    this.savingNext = true;
    this.employeeEmergencyContactService.createEmployeeEmergencyContact(this.employeeId, contact).subscribe({
      next: (res) => {
        this.savingNext = false;
        // Optionally go to next section or show success
        if (this.cdkStepper) {
          this.cdkStepper.next();
        }
      },
      error: (err) => {
        this.savingNext = false;
        // Error interceptor will handle errors
      }
    });
  }

  onSkipEmergency() {
    this.savingNext = true;
    this.emergencyContactForm.reset();
    setTimeout(() => {
      this.savingNext = false;
      if (this.cdkStepper) {
        this.cdkStepper.next();
      }
    }, 500);
  }

  onSkipAddress() {
    if (this.cdkStepper) {
      this.cdkStepper.next();
    }
  }

  onSkipDocuments() {
    this.savingNext = true;
    this.documentsForm.reset();
    setTimeout(() => {
      this.savingNext = false;
      if (this.cdkStepper) {
        this.cdkStepper.next();
      }
    }, 500);
  }

  get f() { return this.contractInfo.controls; }

  fetchEmployeeDeductions() {
    this.employeeDeductionService.getEmployeeDeductions(this.employeeId).subscribe({
      next: (deductions: any[]) => {
        // Assuming each deduction has a deduction_id
        this.existingEmployeeDeductions = deductions.map(d => d.deduction_id);
      },
      error: (err) => {
        this.existingEmployeeDeductions = [];
      }
    });
  }

  onProvinceChange(provinceId: number) {
    this.districts = [];
    this.sectors = [];
    this.cells = [];
    this.villages = [];
    this.employeeAddressForm.patchValue({ district: '', sector: '', cell: '', village: '' });
    this.localizationService.getLocalizations(provinceId).subscribe({
      next: (data: any) => {
        this.districts = data.data || [];
      }
    });
  }

  onDistrictChange(districtId: number) {
    this.sectors = [];
    this.cells = [];
    this.villages = [];
    this.employeeAddressForm.patchValue({ sector: '', cell: '', village: '' });
    this.localizationService.getLocalizations(districtId).subscribe({
      next: (data: any) => {
        this.sectors = data.data || [];
      }
    });
  }

  onSectorChange(sectorId: number) {
    this.cells = [];
    this.villages = [];
    this.employeeAddressForm.patchValue({ cell: '', village: '' });
    this.localizationService.getLocalizations(sectorId).subscribe({
      next: (data: any) => {
        this.cells = data.data || [];
      }
    });
  }

  onCellChange(cellId: number) {
    this.villages = [];
    this.employeeAddressForm.patchValue({ village: '' });
    this.localizationService.getLocalizations(cellId).subscribe({
      next: (data: any) => {
        this.villages = data.data || [];
      }
    });
  }

  openAddRssbDeductionModal() {
    this.addRssbDeductionForm.reset();
    this.addRssbDeductionModalRef = this.modalService.show(this.addRssbDeductionModal);
  }

  closeAddRssbDeductionModal() {
    if (this.addRssbDeductionModalRef) {
      this.addRssbDeductionModalRef.hide();
    }
  }

  onRssbDeductionSelected() {
    const selectedId = this.addRssbDeductionForm.value.rssb_deduction_id;
    const deduction = this.rssbDeductions.find(d => d.id === selectedId);
    if (deduction) {
      this.addRssbDeductionForm.patchValue({
        employee_contribution: deduction.rssb_employee_contribution,
        employer_contribution: deduction.rssb_employer_contribution
      });
    }
  }

  addRssbDeduction() {
    const selectedId = this.addRssbDeductionForm.value.rssb_deduction_id;
    const deduction = this.rssbDeductions.find(d => d.id === selectedId);
    if (deduction) {
      this.employeeRssbDeductions.push({
        ...deduction,
        rssb_employee_contribution: deduction.rssb_employee_contribution,
        rssb_employer_contribution: deduction.rssb_employer_contribution
      });
      this.closeAddRssbDeductionModal();
    }
  }

  removeRssbDeduction(index: number) {
    this.employeeRssbDeductions.splice(index, 1);
  }

  openAddOtherDeductionModal() {
    this.addOtherDeductionForm.reset();
    this.selectedOtherDeduction = null;
    this.addOtherDeductionModalRef = this.modalService.show(this.addOtherDeductionModal);
  }

  closeAddOtherDeductionModal() {
    if (this.addOtherDeductionModalRef) {
      this.addOtherDeductionModalRef.hide();
    }
  }

  onOtherDeductionSelected() {
    const selectedId = this.addOtherDeductionForm.value.deduction_id;
    const deduction = this.otherDeductions.find(d => d.id === selectedId);
    if (deduction) {
      this.addOtherDeductionForm.patchValue({
        deduction_name: deduction.deduction_name
      });
      this.selectedOtherDeduction = deduction;
    }
  }

  addOtherDeduction() {
    if (this.addOtherDeductionForm.valid) {
      this.employeeOtherDeductions.push({
        ...this.addOtherDeductionForm.value
      });
      this.closeAddOtherDeductionModal();
    }
  }

  removeOtherDeduction(index: number) {
    this.employeeOtherDeductions.splice(index, 1);
  }

  openAddAllowanceModal() {
    this.allowanceForm.reset();
    this.addAllowanceModalRef = this.modalService.show(this.addAllowanceModal);
  }

  closeAddAllowanceModal() {
    if (this.addAllowanceModalRef) {
      this.addAllowanceModalRef.hide();
    }
  }

  fetchEmployees(page: number) {
    this.isLoading = true;
    this.employeeInformationService.getEmployees(page).subscribe({
      next: (res) => {
        this.employeeList = res.data || [];
        this.currentPage = res.current_page;
        this.lastPage = res.last_page;
        this.totalItems = res.total; // res.total should be the total number of employees from the backend
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: any) {
    const page = event.page || event;
    this.fetchEmployees(page);
  }

  // Helper methods for review form to convert IDs to readable names
  getSalutationLabel(value: string): string {
    if (!value) return '';
    const salutation = this.salutations.find(s => s.value === value);
    return salutation ? salutation.label : value;
  }

  getGenderLabel(value: string): string {
    if (!value) return '';
    const gender = this.genders.find(g => g.value === value);
    return gender ? gender.label : value;
  }

  getCountryName(countryId: string): string {
    if (!countryId) return '';
    const country = this.countries.find(c => c.id === countryId || c.id === parseInt(countryId));
    return country ? country.name : countryId;
  }

  getDepartmentName(departmentId: string): string {
    if (!departmentId) return '';
    const department = this.departments.find(d => d.id === departmentId);
    return department ? department.name : departmentId;
  }

  getAllowanceName(allowanceId: string): string {
    if (!allowanceId) return '';
    const allowance = this.allowances.find(a => a.id === allowanceId);
    return allowance ? allowance.name : allowanceId;
  }

  getDocumentTypeName(documentTypeId: string): string {
    if (!documentTypeId) return '';
    const documentType = this.documentTypes.find(d => d.value === documentTypeId);
    return documentType ? documentType.label : documentTypeId;
  }

  getProvinceName(provinceId: string): string {
    if (!provinceId) return '';
    const province = this.provinces.find(p => p.id === provinceId || p.id === parseInt(provinceId));
    return province ? province.name : provinceId;
  }

  getDistrictName(districtId: string): string {
    if (!districtId) return '';
    const district = this.districts.find(d => d.id === districtId || d.id === parseInt(districtId));
    return district ? district.name : districtId;
  }

  getSectorName(sectorId: string): string {
    if (!sectorId) return '';
    const sector = this.sectors.find(s => s.id === sectorId || s.id === parseInt(sectorId));
    return sector ? sector.name : sectorId;
  }

  getCellName(cellId: string): string {
    if (!cellId) return '';
    const cell = this.cells.find(c => c.id === cellId || c.id === parseInt(cellId));
    return cell ? cell.name : cellId;
  }

  getVillageName(villageId: string): string {
    if (!villageId) return '';
    const village = this.villages.find(v => v.id === villageId || v.id === parseInt(villageId));
    return village ? village.name : villageId;
  }

  getDeductionName(deductionId: string): string {
    if (!deductionId) return '';
    const deduction = this.otherDeductions.find(d => d.id === deductionId);
    return deduction ? deduction.deduction_name : deductionId;
  }

  // Load all address data for review step
  loadAddressDataForReview() {
    const addressForm = this.employeeAddressForm.value;
    
    // Load provinces if not already loaded
    if (this.provinces.length === 0) {
      this.localizationService.getLocalizations(0).subscribe({
        next: (data: any) => {
          this.provinces = data.data || [];
          
          // If we have a province selected, load districts
          if (addressForm.province) {
            this.onProvinceChange(addressForm.province);
          }
        }
      });
    } else if (addressForm.province) {
      // If provinces are loaded but districts aren't, load districts
      if (this.districts.length === 0) {
        this.onProvinceChange(addressForm.province);
      }
    }
  }

  // Method to handle review step access
  onReviewStepAccess() {
    this.loadAddressDataForReview();
  }

  // Method to handle stepper changes
  onStepperChange() {
    if (this.cdkStepper && this.cdkStepper.selectedIndex === 9) {
      this.loadAddressDataForReview();
    }
  }
}
