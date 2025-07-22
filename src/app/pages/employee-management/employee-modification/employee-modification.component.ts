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
import { DepartmentService } from 'src/app/core/services/department.service';
import { Department } from 'src/app/core/models/department.model';
import { DeductionsService } from 'src/app/core/services/deductions.service';
import { RssbDeduction } from 'src/app/core/models/rssb-deduction.model';
import { OtherDeductionsService } from 'src/app/core/services/other-deductions.service';
import { OtherDeduction } from 'src/app/core/models/other-deduction.model';
import { EmployeeDocumentService } from 'src/app/core/services/employee-document.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { AllowanceService } from 'src/app/core/services/allowance.service';
import { EmployeeAllowanceService } from 'src/app/core/services/employee-allowance.service';
import { EmployeeContractService } from 'src/app/core/services/employee-contract.service';
import { EmployeeDeductionService } from 'src/app/core/services/employee-deduction.service';
import { EmployeeBankInfoService } from 'src/app/core/services/employee-bank-info.service';
import { LocalizationService } from 'src/app/core/services/localization.service';
import { EmployeeAddressService } from 'src/app/core/services/employee-address.service';
import { EmployeeAddress } from 'src/app/core/models/employee-address.model';
import { EmployeeEmergencyContactService } from 'src/app/core/services/employee-emergency-contact.service';
import { EmployeeEmergencyContact } from 'src/app/core/models/employee-emergency-contact.model';
import { environment } from 'src/environments/environment';

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
  countries: any[] = [];
  departments: Department[] = [];
  rssbDeductions: RssbDeduction[] = [];
  otherDeductions: OtherDeduction[] = [];
  documentTypes: any[] = [];
  legalDocumentTypes = [
    { label: 'Passport', value: 'passport' },
    { label: 'ID Card', value: 'id_card' },
    { label: 'Driver License', value: 'driver_license' }
  ];
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
  @ViewChild('cdkStepper') cdkStepper!: CdkStepper;

  // Deductions step properties and methods
  employeeRssbDeductions: any[] = [];
  employeeOtherDeductions: any[] = [];
  addRssbDeductionForm: UntypedFormGroup;
  addOtherDeductionForm: UntypedFormGroup;
  editOtherDeductionForm: UntypedFormGroup;
  addRssbDeductionModalRef: BsModalRef | undefined;
  addOtherDeductionModalRef: BsModalRef | undefined;
  editOtherDeductionModalRef: BsModalRef | undefined;
  @ViewChild('addRssbDeductionModal') addRssbDeductionModal: any;
  @ViewChild('addOtherDeductionModal') addOtherDeductionModal: any;
  @ViewChild('editOtherDeductionModal') editOtherDeductionModal: any;
  editingDeductionIndex: number = -1;

  isEditingStep: { [key: number]: boolean } = { 0: false };
  originalBasicInfo: any = null;
  originalLegalContactsInfo: any = null;
  originalContractInfo: any = null;
  originalAllowance: any = null;
  allowances: any[] = [];
  employeeAllowanceId: string = '';
  employeeContractId: string = '';
  employeeBankInfoId: string = '';
  originalRssbDeductions: any[] = [];
  originalOtherDeductions: any[] = [];
  // Form groups for steps
  basicInfoForm: UntypedFormGroup;
  submittedBasicInfo = false;
  legalContactsInfoForm: UntypedFormGroup;
  submittedLegalContactsInfo = false;
  contractInfoForm: UntypedFormGroup;
  submittedContractInfo = false;
  allowanceForm: UntypedFormGroup;
  submittedAllowance = false;
  bankInfoForm: UntypedFormGroup;
  submittedBankInfo = false;
  employeeAddressForm: UntypedFormGroup;
  submittedEmployeeAddress = false;
  provinces: any[] = [];
  districts: any[] = [];
  sectors: any[] = [];
  cells: any[] = [];
  villages: any[] = [];
  employeeAddressId: string = '';
  originalAddress: any = null;
  emergencyContactForm: UntypedFormGroup;
  submittedEmergencyContact = false;
  employeeEmergencyContactId: string = '';
  originalEmergencyContact: any = null;
  documentsForm: UntypedFormGroup;
  submittedDocuments = false;
  employeeDocumentId: string = '';
  originalDocument: any = null;
  selectedDocumentFile: File | null = null;
  private employeeId: string;
  // Store the full employee object for merging updates
  fullEmployeeData: any = null;
  addAllowanceModalRef: BsModalRef | undefined;
  @ViewChild('addAllowanceModal') addAllowanceModal: any;
  employeeAllowances: any[] = [];
  editingAllowanceIndex: number | null = null;

  constructor(
    private modalService: BsModalService,
    private formBuilder: UntypedFormBuilder,
    private datePipe: DatePipe,
    private store: Store,
    private employeeInformationService: EmployeeInformationService,
    private departmentService: DepartmentService,
    private deductionsService: DeductionsService,
    private otherDeductionsService: OtherDeductionsService,
    private employeeDocumentService: EmployeeDocumentService,
    private route: ActivatedRoute,
    private allowanceService: AllowanceService,
    private employeeAllowanceService: EmployeeAllowanceService,
    private employeeContractService: EmployeeContractService,
    private employeeDeductionService: EmployeeDeductionService,
    private employeeBankInfoService: EmployeeBankInfoService,
    private localizationService: LocalizationService,
    private employeeAddressService: EmployeeAddressService,
    private employeeEmergencyContactService: EmployeeEmergencyContactService
  ) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Employee Management' }, { label: 'Employee Creation', active: true }];
    setTimeout(() => {
      this.isLoading = false;
    }, 1500); // Simulate loading delay

    this.route.paramMap.subscribe(params => {
      this.employeeId = params.get('id')!;
      if (this.employeeId) {
        this.fetchEmployeeInfo();
      }
    });

    // Fetch countries
    this.employeeInformationService.getCountries().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.countries = data;
        } else if (data && Array.isArray(data.data)) {
          this.countries = data.data;
        } else {
          this.countries = [];
        }
      },
      error: (err) => {
        this.countries = [];
      }
    });

    // Fetch departments
    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (err) => {
        this.departments = [];
      }
    });

    // Fetch RSSB deductions
    this.deductionsService.getRssbDeductions().subscribe({
      next: (data: any) => {
        this.rssbDeductions = Array.isArray(data) ? data : (data.data || []);
      },
      error: (err) => {
        this.rssbDeductions = [];
      }
    });

    // Fetch other deductions
    this.otherDeductionsService.getOtherDeductions().subscribe({
      next: (data: any) => {
        this.otherDeductions = Array.isArray(data) ? data : (data.data || []);
      },
      error: (err) => {
        this.otherDeductions = [];
      }
    });

    // Fetch document types
    this.employeeDocumentService.getDocumentTypes().subscribe({
      next: (res: any) => {
        console.log('Document types response:', res);
        if (res && Array.isArray(res.data)) {
          this.documentTypes = res.data.map((item: any) => ({ label: item.label, value: item.id }));
          console.log('Document types mapped:', this.documentTypes);
        } else {
          this.documentTypes = [];
        }
      },
      error: (err) => {
        console.error('Error loading document types:', err);
        this.documentTypes = [];
      }
    });

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
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      nationality: ['', Validators.required],
      countryOfBirth: ['', Validators.required],
      maritalStatus: ['', Validators.required],
      spouseName: [''],
      numberOfChildren: ['', [Validators.min(0)]],
      personalMobile: [''],
      personalEmail: ['', [Validators.email]],
      homePhone: ['']
    });

    this.legalContactsInfoForm = this.formBuilder.group({
      documentType: ['', Validators.required],
      documentNumber: [''],
      documentIssueDate: [''],
      documentExpiryDate: [''],
      placeOfIssue: [''], // Not required
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

    this.addRssbDeductionForm = this.formBuilder.group({
      rssb_deduction_id: ['', Validators.required],
      employee_contribution: [{ value: '', disabled: true }, Validators.required],
      employer_contribution: [{ value: '', disabled: true }, Validators.required],
    });
    this.addOtherDeductionForm = this.formBuilder.group({
      description: [''],
      amount: ['', [Validators.required, Validators.min(0)]],
      type: ['', Validators.required],
      deduction_id: ['', Validators.required],
    });

    this.editOtherDeductionForm = this.formBuilder.group({
      id: [''],
      description: [''],
      amount: ['', [Validators.required, Validators.min(0)]],
      type: ['', Validators.required],
      deduction_id: ['', Validators.required],
      employee_id: ['']
    });

    this.bankInfoForm = this.formBuilder.group({
      bank_name: ['', Validators.required],
      account_number: ['', Validators.required],
      account_name: ['', Validators.required],
      iban: [''],
      swift_code: ['']
    });

    this.employeeAddressForm = this.formBuilder.group({
      type: ['', Validators.required],
      city: [''],
      additional_address: [''],
      country: ['', Validators.required],
      province: ['', Validators.required],
      district: ['', Validators.required],
      sector: ['', Validators.required],
      cell: ['', Validators.required],
      village: ['', Validators.required],
      postal_code: [''],
      street_address: ['']
    });

    this.emergencyContactForm = this.formBuilder.group({
      name: [''],
      gender: [''],
      relationship: [''],
      phone: [''],
      email: ['']
    });

    this.documentsForm = this.formBuilder.group({
      document_type_id: ['', Validators.required],
      document: [''],
      uploaded_at: [new Date().toISOString().slice(0, 19).replace('T', ' ')],
      description: [''],
      expiration_date: ['']
    });

    // Remove all hardcoded/dummy data for forms and lists
    // this.basicInfoForm.patchValue(...)
    // this.legalInfoForm.patchValue(...)
    // this.contactInfoForm.patchValue(...)
    // this.orderlist = [...]
    // this.Allorderlist = this.orderlist;

    this.basicInfoForm.disable();
    this.legalContactsInfoForm.disable();
    this.contractInfoForm.disable();
    this.allowanceForm.disable();
    this.bankInfoForm.disable();
    this.employeeAddressForm.disable();
    this.emergencyContactForm.disable();
    this.documentsForm.disable();
    this.isEditingStep[2] = false;
    this.isEditingStep[3] = false;
    this.isEditingStep[4] = false;
    this.isEditingStep[6] = false;
    this.isEditingStep[7] = false;
    this.isEditingStep[8] = false;
    this.loadAllowances();
    this.loadRssbDeductions();
    this.loadOtherDeductions();
    this.loadLocationData();
  }

  fetchEmployeeInfo() {
    if (!this.employeeId) return;
    this.employeeInformationService.getEmployeeById(this.employeeId).subscribe((employee: any) => {
      if (employee) {
        this.fullEmployeeData = { ...employee }; // Store the full object
        this.basicInfoForm.patchValue({
          salutation: employee.salutation,
          firstName: employee.first_name,
          lastName: employee.last_name,
          gender: employee.gender,
          dateOfBirth: employee.date_of_birth,
          nationality: (employee.nationality && typeof employee.nationality === 'object') ? employee.nationality.id : employee.nationality,
          countryOfBirth: (employee.country_of_birth && typeof employee.country_of_birth === 'object') ? employee.country_of_birth.id : employee.country_of_birth,
          maritalStatus: employee.marital_status,
          personalMobile: employee.personal_mobile,
          personalEmail: employee.personal_email,
          homePhone: employee.home_phone,
        });
        this.originalBasicInfo = this.basicInfoForm.value;
        if (this.legalContactsInfoForm) {
          this.legalContactsInfoForm.patchValue({
            documentType: employee.document_type,
            documentNumber: employee.document_number,
            documentIssueDate: employee.document_issue_date,
            documentExpiryDate: employee.document_expiry_date,
            placeOfIssue: employee.document_place_of_issue,
            rssbNumber: employee.rssb_number,
            highestEducation: employee.highest_education,
          });
          this.originalLegalContactsInfo = this.legalContactsInfoForm.value;
        }
        if (this.contractInfoForm) {
          // Handle contract data - it might be an array or single object
          let contractData = employee.employee_contracts;
          if (Array.isArray(contractData) && contractData.length > 0) {
            contractData = contractData[0]; // Take the first contract
          }
          
          if (contractData) {
            this.contractInfoForm.patchValue({
              department: (contractData.department && typeof contractData.department === 'object')
                ? contractData.department.id
                : contractData.department,
              job_title: contractData.job_title,
              employment_type: contractData.employment_type,
              hire_date: contractData.hire_date,
              end_date: contractData.end_date,
              salary_basis: contractData.salary_basis,
              salary_amount: contractData.salary_amount,
              salary_frequency: contractData.salary_frequency,
              tin_number: contractData.tin_number
            });
            this.originalContractInfo = this.contractInfoForm.value;
            // Store the contract ID for updates
            this.employeeContractId = contractData.id || '';
          }
        }
        // Handle allowance data - it might be an array or single object
        // Remove old allowance loading logic here
        // this.employeeAllowances = Array.isArray(allowanceData) ? allowanceData.map(a => ({ ...a })) : [{ ...allowanceData }];
        // this.allowanceForm.patchValue({
        //   name: allowanceData[0].name || '',
        //   amount: allowanceData[0].amount || '',
        //   type: allowanceData[0].type || '',
        //   allowance_id: allowanceData[0].allowance_id || '',
        //   description: allowanceData[0].description || ''
        // });
        // this.originalAllowance = this.allowanceForm.value;
        // this.employeeAllowanceId = allowanceData[0].id || '';
        // Load existing deductions
        if (employee.employee_rssb_contribution) {
          this.employeeRssbDeductions = [...employee.employee_rssb_contribution];
          this.employeeRssbDeductions.forEach(deduction => {
            deduction.rssb_name = deduction.rssb_deductions?.rssb_name;
          });
          this.employeeRssbDeductions = [...employee.employee_rssb_contribution];
          this.originalRssbDeductions = [...employee.employee_rssb_contribution];
        }
        if (employee.employee_other_deductions) {
          this.employeeOtherDeductions = [...employee.employee_other_deductions];
          this.originalOtherDeductions = [...employee.employee_other_deductions];
        }
        
        // Load bank information
        this.loadEmployeeBankInfo();
        
        // Load address information
        this.loadEmployeeAddress();
        
        // Load emergency contact information
        this.loadEmployeeEmergencyContact();
        
        // Load documents information
        this.loadEmployeeDocuments();
      }
    });
  }

  onEditStep(stepIndex: number) {
    if (stepIndex === 0) {
      this.basicInfoForm.enable();
      this.isEditingStep[stepIndex] = true;
    } else if (stepIndex === 1) {
      this.legalContactsInfoForm.enable();
      this.isEditingStep[stepIndex] = true;
    } else if (stepIndex === 2) {
      this.contractInfoForm.enable();
      this.isEditingStep[stepIndex] = true;
    } else if (stepIndex === 3) {
      // Allowance, RSSB, and Other Deductions combined step
      this.allowanceForm.enable();
      // No form group for deductions, just set editing state
      this.isEditingStep[stepIndex] = true;
    } else if (stepIndex === 4) {
      this.bankInfoForm.enable();
      this.isEditingStep[stepIndex] = true;
    } else if (stepIndex === 5) {
      this.employeeAddressForm.enable();
      this.isEditingStep[stepIndex] = true;
    } else if (stepIndex === 6) {
      this.emergencyContactForm.enable();
      this.isEditingStep[stepIndex] = true;
    } else if (stepIndex === 7) {
      this.documentsForm.enable();
      this.isEditingStep[stepIndex] = true;
    }
  }
  onUpdateStep(stepIndex: number) {
    if (stepIndex === 0 || stepIndex === 1) {
      // Always send the full employee object
      const payload = this.buildFullEmployeePayload();
      this.saving = true;
      this.employeeInformationService.updateEmployeeInformation(this.employeeId, payload).subscribe({
        next: () => {
          if (stepIndex === 0) {
            this.basicInfoForm.disable();
            this.isEditingStep[stepIndex] = false;
            this.originalBasicInfo = { ...this.basicInfoForm.value };
          } else if (stepIndex === 1) {
            this.legalContactsInfoForm.disable();
            this.isEditingStep[stepIndex] = false;
            this.originalLegalContactsInfo = { ...this.legalContactsInfoForm.value };
          }
          this.saving = false;
          Swal.fire({
            icon: 'success',
            title: 'Update Successful',
            text: 'Employee information has been updated successfully.',
            timer: 1000,
            showConfirmButton: false
          });
        },
        error: () => {
          this.saving = false;
        }
      });
    } else if (stepIndex === 2) {
      // Handle contract update through employee-contract endpoint
      const contractPayload = this.buildContractPayload();
      this.saving = true;
      
      // Use contract ID if available, otherwise create new contract
      if (this.employeeContractId) {
        this.employeeContractService.updateContract(this.employeeContractId, contractPayload).subscribe({
          next: () => {
            this.contractInfoForm.disable();
            this.isEditingStep[stepIndex] = false;
            this.originalContractInfo = { ...this.contractInfoForm.value };
            this.saving = false;
            Swal.fire({
              icon: 'success',
              title: 'Update Successful',
              text: 'Contract information has been updated successfully.',
              timer: 1000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            this.saving = false;
            console.error('Error updating contract:', error);
            Swal.fire({
              icon: 'error',
              title: 'Update Failed',
              text: 'Failed to update contract information. Please try again.',
            });
          }
        });
      } else {
        // Create new contract if no existing contract ID
        this.employeeContractService.createContract(this.employeeId, contractPayload).subscribe({
          next: () => {
            this.contractInfoForm.disable();
            this.isEditingStep[stepIndex] = false;
            this.originalContractInfo = { ...this.contractInfoForm.value };
            this.saving = false;
            Swal.fire({
              icon: 'success',
              title: 'Create Successful',
              text: 'Contract information has been created successfully.',
              timer: 1000,
              showConfirmButton: false
            });
          },
          error: (createError) => {
            this.saving = false;
            console.error('Error creating contract:', createError);
            Swal.fire({
              icon: 'error',
              title: 'Create Failed',
              text: 'Failed to create contract information. Please try again.',
            });
          }
        });
      }
    } else if (stepIndex === 3) {
      // Combined Allowance, RSSB, and Other Deductions update logic
      // Allowance update (existing logic)
      const allowanceToUpdate = this.employeeAllowances[0];
      const allowancePayload = {
        ...allowanceToUpdate,
        employee_id: this.employeeId
      };
      this.saving = true;
      if (allowanceToUpdate && allowanceToUpdate.id) {
        this.employeeAllowanceService.updateEmployeeAllowance(this.employeeId, allowanceToUpdate.id, allowancePayload).subscribe({
          next: () => {
            this.allowanceForm.disable();
            this.isEditingStep[stepIndex] = false;
            this.originalAllowance = { ...this.allowanceForm.value };
            this.saving = false;
            Swal.fire({
              icon: 'success',
              title: 'Update Successful',
              text: 'Allowance information has been updated successfully.',
              timer: 1000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            this.saving = false;
            console.error('Error updating allowance:', error);
            Swal.fire({
              icon: 'error',
              title: 'Update Failed',
              text: 'Failed to update allowance information. Please try again.',
            });
          }
        });
      } else {
        this.employeeAllowanceService.createEmployeeAllowance(this.employeeId, allowancePayload).subscribe({
          next: () => {
            this.allowanceForm.disable();
            this.isEditingStep[stepIndex] = false;
            this.originalAllowance = { ...this.allowanceForm.value };
            this.saving = false;
            Swal.fire({
              icon: 'success',
              title: 'Create Successful',
              text: 'Allowance information has been created successfully.',
              timer: 1000,
              showConfirmButton: false
            });
          },
          error: (createError) => {
            this.saving = false;
            console.error('Error creating allowance:', createError);
            Swal.fire({
              icon: 'error',
              title: 'Create Failed',
              text: 'Failed to create allowance information. Please try again.',
            });
          }
        });
      }
      // TODO: Add update logic for RSSB and Other Deductions here if needed
    } else if (stepIndex === 4) {
      // Bank Info
      const bankInfoPayload = this.buildBankInfoPayload();
      this.saving = true;
      
      // Use bank info ID if available, otherwise create new bank info
      if (this.employeeBankInfoId) {
        this.employeeBankInfoService.updateEmployeeBankInfo(this.employeeBankInfoId, bankInfoPayload).subscribe({
          next: () => {
            this.bankInfoForm.disable();
            this.isEditingStep[stepIndex] = false;
            this.saving = false;
            Swal.fire({
              icon: 'success',
              title: 'Update Successful',
              text: 'Bank information has been updated successfully.',
              timer: 1000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            this.saving = false;
            console.error('Error updating bank info:', error);
            Swal.fire({
              icon: 'error',
              title: 'Update Failed',
              text: 'Failed to update bank information. Please try again.',
            });
          }
        });
      } else {
        // Create new bank info if no existing bank info ID
        this.employeeBankInfoService.createEmployeeBankInfo(this.employeeId, bankInfoPayload).subscribe({
          next: (response) => {
            // Store the new bank info ID for future updates
            if (response && response.data) {
              this.employeeBankInfoId = response.data.id || '';
            }
            this.bankInfoForm.disable();
            this.isEditingStep[stepIndex] = false;
            this.saving = false;
            Swal.fire({
              icon: 'success',
              title: 'Create Successful',
              text: 'Bank information has been created successfully.',
              timer: 1000,
              showConfirmButton: false
            });
          },
          error: (createError) => {
            this.saving = false;
            console.error('Error creating bank info:', createError);
            Swal.fire({
              icon: 'error',
              title: 'Create Failed',
              text: 'Failed to create bank information. Please try again.',
            });
          }
        });
      }
    } else if (stepIndex === 5) {
      // Address
      const addressPayload = this.buildAddressPayload();
      this.saving = true;
      
      // Use address ID if available, otherwise create new address
      if (this.employeeAddressId) {
        this.employeeAddressService.updateEmployeeAddress(this.employeeAddressId, addressPayload).subscribe({
          next: () => {
            this.employeeAddressForm.disable();
            this.isEditingStep[stepIndex] = false;
            this.originalAddress = { ...this.employeeAddressForm.value };
            this.saving = false;
            Swal.fire({
              icon: 'success',
              title: 'Update Successful',
              text: 'Address information has been updated successfully.',
              timer: 1000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            this.saving = false;
            console.error('Error updating address:', error);
            Swal.fire({
              icon: 'error',
              title: 'Update Failed',
              text: 'Failed to update address information. Please try again.',
            });
          }
        });
      } else {
        // Create new address if no existing address ID
        this.employeeAddressService.createEmployeeAddress(this.employeeId, addressPayload).subscribe({
          next: (response) => {
            // Store the new address ID for future updates
            if (response && response.data) {
              this.employeeAddressId = response.data.id || '';
            }
            this.employeeAddressForm.disable();
            this.isEditingStep[stepIndex] = false;
            this.originalAddress = { ...this.employeeAddressForm.value };
            this.saving = false;
            Swal.fire({
              icon: 'success',
              title: 'Create Successful',
              text: 'Address information has been created successfully.',
              timer: 1000,
              showConfirmButton: false
            });
          },
          error: (createError) => {
            this.saving = false;
            console.error('Error creating address:', createError);
            Swal.fire({
              icon: 'error',
              title: 'Create Failed',
              text: 'Failed to create address information. Please try again.',
            });
          }
        });
      }
    } else if (stepIndex === 6) {
      // Emergency
      const contact = {
        name: this.emergencyContactForm.value.name,
        gender: this.emergencyContactForm.value.gender,
        relationship: this.emergencyContactForm.value.relationship,
        phone: this.emergencyContactForm.value.phone,
        email: this.emergencyContactForm.value.email
      };
      const allEmpty = Object.values(contact).every(v => v === null || v === undefined || v === '');
      if (allEmpty) {
        return;
      }
      this.saving = true;
      // Use update API if contact ID exists, otherwise create
      if (this.employeeEmergencyContactId) {
        this.employeeEmergencyContactService.updateEmployeeEmergencyContact(this.employeeEmergencyContactId, contact).subscribe({
          next: () => {
            this.emergencyContactForm.disable();
            this.isEditingStep[stepIndex] = false;
            this.originalEmergencyContact = { ...this.emergencyContactForm.value };
            this.saving = false;
            Swal.fire({
              icon: 'success',
              title: 'Update Successful',
              text: 'Emergency contact has been updated successfully.',
              timer: 1000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            this.saving = false;
            console.error('Error updating emergency contact:', error);
            Swal.fire({
              icon: 'error',
              title: 'Update Failed',
              text: 'Failed to update emergency contact. Please try again.',
            });
          }
        });
      } else {
        this.employeeEmergencyContactService.createEmployeeEmergencyContact(this.employeeId, contact).subscribe({
          next: () => {
            this.emergencyContactForm.disable();
            this.isEditingStep[stepIndex] = false;
            this.originalEmergencyContact = { ...this.emergencyContactForm.value };
            this.saving = false;
            Swal.fire({
              icon: 'success',
              title: 'Create Successful',
              text: 'Emergency contact has been created successfully.',
              timer: 1000,
              showConfirmButton: false
            });
          },
          error: (createError) => {
            this.saving = false;
            console.error('Error creating emergency contact:', createError);
            Swal.fire({
              icon: 'error',
              title: 'Create Failed',
              text: 'Failed to create emergency contact. Please try again.',
            });
          }
        });
      }
      return;
    } else if (stepIndex === 7) {
      // Documents
      this.submittedDocuments = true;
      
      // Check if required fields are filled
      if (!this.documentsForm.value.document_type_id || !this.employeeId) {
        this.submittedDocuments = false;
        return;
      }
      
      // For new documents, require a file
      if (!this.employeeDocumentId && !this.selectedDocumentFile) {
        this.submittedDocuments = false;
        Swal.fire({
          icon: 'error',
          title: 'Document Required',
          text: 'Please select a document file.',
        });
        return;
      }

      const formData = new FormData();
      formData.append('employee_id', this.employeeId);
      formData.append('document_type_id', this.documentsForm.value.document_type_id);
      formData.append('description', this.documentsForm.value.description || '');
      formData.append('expiration_date', this.documentsForm.value.expiration_date || '');
      
      // Debug logging
      console.log('Document form values:', this.documentsForm.value);
      console.log('Employee ID:', this.employeeId);
      console.log('Document Type ID:', this.documentsForm.value.document_type_id);
      console.log('Selected file:', this.selectedDocumentFile);
      
      // Only append file if a new one is selected
      if (this.selectedDocumentFile) {
        formData.append('document', this.selectedDocumentFile);
      } else if (this.documentsForm.value.document) {
        // If no new file selected but there's an existing document path, keep it
        formData.append('document', this.documentsForm.value.document);
      }

      this.saving = true;
      
      // Use document ID if available, otherwise create new document
      if (this.employeeDocumentId) {
        this.employeeDocumentService.updateEmployeeDocument(this.employeeDocumentId, formData).subscribe({
          next: () => {
            this.documentsForm.disable();
            this.isEditingStep[stepIndex] = false;
            this.originalDocument = { ...this.documentsForm.value };
            this.selectedDocumentFile = null;
            this.submittedDocuments = false;
            this.saving = false;
            Swal.fire({
              icon: 'success',
              title: 'Update Successful',
              text: 'Document information has been updated successfully.',
              timer: 1000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            this.saving = false;
            this.submittedDocuments = false;
            console.error('Error updating document:', error);
            Swal.fire({
              icon: 'error',
              title: 'Update Failed',
              text: 'Failed to update document information. Please try again.',
            });
          }
        });
      } else {
        // Create new document if no existing document ID
        this.employeeDocumentService.createEmployeeDocument(this.employeeId, formData).subscribe({
          next: (response) => {
            // Store the new document ID for future updates
            if (response && response.data) {
              this.employeeDocumentId = response.data.id || '';
            }
            this.documentsForm.disable();
            this.isEditingStep[stepIndex] = false;
            this.originalDocument = { ...this.documentsForm.value };
            this.selectedDocumentFile = null;
            this.submittedDocuments = false;
            this.saving = false;
            Swal.fire({
              icon: 'success',
              title: 'Create Successful',
              text: 'Document information has been created successfully.',
              timer: 1000,
              showConfirmButton: false
            });
          },
          error: (createError) => {
            this.saving = false;
            this.submittedDocuments = false;
            console.error('Error creating document:', createError);
            Swal.fire({
              icon: 'error',
              title: 'Create Failed',
              text: 'Failed to create document information. Please try again.',
            });
          }
        });
      }
    }
  }
  onCancelEditStep(stepIndex: number) {
    if (stepIndex === 0) {
      this.basicInfoForm.patchValue(this.originalBasicInfo);
      this.basicInfoForm.disable();
      this.isEditingStep[stepIndex] = false;
    } else if (stepIndex === 1) {
      this.legalContactsInfoForm.patchValue(this.originalLegalContactsInfo);
      this.legalContactsInfoForm.disable();
      this.isEditingStep[stepIndex] = false;
    } else if (stepIndex === 2) {
      this.contractInfoForm.patchValue(this.originalContractInfo);
      this.contractInfoForm.disable();
      this.isEditingStep[stepIndex] = false;
    } else if (stepIndex === 3) {
      this.allowanceForm.patchValue(this.originalAllowance);
      this.allowanceForm.disable();
      this.isEditingStep[stepIndex] = false;
    } else if (stepIndex === 4) {
      // Restore original deductions
      this.employeeRssbDeductions = [...this.originalRssbDeductions];
      this.employeeOtherDeductions = [...this.originalOtherDeductions];
      this.isEditingStep[stepIndex] = false;
    } else if (stepIndex === 5) {
      // Restore original bank info (you may need to store original bank info)
      this.bankInfoForm.disable();
      this.isEditingStep[stepIndex] = false;
    } else if (stepIndex === 6) {
      // Restore original address
      this.employeeAddressForm.patchValue(this.originalAddress);
      this.employeeAddressForm.disable();
      this.isEditingStep[stepIndex] = false;
    } else if (stepIndex === 7) {
      // Restore original emergency contact
      this.emergencyContactForm.patchValue(this.originalEmergencyContact);
      this.emergencyContactForm.disable();
      this.isEditingStep[stepIndex] = false;
    } else if (stepIndex === 8) {
      // Restore original document
      this.documentsForm.patchValue(this.originalDocument);
      this.documentsForm.disable();
      this.selectedDocumentFile = null;
      this.isEditingStep[stepIndex] = false;
    }
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
    return this.legalContactsInfoForm.controls;
  }

  onLegalInfoNext() {
    this.submittedLegalContactsInfo = true;
    if (this.legalContactsInfoForm.invalid) {
      return;
    }
    if (this.cdkStepper) {
      this.cdkStepper.next();
    }
  }

  get contactInfo() {
    return this.basicInfoForm.controls;
  }

  get bankInfo() {
    return this.bankInfoForm.controls;
  }

  get employeeAddress() {
    return this.employeeAddressForm.controls;
  }

  get emergencyContact() {
    return this.emergencyContactForm.controls;
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

  getDocumentUrl(documentPath: string): string {
    if (!documentPath) return '';
    
    // For now, let's try the most common Laravel storage pattern
    // This assumes documents are stored in the storage/app/public directory
    // and served via a symbolic link to public/storage
    return `${environment.apiUrl.replace('/api', '')}/storage/${documentPath}`;
  }

  onContactInfoSubmit() {
    this.submittedLegalContactsInfo = true;
    if (this.legalContactsInfoForm.invalid) {
      return;
    }
    this.saveEmployee();
  }

  openAddRssbDeductionModal() {
    this.addRssbDeductionForm.reset();
    this.addRssbDeductionModalRef = this.modalService.show(this.addRssbDeductionModal);
  }
  closeAddRssbDeductionModal() {
    if (this.addRssbDeductionModalRef) this.addRssbDeductionModalRef.hide();
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
    const formValue = this.addRssbDeductionForm.getRawValue();
    const deduction = this.rssbDeductions.find(d => d.id === formValue.rssb_deduction_id);
    if (deduction) {
      this.employeeRssbDeductions.push({
        rssb_name: deduction.rssb_name,
        rssb_employee_contribution: formValue.employee_contribution,
        rssb_employer_contribution: formValue.employer_contribution
      });
      this.closeAddRssbDeductionModal();
    }
  }
  removeRssbDeduction(index: number) {
    this.employeeRssbDeductions.splice(index, 1);
  }

  openAddOtherDeductionModal() {
    this.addOtherDeductionForm.reset();
    this.addOtherDeductionModalRef = this.modalService.show(this.addOtherDeductionModal);
  }
  closeAddOtherDeductionModal() {
    if (this.addOtherDeductionModalRef) this.addOtherDeductionModalRef.hide();
  }
  onOtherDeductionSelected() {
    // Optionally handle deduction selection logic
  }
  addOtherDeduction() {
    const formValue = this.addOtherDeductionForm.value;
    const deduction = this.otherDeductions.find(d => d.id === formValue.deduction_id);
    if (deduction) {
      this.employeeOtherDeductions.push({
        description: formValue.description,
        amount: formValue.amount,
        type: formValue.type,
        deduction_id: formValue.deduction_id
      });
      this.closeAddOtherDeductionModal();
    }
  }
  removeOtherDeduction(index: number) {
    this.employeeOtherDeductions.splice(index, 1);
  }

  openEditOtherDeductionModal(deduction: any, index: number) {
    this.editingDeductionIndex = index;
    this.editOtherDeductionForm.patchValue({
      id: deduction.id,
      description: deduction.description || '',
      amount: deduction.amount,
      type: deduction.type,
      deduction_id: deduction.deduction_id,
      employee_id: this.employeeId
    });
    this.editOtherDeductionModalRef = this.modalService.show(this.editOtherDeductionModal);
  }

  closeEditOtherDeductionModal() {
    if (this.editOtherDeductionModalRef) this.editOtherDeductionModalRef.hide();
    this.editingDeductionIndex = -1;
  }

  updateOtherDeduction() {
    if (this.editOtherDeductionForm.invalid) return;

    const formValue = this.editOtherDeductionForm.value;
    const deductionId = formValue.id;

    if (!deductionId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Deduction ID is missing. Cannot update.',
      });
      return;
    }

    this.saving = true;
    this.employeeDeductionService.updateEmployeeDeduction(deductionId, formValue).subscribe({
      next: (response) => {
        // Update the local array with the response data
        if (this.editingDeductionIndex >= 0 && this.editingDeductionIndex < this.employeeOtherDeductions.length) {
          this.employeeOtherDeductions[this.editingDeductionIndex] = {
            ...response,
            description: formValue.description,
            amount: formValue.amount,
            type: formValue.type,
            deduction_id: formValue.deduction_id
          };
        }
        
        this.closeEditOtherDeductionModal();
        this.saving = false;
        
        Swal.fire({
          icon: 'success',
          title: 'Update Successful',
          text: 'Deduction has been updated successfully.',
          timer: 1000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        this.saving = false;
        console.error('Error updating deduction:', error);
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'Failed to update deduction. Please try again.',
        });
      }
    });
  }

  // Helper to build a clean payload for the update API
  private buildFullEmployeePayload(): any {
    const basic = this.basicInfoForm.value;
    const legal = this.legalContactsInfoForm.value;
    return {
      id: this.employeeId,
      salutation: basic.salutation || 'mr',
      first_name: basic.firstName,
      last_name: basic.lastName,
      gender: basic.gender,
      date_of_birth: basic.dateOfBirth,
      nationality: basic.nationality, // ID only
      country_of_birth: basic.countryOfBirth, // ID only
      marital_status: basic.maritalStatus,
      name_of_spouse: basic.spouseName,
      number_of_children: basic.numberOfChildren,
      personal_mobile: basic.personalMobile,
      personal_email: basic.personalEmail,
      home_phone: basic.homePhone,
      document_type: legal.documentType,
      document_number: legal.documentNumber,
      document_issue_date: legal.documentIssueDate,
      document_expiry_date: legal.documentExpiryDate,
      document_place_of_issue: legal.placeOfIssue,
      rssb_number: legal.rssbNumber,
      highest_education: legal.highestEducation,
      // Add any other required fields, but DO NOT include the full country object!
    };
  }

  // Helper to build contract payload separately
  private buildContractPayload(): any {
    const contract = this.contractInfoForm.value;
    return {
      employee_id: this.employeeId,
      department: contract.department,
      job_title: contract.job_title,
      employment_type: contract.employment_type,
      hire_date: contract.hire_date,
      end_date: contract.end_date,
      salary_basis: contract.salary_basis,
      salary_amount: contract.salary_amount,
      salary_frequency: contract.salary_frequency,
      tin_number: contract.tin_number,
    };
  }

  // Helper to build allowance payload separately
  private buildAllowancePayload(): any {
    const allowance = this.allowanceForm.value;
    return {
      employee_id: this.employeeId,
      amount: allowance.amount,
      type: allowance.type,
      allowance_id: allowance.allowance_id,
      description: allowance.description,
    };
  }

  // Helper to build bank info payload separately
  private buildBankInfoPayload(): any {
    const bankInfo = this.bankInfoForm.value;
    return {
      employee_id: this.employeeId,
      bank_name: bankInfo.bank_name,
      account_number: bankInfo.account_number,
      account_name: bankInfo.account_name,
      iban: bankInfo.iban,
      swift_code: bankInfo.swift_code
    };
  }

  // Helper to build address payload separately
  private buildAddressPayload(): any {
    const address = this.employeeAddressForm.value;
    return {
      employee_id: this.employeeId,
      type: address.type,
      country: address.country,
      province: address.province,
      district: address.district,
      sector: address.sector,
      cell: address.cell,
      village: address.village,
      city: address.city,
      additional_address: address.additional_address,
      postal_code: address.postal_code,
      street_address: address.street_address
    };
  }

  // Helper to build emergency contact payload separately
  private buildEmergencyContactPayload(): any {
    const emergencyContact = this.emergencyContactForm.value;
    return {
      employee_id: this.employeeId,
      name: emergencyContact.name,
      gender: emergencyContact.gender,
      relationship: emergencyContact.relationship,
      phone: emergencyContact.phone,
      email: emergencyContact.email
    };
  }

  loadAllowances() {
    this.allowanceService.getAllowances().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.allowances = response.data;
          if (this.employeeId) {
            this.loadEmployeeAllowances();
          }
        }
      },
      error: (error) => {
        console.error('Error loading allowances:', error);
      }
    });
  }

  loadRssbDeductions() {
    this.deductionsService.getRssbDeductions().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.rssbDeductions = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading RSSB deductions:', error);
      }
    });
  }

  loadOtherDeductions() {
    this.otherDeductionsService.getOtherDeductions().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.otherDeductions = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading other deductions:', error);
      }
    });
  }

  loadEmployeeAllowances() {
    this.employeeAllowanceService.getEmployeeAllowances(this.employeeId).subscribe({
      next: (response: any) => {
        const data = response && response.data ? response.data : [];
        this.employeeAllowances = data.map((a: any) => {
          const found = this.allowances.find(alw => String(alw.id) === String(a.allowance_id));
          return {
            ...a,
            allowance_name: found ? (found.name || found.allowance_name) : a.allowance_id
          };
        });
      },
      error: (error) => {
        console.error('Error loading employee allowances:', error);
        this.employeeAllowances = [];
      }
    });
  }

  loadEmployeeBankInfo() {
    this.employeeBankInfoService.getEmployeeBankInfo(this.employeeId).subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.length > 0) {
          // Take the first bank info record (assuming one bank account per employee)
          const bankInfo = response.data[0];
          this.bankInfoForm.patchValue({
            bank_name: bankInfo.bank_name || '',
            account_number: bankInfo.account_number || '',
            account_name: bankInfo.account_name || '',
            iban: bankInfo.iban || '',
            swift_code: bankInfo.swift_code || ''
          });
          // Store the bank info ID for updates
          this.employeeBankInfoId = bankInfo.id || '';
        }
      },
      error: (error) => {
        console.error('Error loading employee bank info:', error);
      }
    });
  }

  loadEmployeeAddress() {
    this.employeeAddressService.getEmployeeAddresses(this.employeeId).subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.length > 0) {
          // Take the first address record (assuming one address per employee)
          const address = response.data[0];
          this.employeeAddressForm.patchValue({
            type: address.type || '',
            country: typeof address.country === 'object' ? address.country.id : address.country || '',
            province: typeof address.province === 'object' ? address.province.id : address.province || '',
            district: typeof address.district === 'object' ? address.district.id : address.district || '',
            sector: typeof address.sector === 'object' ? address.sector.id : address.sector || '',
            cell: typeof address.cell === 'object' ? address.cell.id : address.cell || '',
            village: typeof address.village === 'object' ? address.village.id : address.village || '',
            city: address.city || '',
            additional_address: address.additional_address || '',
            postal_code: address.postal_code || '',
            street_address: address.street_address || ''
          });
          // Store the address ID for updates
          this.employeeAddressId = address.id || '';
          this.originalAddress = { ...this.employeeAddressForm.value };
          
          // Load cascading location data for existing values
          this.loadCascadingLocationData(address);
        }
      },
      error: (error) => {
        console.error('Error loading employee address:', error);
      }
    });
  }

  loadCascadingLocationData(address: any) {
    // Load provinces first
    this.localizationService.getLocalizations(0).subscribe({
      next: (data: any) => {
        this.provinces = data.data || [];
        
        // If province exists, load districts
        const provinceId = typeof address.province === 'object' ? address.province.id : address.province;
        if (provinceId) {
          this.localizationService.getLocalizations(provinceId).subscribe({
            next: (districtData: any) => {
              this.districts = districtData.data || [];
              
              // If district exists, load sectors
              const districtId = typeof address.district === 'object' ? address.district.id : address.district;
              if (districtId) {
                this.localizationService.getLocalizations(districtId).subscribe({
                  next: (sectorData: any) => {
                    this.sectors = sectorData.data || [];
                    
                    // If sector exists, load cells
                    const sectorId = typeof address.sector === 'object' ? address.sector.id : address.sector;
                    if (sectorId) {
                      this.localizationService.getLocalizations(sectorId).subscribe({
                        next: (cellData: any) => {
                          this.cells = cellData.data || [];
                          
                          // If cell exists, load villages
                          const cellId = typeof address.cell === 'object' ? address.cell.id : address.cell;
                          if (cellId) {
                            this.localizationService.getLocalizations(cellId).subscribe({
                              next: (villageData: any) => {
                                this.villages = villageData.data || [];
                              }
                            });
                          }
                        }
                      });
                    }
                  }
                });
              }
            }
          });
        }
      }
    });
  }

  loadLocationData() {
    // Load provinces
    this.localizationService.getLocalizations(0).subscribe({
      next: (data: any) => {
        this.provinces = data.data || [];
      }
    });
  }

  loadEmployeeEmergencyContact() {
    this.employeeEmergencyContactService.getEmployeeEmergencyContacts(this.employeeId).subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.length > 0) {
          // Take the first emergency contact record (assuming one emergency contact per employee)
          const emergencyContact = response.data[0];
          this.emergencyContactForm.patchValue({
            name: emergencyContact.name || '',
            gender: emergencyContact.gender || '',
            relationship: emergencyContact.relationship || '',
            phone: emergencyContact.phone || '',
            email: emergencyContact.email || ''
          });
          // Store the emergency contact ID for updates
          this.employeeEmergencyContactId = emergencyContact.id || '';
          this.originalEmergencyContact = { ...this.emergencyContactForm.value };
        }
      },
      error: (error) => {
        console.error('Error loading employee emergency contact:', error);
      }
    });
  }

  loadEmployeeDocuments() {
    this.employeeDocumentService.getEmployeeDocuments(this.employeeId).subscribe({
      next: (response: any) => {
        console.log('Document loading response:', response);
        if (response && response.data && response.data.length > 0) {
          // Take the first document record (assuming one document per employee)
          const document = response.data[0];
          console.log('Document data:', document);
          this.documentsForm.patchValue({
            document_type_id: document.document_type_id || '',
            document: document.document_path || '', // Use document_path instead of document
            description: document.description || '',
            expiration_date: document.expiration_date || ''
          });
          // Store the document ID for updates
          this.employeeDocumentId = document.id || '';
          this.originalDocument = { ...this.documentsForm.value };
          console.log('Form patched with:', this.documentsForm.value);
        }
      },
      error: (error) => {
        console.error('Error loading employee documents:', error);
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

  // Helper method to get deduction name from deduction ID
  getDeductionName(deductionId: string): string {
    if (!deductionId) return '';
    const deduction = this.otherDeductions.find(d => d.id === deductionId);
    return deduction ? deduction.deduction_name : deductionId;
  }

  // Helper method to get country name from country ID
  getCountryName(countryId: string): string {
    if (!countryId) return '';
    const country = this.countries.find(c => c.id === countryId);
    return country ? country.country : countryId;
  }

  // Helper method to get department name from department ID
  getDepartmentName(departmentId: string): string {
    if (!departmentId) return '';
    const department = this.departments.find(d => d.id === departmentId);
    return department ? department.name : departmentId;
  }

  // Helper method to get allowance name from allowance ID
  getAllowanceName(allowanceId: string): string {
    if (!allowanceId) return '';
    const allowance = this.allowances.find(
      a => String(a.id) === String(allowanceId)
    );
    if (!allowance) {
      console.warn('Allowance not found for id:', allowanceId, 'in', this.allowances);
    }
    // Cast to any to avoid linter error for allowance_name
    return allowance ? (allowance.name || (allowance as any).allowance_name || allowanceId) : allowanceId;
  }

  // Helper method to get document type name from document type ID
  getDocumentTypeName(documentTypeId: string): string {
    if (!documentTypeId) return '';
    const documentType = this.documentTypes.find(d => d.value === documentTypeId);
    return documentType ? documentType.label : documentTypeId;
  }

  onAllowanceSubmit() {
    this.submittedAllowance = true;
    if (this.allowanceForm.invalid) {
      return;
    }
    const allowanceData = { ...this.allowanceForm.value };
    const selectedAllowance = this.allowances.find(a => String(a.id) === String(allowanceData.allowance_id));
    if (this.editingAllowanceIndex !== null && this.editingAllowanceIndex > -1) {
      // Update in array
      const existing = this.employeeAllowances[this.editingAllowanceIndex];
      if (existing && existing.id) {
        this.saving = true;
        this.employeeAllowanceService.updateEmployeeAllowance(this.employeeId, existing.id, allowanceData).subscribe({
          next: () => {
            this.employeeAllowances[this.editingAllowanceIndex!] = { ...existing, ...allowanceData, id: existing.id, allowance_name: selectedAllowance ? (selectedAllowance.name || selectedAllowance.allowance_name) : '' };
            this.allowanceForm.patchValue(this.employeeAllowances[this.editingAllowanceIndex!]);
            this.saving = false;
            this.closeAddAllowanceModal();
            this.submittedAllowance = false;
            this.editingAllowanceIndex = null;
          },
          error: () => {
            this.saving = false;
          }
        });
        return;
      }
      this.employeeAllowances[this.editingAllowanceIndex] = { ...allowanceData, allowance_name: selectedAllowance ? (selectedAllowance.name || selectedAllowance.allowance_name) : '' };
      this.allowanceForm.patchValue(allowanceData);
      this.editingAllowanceIndex = null;
    } else {
      this.employeeAllowances.push({ ...allowanceData, allowance_name: selectedAllowance ? (selectedAllowance.name || selectedAllowance.allowance_name) : '' });
      this.allowanceForm.patchValue(allowanceData);
    }
    this.closeAddAllowanceModal();
    this.submittedAllowance = false;
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

  editAllowance(index: number) {
    const allowance = this.employeeAllowances[index];
    this.allowanceForm.patchValue({
      name: allowance.name || '',
      amount: allowance.amount || '',
      type: allowance.type || '',
      allowance_id: allowance.allowance_id || '',
      description: allowance.description || ''
    });
    this.editingAllowanceIndex = index;
    this.openAddAllowanceModal();
  }

  onEmergencyContactSubmit() {
    const contact = {
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
    console.log('Submitting emergency contact:', contact);
    this.saving = true;
    this.employeeEmergencyContactService.createEmployeeEmergencyContact(this.employeeId, contact).subscribe({
      next: (res) => {
        this.saving = false;
        // Optionally go to next section or show success
        if (this.cdkStepper) {
          this.cdkStepper.next();
        }
      },
      error: (err) => {
        this.saving = false;
        // Error interceptor will handle errors
      }
    });
  }
}
