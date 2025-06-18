import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeductionsService, Deduction } from '../../core/services/deductions.service';
import { ToastrService } from 'ngx-toastr';

interface DeductionWithState extends Deduction {
  state: boolean;
}

@Component({
  selector: 'app-deductions',
  templateUrl: './deductions.component.html',
  styleUrls: ['./deductions.component.scss']
})
export class DeductionsComponent implements OnInit {
  deductions: DeductionWithState[] = [];
  deductionForm: FormGroup;
  submitted = false;
  isEdit = false;
  selectedDeductionId: number | null = null;
  selectedDeduction: Deduction | null = null;
  term: string = '';
  masterSelected: boolean = false;
  modalRef: any;
  breadCrumbItems: Array<{}>;
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private deductionsService: DeductionsService,
    private toastr: ToastrService
  ) {
    this.deductionForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      fixedValue: [0, [Validators.min(0)]],
      percentageValue: [0, [Validators.min(0), Validators.max(100)]],
      isTaxApplied: [false],
      taxPercentage: [0, [Validators.min(0), Validators.max(100)]]
    }, { validator: this.valueValidator });

    this.breadCrumbItems = [
      { label: 'Configuration' },
      { label: 'Deductions Management', active: true }
    ];
  }

  // Custom validator to ensure only one value type is filled
  valueValidator(group: FormGroup) {
    const fixedValue = group.get('fixedValue')?.value;
    const percentageValue = group.get('percentageValue')?.value;

    if (fixedValue > 0 && percentageValue > 0) {
      return { bothValuesPresent: true };
    }
    return null;
  }

  ngOnInit(): void {
    this.loadDeductions();
  }

  loadDeductions() {
    this.isLoading = true;
    this.error = null;
    
    this.deductionsService.getDeductions().subscribe({
      next: (data) => {
        this.deductions = data.map(deduction => ({
          ...deduction,
          state: false
        }));
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load deductions. Please try again later.';
        this.isLoading = false;
        this.toastr.error('Error loading deductions', 'Error');
        console.error('Error loading deductions:', error);
      }
    });
  }

  openModal(content: any, deduction?: Deduction) {
    this.submitted = false;
    this.isEdit = !!deduction;
    this.selectedDeductionId = deduction?.id || null;

    if (this.isEdit && deduction) {
      this.deductionForm.patchValue({
        name: deduction.name,
        description: deduction.description,
        fixedValue: deduction.fixedValue,
        percentageValue: deduction.percentageValue,
        isTaxApplied: deduction.isTaxApplied,
        taxPercentage: deduction.taxPercentage
      });
    } else {
      this.deductionForm.reset({
        fixedValue: 0,
        percentageValue: 0,
        isTaxApplied: false,
        taxPercentage: 0
      });
    }

    this.modalService.open(content, { size: 'lg' });
  }

  openViewModal(content: any, deduction: Deduction) {
    this.selectedDeduction = deduction;
    this.modalRef = this.modalService.open(content, { size: 'lg' });
  }

  confirm(id: number) {
    this.selectedDeductionId = id;
    this.modalService.open('removeItemModal', { centered: true });
  }

  onSubmit() {
    this.submitted = true;

    if (this.deductionForm.invalid) {
      return;
    }

    const formData = this.deductionForm.value;
    
    if (this.isEdit && this.selectedDeductionId) {
      this.deductionsService.updateDeduction(this.selectedDeductionId, formData).subscribe({
        next: () => {
          this.toastr.success('Deduction updated successfully', 'Success');
          this.modalService.dismissAll();
          this.loadDeductions();
        },
        error: (error) => {
          this.toastr.error('Error updating deduction', 'Error');
          console.error('Error updating deduction:', error);
        }
      });
    } else {
      this.deductionsService.createDeduction(formData).subscribe({
        next: () => {
          this.toastr.success('Deduction created successfully', 'Success');
          this.modalService.dismissAll();
          this.loadDeductions();
        },
        error: (error) => {
          this.toastr.error('Error creating deduction', 'Error');
          console.error('Error creating deduction:', error);
        }
      });
    }
  }

  deleteDeduction(id: number) {
    this.deductionsService.deleteDeduction(id).subscribe({
      next: () => {
        this.toastr.success('Deduction deleted successfully', 'Success');
        this.modalService.dismissAll();
        this.loadDeductions();
      },
      error: (error) => {
        this.toastr.error('Error deleting deduction', 'Error');
        console.error('Error deleting deduction:', error);
      }
    });
  }

  searchDeductions() {
    if (!this.term) {
      this.loadDeductions();
      return;
    }
    
    this.deductions = this.deductions.filter(deduction => 
      deduction.name.toLowerCase().includes(this.term.toLowerCase()) ||
      deduction.description.toLowerCase().includes(this.term.toLowerCase())
    );
  }

  checkUncheckAll(event: any) {
    this.deductions.forEach(deduction => {
      deduction.state = event.target.checked;
    });
  }

  pagechanged(event: any) {
    // Implement pagination logic here
    console.log('Page changed:', event);
  }

  // Convenience getter for easy access to form fields
  get f() { return this.deductionForm.controls; }
} 