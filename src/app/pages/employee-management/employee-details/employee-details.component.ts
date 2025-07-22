import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployeeInformationService } from 'src/app/core/services/employee-information.service';
import { EmployeeRssbContributionService } from 'src/app/core/services/employee-rssb-contribution.service';
import { EmployeeAllowanceService } from 'src/app/core/services/employee-allowance.service';
import { DeductionsService } from 'src/app/core/services/deductions.service';
import { OtherDeductionsService } from 'src/app/core/services/other-deductions.service';
import { DepartmentService } from 'src/app/core/services/department.service';
import { AllowanceService } from 'src/app/core/services/allowance.service';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { LocalizationService } from 'src/app/core/services/localization.service';
import { EmployeeDeductionService } from 'src/app/core/services/employee-deduction.service';
import { EmployeeBankInfoService } from 'src/app/core/services/employee-bank-info.service';
import { EmployeeAddressService } from 'src/app/core/services/employee-address.service';
import { EmployeeEmergencyContactService } from 'src/app/core/services/employee-emergency-contact.service';
import { EmployeeDocumentService } from 'src/app/core/services/employee-document.service';

@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.scss']
})
export class EmployeeDetailsComponent implements OnInit {
  employeeId: string = '';
  employee: any = null;
  employeeRssbDeductions: any[] = [];
  employeeOtherDeductions: any[] = [];
  employeeAllowances: any[] = [];
  allowances: any[] = [];
  departments: any[] = [];
  otherDeductions: any[] = [];
  rssbDeductions: any[] = [];
  isLoading = true;
  employeeBankInfo: any = null;
  employeeAddress: any = null;
  employeeEmergencyContact: any = null;
  employeeDocument: any = null;
  documentTypes: any[] = [];

  // For displaying forms as read-only
  basicInfoForm!: UntypedFormGroup;
  legalContactsInfoForm!: UntypedFormGroup;
  contractInfoForm!: UntypedFormGroup;
  bankInfoForm!: UntypedFormGroup;
  employeeAddressForm!: UntypedFormGroup;
  emergencyContactForm!: UntypedFormGroup;
  documentsForm!: UntypedFormGroup;

  countries: any[] = [];
  provinces: any[] = [];
  districts: any[] = [];
  sectors: any[] = [];
  cells: any[] = [];
  villages: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private employeeInformationService: EmployeeInformationService,
    private employeeRssbContributionService: EmployeeRssbContributionService,
    private employeeAllowanceService: EmployeeAllowanceService,
    private deductionsService: DeductionsService,
    private otherDeductionsService: OtherDeductionsService,
    private departmentService: DepartmentService,
    private allowanceService: AllowanceService,
    private fb: FormBuilder,
    private localizationService: LocalizationService,
    private employeeDeductionService: EmployeeDeductionService,
    private employeeBankInfoService: EmployeeBankInfoService,
    private employeeAddressService: EmployeeAddressService,
    private employeeEmergencyContactService: EmployeeEmergencyContactService,
    private employeeDocumentService: EmployeeDocumentService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.employeeId = params.get('id')!;
      if (this.employeeId) {
        this.fetchEmployeeDetails();
      }
    });
    this.fetchCountries();
    this.loadProvinces();
    // Fetch document types
    this.employeeDocumentService.getDocumentTypes().subscribe({
      next: (res: any) => {
        if (res && Array.isArray(res.data)) {
          this.documentTypes = res.data.map((item: any) => ({ label: item.label, value: item.id }));
        } else {
          this.documentTypes = [];
        }
      },
      error: () => {
        this.documentTypes = [];
      }
    });
  }

  fetchEmployeeDetails() {
    this.isLoading = true;
    this.employeeInformationService.getEmployeeById(this.employeeId).subscribe((employee: any) => {
      this.employee = employee;
      this.initForms(employee);
      this.isLoading = false;
    });
    this.employeeRssbContributionService.getEmployeeRssbContributions(this.employeeId).subscribe({
      next: (response: any) => {
        this.employeeRssbDeductions = (response.data || []).map((ded: any) => ({
          ...ded,
          rssb_name: ded.rssb_deductions?.rssb_name || '',
          rssb_description: ded.rssb_deductions?.rssb_description || ''
        }));
      }
    });
    this.employeeAllowanceService.getEmployeeAllowances(this.employeeId).subscribe({
      next: (response: any) => {
        const data = response && response.data ? response.data : [];
        this.employeeAllowances = data;
      }
    });
    this.employeeDeductionService.getEmployeeDeductions(this.employeeId).subscribe({
      next: (response: any) => {
        this.employeeOtherDeductions = response.data || [];
      }
    });
    this.deductionsService.getRssbDeductions().subscribe({
      next: (data: any) => {
        this.rssbDeductions = Array.isArray(data) ? data : (data.data || []);
      }
    });
    this.otherDeductionsService.getOtherDeductions().subscribe({
      next: (data: any) => {
        this.otherDeductions = Array.isArray(data) ? data : (data.data || []);
      }
    });
    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      }
    });
    this.allowanceService.getAllowances().subscribe({
      next: (response: any) => {
        this.allowances = response.data || [];
      }
    });
    this.employeeBankInfoService.getEmployeeBankInfo(this.employeeId).subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.length > 0) {
          this.employeeBankInfo = response.data[0];
        }
      }
    });
    // Fetch address and load full localization hierarchy
    if (this.employee && this.employee.address) {
      this.employeeAddress = this.employee.address;
      // Load provinces (top level)
      this.localizationService.getLocalizations(0).subscribe({
        next: (provData: any) => {
          this.provinces = provData.data || [];
          const provinceId = typeof this.employee.address.province === 'object' ? this.employee.address.province.id : this.employee.address.province;
          if (provinceId) {
            this.localizationService.getLocalizations(provinceId).subscribe({
              next: (districtData: any) => {
                this.districts = districtData.data || [];
                const districtId = typeof this.employee.address.district === 'object' ? this.employee.address.district.id : this.employee.address.district;
                if (districtId) {
                  this.localizationService.getLocalizations(districtId).subscribe({
                    next: (sectorData: any) => {
                      this.sectors = sectorData.data || [];
                      const sectorId = typeof this.employee.address.sector === 'object' ? this.employee.address.sector.id : this.employee.address.sector;
                      if (sectorId) {
                        this.localizationService.getLocalizations(sectorId).subscribe({
                          next: (cellData: any) => {
                            this.cells = cellData.data || [];
                            const cellId = typeof this.employee.address.cell === 'object' ? this.employee.address.cell.id : this.employee.address.cell;
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
    this.employeeEmergencyContactService.getEmployeeEmergencyContacts(this.employeeId).subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.length > 0) {
          this.employeeEmergencyContact = response.data[0];
        }
      }
    });
    this.employeeDocumentService.getEmployeeDocuments(this.employeeId).subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.length > 0) {
          this.employeeDocument = response.data[0];
        }
      }
    });
  }

  // Initialize forms for display only (all controls disabled)
  initForms(employee: any) {
    this.basicInfoForm = this.fb.group({
      salutation: [{ value: employee.salutation, disabled: true }],
      firstName: [{ value: employee.first_name, disabled: true }],
      lastName: [{ value: employee.last_name, disabled: true }],
      gender: [{ value: employee.gender, disabled: true }],
      dateOfBirth: [{ value: employee.date_of_birth, disabled: true }],
      nationality: [{ value: employee.nationality, disabled: true }],
      countryOfBirth: [{ value: employee.country_of_birth, disabled: true }],
      maritalStatus: [{ value: employee.marital_status, disabled: true }],
      spouseName: [{ value: employee.name_of_spouse, disabled: true }],
      numberOfChildren: [{ value: employee.number_of_children, disabled: true }],
      personalMobile: [{ value: employee.personal_mobile, disabled: true }],
      personalEmail: [{ value: employee.personal_email, disabled: true }],
      homePhone: [{ value: employee.home_phone, disabled: true }],
    });
    // Add similar initialization for other forms as needed
  }

  fetchCountries() {
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
      error: () => {
        this.countries = [];
      }
    });
  }

  loadProvinces() {
    this.localizationService.getLocalizations(0).subscribe({
      next: (data: any) => {
        this.provinces = data.data || [];
      }
    });
  }

  loadDistricts(provinceId: number) {
    this.localizationService.getLocalizations(provinceId).subscribe({
      next: (data: any) => {
        this.districts = data.data || [];
      }
    });
  }

  loadSectors(districtId: number) {
    this.localizationService.getLocalizations(districtId).subscribe({
      next: (data: any) => {
        this.sectors = data.data || [];
      }
    });
  }

  loadCells(sectorId: number) {
    this.localizationService.getLocalizations(sectorId).subscribe({
      next: (data: any) => {
        this.cells = data.data || [];
      }
    });
  }

  loadVillages(cellId: number) {
    this.localizationService.getLocalizations(cellId).subscribe({
      next: (data: any) => {
        this.villages = data.data || [];
      }
    });
  }

  // Helper methods for display
  getCountryName(countryId: string): string {
    if (!countryId) return '';
    const country = this.countries.find(c => c.id === countryId);
    return country ? country.country : countryId;
  }
  getProvinceName(provinceId: string): string {
    if (!provinceId) return '';
    const province = this.provinces.find(p => p.id === provinceId);
    return province ? province.name : provinceId;
  }
  getDistrictName(districtId: string): string {
    if (!districtId) return '';
    const district = this.districts.find(d => d.id === districtId);
    return district ? district.name : districtId;
  }
  getSectorName(sectorId: string): string {
    if (!sectorId) return '';
    const sector = this.sectors.find(s => s.id === sectorId);
    return sector ? sector.name : sectorId;
  }
  getCellName(cellId: string): string {
    if (!cellId) return '';
    const cell = this.cells.find(c => c.id === cellId);
    return cell ? cell.name : cellId;
  }
  getVillageName(villageId: string): string {
    if (!villageId) return '';
    const village = this.villages.find(v => v.id === villageId);
    return village ? village.name : villageId;
  }

  getDepartmentName(departmentId: string): string {
    if (!departmentId) return '';
    const department = this.departments.find(d => d.id === departmentId);
    return department ? department.name : departmentId;
  }

  getDeductionName(deductionId: string): string {
    if (!deductionId) return '';
    const deduction = this.otherDeductions.find(d => d.id === deductionId);
    return deduction ? deduction.deduction_name : deductionId;
  }

  getAllowanceName(allowanceId: string): string {
    if (!allowanceId) return '';
    const allowance = this.allowances.find(a => String(a.id) === String(allowanceId));
    return allowance ? (allowance.name || allowance.allowance_name) : allowanceId;
  }

  getDocumentTypeName(documentTypeId: string): string {
    if (!documentTypeId) return '';
    const docType = this.documentTypes.find(d => d.value === documentTypeId);
    return docType ? docType.label : documentTypeId;
  }

  getSalaryBasisLabel(value: string): string {
    switch (value) {
      case 'net': return 'Net Salary';
      case 'gross': return 'Gross Salary';
      case 'mass': return 'Mass Salary';
      default: return value;
    }
  }
} 