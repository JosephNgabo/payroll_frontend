// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-other-deductions',
//   templateUrl: './other-deductions.component.html',
//   styleUrls: ['./other-deductions.component.scss']
// })
// export class OtherDeductionsComponent {} 
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OtherDeductionsService, CreateOtherDeductionDto } from '../../../core/services/other-deductions.service';
import { OtherDeduction, PaginatedOtherDeductions } from '../../../core/models/other-deduction.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-other-deductions',
  templateUrl: './other-deductions.component.html',
  styleUrls: ['./other-deductions.component.scss']
})
export class OtherDeductionsComponent implements OnInit {
  deductions: OtherDeduction[] = [];
  paginatedData: PaginatedOtherDeductions | null = null;
  isLoading = false;
  error: string | null = null;
  term: string = '';
  breadCrumbItems: Array<{}> = [
    { label: 'Configuration' },
    { label: 'Other Deductions', active: true }
  ];
  selectedDeduction: OtherDeduction | null = null;
  modalRef: any;

  deductionForm: FormGroup;
  submitted = false;
  isEdit = false;
  selectedDeductionId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private deductionsService: OtherDeductionsService,
    private modalService: NgbModal
  ) {
    this.deductionForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      has_tax: [false],
      rate: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadDeductions();
  }

  loadDeductions(page: number = 1) {
    this.isLoading = true;
    this.error = null;
    this.deductionsService.getOtherDeductions(page).subscribe({
      next: (data) => {
        this.paginatedData = data;
        this.deductions = data.data;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load other deductions. Please try again later.';
        this.isLoading = false;
        console.error('Error loading other deductions:', error);
      }
    });
  }

  searchDeductions() {
    if (!this.term) {
      this.deductions = this.paginatedData ? [...this.paginatedData.data] : [];
      return;
    }
    const lowerTerm = this.term.toLowerCase();
    this.deductions = (this.paginatedData ? this.paginatedData.data : []).filter(deduction =>
      deduction.deduction_name.toLowerCase().includes(lowerTerm) ||
      deduction.deduction_description.toLowerCase().includes(lowerTerm)
    );
  }

  openViewModal(content: any, deduction: OtherDeduction) {
    this.selectedDeduction = deduction;
    this.modalRef = this.modalService.open(content, { size: 'lg' });
  }

  openModal(content: any, deduction?: OtherDeduction) {
    this.submitted = false;
    this.isEdit = !!deduction;
    this.selectedDeductionId = deduction ? deduction.id : null;
    if (this.isEdit && deduction) {
      this.deductionForm.patchValue({
        name: deduction.deduction_name,
        description: deduction.deduction_description,
        has_tax: !!deduction.has_tax,
        rate: Number(deduction.tax_rate) * 100 // convert decimal to percent
      });
    } else {
      this.deductionForm.reset({ has_tax: false, rate: null });
    }
    this.modalService.open(content, { size: 'lg' });
  }

  onSubmit() {
    this.submitted = true;
    if (this.deductionForm.invalid) {
      return;
    }
    const raw = this.deductionForm.value;
    const formData: CreateOtherDeductionDto = {
      name: raw.name,
      description: raw.description,
      has_tax: raw.has_tax ? 1 : 0,
      rate: raw.rate / 100
    };
    console.log('Sending payload:', formData);
    if (this.isEdit && this.selectedDeductionId) {
      this.deductionsService.updateOtherDeduction(this.selectedDeductionId, formData).subscribe({
        next: () => {
          this.modalService.dismissAll();
          this.loadDeductions();
          this.isEdit = false;
          this.selectedDeductionId = null;
        },
        error: (error) => {
          this.error = 'Failed to update deduction. Please try again.';
          console.error('Error updating deduction:', error);
        }
      });
    } else {
      this.deductionsService.createOtherDeduction(formData).subscribe({
        next: () => {
          this.modalService.dismissAll();
          this.loadDeductions();
        },
        error: (error) => {
          this.error = 'Failed to create deduction. Please try again.';
          console.error('Error creating deduction:', error);
        }
      });
    }
  }

  confirm(id: string, modalTemplate: any) {
    this.selectedDeductionId = id;
    this.modalService.open(modalTemplate, { centered: true });
  }

  deleteDeduction(id: string | null) {
    if (!id) return;
    this.deductionsService.deleteOtherDeduction(id).subscribe({
      next: () => {
        this.modalService.dismissAll();
        this.loadDeductions();
      },
      error: (error) => {
        this.error = 'Failed to delete deduction. Please try again.';
        console.error('Error deleting deduction:', error);
      }
    });
  }

  // Convenience getter for easy access to form fields
  get f() { return this.deductionForm.controls; }
} 